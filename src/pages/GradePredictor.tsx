import { useState, useRef, useEffect } from 'react';
import { useGrades } from '@/hooks/useGrades';
import { useGWASetContext } from '@/contexts/GWASetContext';
import { SUBJECTS } from '@/lib/subjectConfig';
import { calculateFinalGrade, formatGrade } from '@/lib/gradeUtils';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

function buildGradeContext(grades: ReturnType<typeof useGrades>['grades']): string {
  const lines: string[] = [];
  SUBJECTS.forEach(s => {
    const g = grades[s.id];
    const prev = g?.previousGrade;
    const tent = g?.tentativeGrade;
    const final = prev != null && tent != null ? calculateFinalGrade(tent, prev) : null;
    lines.push(`${s.name}: previous=${prev != null ? formatGrade(prev) : 'N/A'}, tentative=${tent != null ? formatGrade(tent) : 'N/A'}, final=${final != null ? final.toFixed(2) : 'N/A'}`);
    lines.push(`  Assessments: ${s.assessments.map(a => `${a.name} (${(a.weight * 100).toFixed(0)}%)`).join(', ')}`);
  });
  return lines.join('\n');
}

export default function GradePredictor() {
  const { activeSetId } = useGWASetContext();
  const { grades } = useGrades(activeSetId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const allMessages = [...messages, userMsg];
    let assistantSoFar = '';

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grade-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          gradeContext: buildGradeContext(grades),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Failed' }));
        toast.error(err.error || 'Something went wrong');
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      <header className="px-5 pt-14 pb-2 text-center shrink-0">
        <div className="inline-flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h1 className="text-3xl text-foreground tracking-tight">Ask AI</h1>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground italic">
          ask about your grades
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center pt-8 space-y-3">
            <span className="text-4xl block">🤖</span>
            <p className="text-sm text-muted-foreground italic">try asking…</p>
            {[
              'What grade do I need in LT2 to get 2.00 in Physics?',
              'Which subjects should I focus on?',
              'If I score 85 in my AA, what will my Chemistry grade be?',
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="block mx-auto text-xs text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl px-4 py-2.5 transition-all active:scale-95"
              >
                "{q}"
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-lg'
                  : 'bg-card card-cute text-card-foreground rounded-bl-lg'
              }`}
            >
              {m.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-card card-cute rounded-2xl px-4 py-3 text-sm text-muted-foreground italic">
              thinking… 💭
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pb-2 pt-1">
        <div className="flex items-center gap-2 rounded-2xl bg-card p-2 card-cute">
          <input
            type="text"
            placeholder="Ask about your grades…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:brightness-105 active:scale-95 transition-all disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
