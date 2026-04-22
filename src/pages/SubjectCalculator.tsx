import { useState } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { percentToGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Settings2, ChevronDown } from 'lucide-react';

interface ScoreItem {
  score: string;
  total: string;
}

interface AssessmentConfig {
  name: string;
  weight: number;
}

interface AssessmentEntry {
  mode: 'single' | 'items';
  single: string;
  items: ScoreItem[];
}

interface SubScores {
  [assessmentName: string]: AssessmentEntry;
}

const defaultEntry = (): AssessmentEntry => ({
  mode: 'items',
  single: '',
  items: [{ score: '', total: '' }],
});

export default function SubjectCalculator() {
  const [selectedId, setSelectedId] = useState(SUBJECTS[0].id);
  const [allScores, setAllScores] = useState<Record<string, SubScores>>({});
  const [bonuses, setBonuses] = useState<Record<string, string>>({});
  const [customAssessments, setCustomAssessments] = useState<Record<string, AssessmentConfig[]>>({});
  const [editingAssessments, setEditingAssessments] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const subject = SUBJECTS.find(s => s.id === selectedId)!;
  const assessments = customAssessments[selectedId] || subject.assessments.map(a => ({ name: a.name, weight: a.weight }));
  const subjectScores = allScores[selectedId] || {};
  const bonus = parseFloat(bonuses[selectedId] || '') || 0;

  const totalWeight = assessments.reduce((s, a) => s + a.weight, 0);

  const getAssessmentData = (name: string, weight: number) => {
    const entry = subjectScores[name] || defaultEntry();
    let totalScore = 0;
    let totalPossible = 0;
    let pctEquivalent: number | null = null;
    let percentage: number | null = null;

    if (entry.mode === 'items') {
      const valid = entry.items.filter(
        i => i.score !== '' && i.total !== '' && !isNaN(Number(i.score)) && !isNaN(Number(i.total)) && Number(i.total) > 0
      );
      if (valid.length > 0) {
        totalScore = valid.reduce((s, i) => s + Number(i.score), 0);
        totalPossible = valid.reduce((s, i) => s + Number(i.total), 0);
        pctEquivalent = totalScore / totalPossible;
        percentage = pctEquivalent * (weight * 100);
      }
    } else {
      if (entry.single && !isNaN(parseFloat(entry.single))) {
        pctEquivalent = parseFloat(entry.single) / 100;
        percentage = pctEquivalent * (weight * 100);
      }
    }

    return { entry, totalScore, totalPossible, pctEquivalent, percentage, rawScore: totalPossible > 0 ? `${totalScore}/${totalPossible}` : '—' };
  };

  const assessmentData = assessments.map(a => ({ ...a, ...getAssessmentData(a.name, a.weight) }));
  const allFilled = assessmentData.every(a => a.pctEquivalent !== null);
  const subtotal = allFilled ? assessmentData.reduce((sum, a) => sum + a.percentage!, 0) : null;
  const total = subtotal !== null ? subtotal + bonus : null;
  const tentativeGrade = total !== null ? percentToGrade(total) : null;

  const updateEntry = (name: string, update: Partial<AssessmentEntry>) => {
    setAllScores(prev => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [name]: { ...defaultEntry(), ...prev[selectedId]?.[name], ...update },
      },
    }));
  };

  const updateAssessment = (idx: number, field: 'name' | 'weight', value: string) => {
    const current = [...assessments];
    if (field === 'weight') {
      current[idx] = { ...current[idx], weight: parseFloat(value) || 0 };
    } else {
      current[idx] = { ...current[idx], name: value };
    }
    setCustomAssessments(prev => ({ ...prev, [selectedId]: current }));
  };

  const addAssessment = () => {
    const current = [...assessments, { name: `Component ${assessments.length + 1}`, weight: 0 }];
    setCustomAssessments(prev => ({ ...prev, [selectedId]: current }));
  };

  const removeAssessment = (idx: number) => {
    const current = assessments.filter((_, i) => i !== idx);
    setCustomAssessments(prev => ({ ...prev, [selectedId]: current }));
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-14 pb-1 text-center">
        <h1 className="text-3xl text-foreground tracking-tight">Calculator 📊</h1>
        <p className="mt-0.5 text-[11px] text-muted-foreground italic">compute per subject</p>
      </header>

      <div className="px-5 pt-4 space-y-3">
        {/* Subject selector */}
        <div className="rounded-2xl bg-card p-4 card-cute">
          <label className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.15em] uppercase">
            Subject
          </label>
          <button
            onClick={() => setShowSubjectPicker(!showSubjectPicker)}
            className="mt-1.5 w-full flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground active:scale-[0.99] transition-transform"
          >
            {subject.name}
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showSubjectPicker ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showSubjectPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-1.5">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedId(s.id); setShowSubjectPicker(false); }}
                      className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all active:scale-95 ${
                        s.id === selectedId
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/30 text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Assessment editor toggle */}
        <button
          onClick={() => setEditingAssessments(!editingAssessments)}
          className="flex items-center gap-2 text-[10px] font-semibold text-primary/70 hover:text-primary transition-colors px-1"
        >
          <Settings2 className="h-3 w-3" />
          {editingAssessments ? 'done editing' : 'customize weights'}
        </button>

        {/* Assessment editor */}
        <AnimatePresence>
          {editingAssessments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-card p-4 card-cute overflow-hidden"
            >
              <p className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.12em] uppercase mb-3">
                Components
                <span className={`ml-2 ${Math.abs(totalWeight - 1) < 0.001 ? 'text-primary' : 'text-destructive'}`}>
                  (total: {(totalWeight * 100).toFixed(0)}%)
                </span>
              </p>
              <div className="space-y-2">
                {assessments.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className="flex-1 rounded-xl bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={a.name}
                      onChange={e => updateAssessment(idx, 'name', e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        className="w-14 rounded-xl bg-secondary/50 px-2 py-2 text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={Math.round(a.weight * 100)}
                        onChange={e => updateAssessment(idx, 'weight', String(parseFloat(e.target.value) / 100))}
                      />
                      <span className="text-[10px] text-muted-foreground">%</span>
                    </div>
                    {assessments.length > 1 && (
                      <button onClick={() => removeAssessment(idx)} className="p-1.5 text-muted-foreground/40 hover:text-destructive rounded-xl transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addAssessment}
                className="flex items-center gap-1.5 text-[10px] font-medium text-primary/60 hover:text-primary mt-2 transition-colors"
              >
                <Plus className="h-3 w-3" /> add component
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grade Table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-card card-cute overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 px-4 py-3 border-b border-border/30 bg-secondary/20">
              <span className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.12em] uppercase">Component</span>
              <span className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.12em] uppercase text-right w-16">Raw</span>
              <span className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.12em] uppercase text-right w-14">% Eq</span>
              <span className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.12em] uppercase text-right w-16">Wtd %</span>
            </div>

            {/* Assessment Rows */}
            {assessmentData.map((a, idx) => (
              <div key={a.name} className={`px-4 py-3.5 ${idx < assessmentData.length - 1 ? 'border-b border-border/20' : ''}`}>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 items-center">
                  <span className="text-xs font-medium text-card-foreground">
                    {a.name}
                    <span className="ml-1 text-[10px] text-muted-foreground/40">({(a.weight * 100).toFixed(0)}%)</span>
                  </span>
                  <span className="text-xs tabular-nums text-card-foreground text-right w-16">{a.rawScore}</span>
                  <span className="text-xs tabular-nums text-card-foreground text-right w-14">
                    {a.pctEquivalent !== null ? (a.pctEquivalent * 100).toFixed(2) : '—'}
                  </span>
                  <span className="text-xs tabular-nums font-medium text-card-foreground text-right w-16">
                    {a.percentage !== null ? a.percentage.toFixed(2) : '—'}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-end mb-1">
                    <button
                      onClick={() => {
                        const newMode = a.entry.mode === 'items' ? 'single' : 'items';
                        updateEntry(a.name, {
                          mode: newMode,
                          items: newMode === 'items' && a.entry.items.length === 0
                            ? [{ score: '', total: '' }]
                            : a.entry.items,
                        });
                      }}
                      className="text-[9px] font-medium text-primary/60 hover:text-primary transition-colors"
                    >
                      {a.entry.mode === 'items' ? '✦ use total %' : '✦ add items'}
                    </button>
                  </div>

                  {a.entry.mode === 'single' ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0–100 %"
                      className="w-full rounded-xl border-0 bg-secondary/40 px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                      value={a.entry.single || ''}
                      onChange={e => updateEntry(a.name, { single: e.target.value })}
                    />
                  ) : (
                    <>
                      {a.entry.items.map((item, idx2) => (
                        <div key={idx2} className="flex items-center gap-1.5">
                          <span className="text-[9px] text-muted-foreground/40 w-4 text-right tabular-nums shrink-0">{idx2 + 1}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="score"
                            className="flex-1 rounded-xl border-0 bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                            value={item.score}
                            onChange={e => {
                              const newItems = [...a.entry.items];
                              newItems[idx2] = { ...newItems[idx2], score: e.target.value };
                              updateEntry(a.name, { items: newItems });
                            }}
                          />
                          <span className="text-muted-foreground/30 text-sm font-medium">/</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="total"
                            className="flex-1 rounded-xl border-0 bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                            value={item.total}
                            onChange={e => {
                              const newItems = [...a.entry.items];
                              newItems[idx2] = { ...newItems[idx2], total: e.target.value };
                              updateEntry(a.name, { items: newItems });
                            }}
                          />
                          {a.entry.items.length > 1 && (
                            <button
                              onClick={() => {
                                const newItems = a.entry.items.filter((_, j) => j !== idx2);
                                updateEntry(a.name, { items: newItems });
                              }}
                              className="p-1.5 text-muted-foreground/30 hover:text-destructive rounded-xl transition-colors shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => updateEntry(a.name, { items: [...a.entry.items, { score: '', total: '' }] })}
                        className="flex items-center gap-1 text-[10px] font-medium text-primary/50 hover:text-primary transition-colors py-0.5"
                      >
                        <Plus className="h-3 w-3" />
                        add item
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Subtotal, Bonus, Total */}
            <div className="border-t border-border/30">
              <div className="grid grid-cols-[1fr_auto] gap-1 px-4 py-3">
                <span className="text-xs font-semibold text-card-foreground text-right">Subtotal</span>
                <span className="text-xs font-semibold tabular-nums text-card-foreground text-right w-16">
                  {subtotal !== null ? subtotal.toFixed(2) : '—'}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-1 px-4 py-2.5 items-center">
                <span className="text-xs font-medium text-muted-foreground text-right">Bonus ✦</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-16 rounded-xl border-0 bg-secondary/40 px-2.5 py-2 text-xs text-foreground text-right tabular-nums placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  value={bonuses[selectedId] || ''}
                  onChange={e => setBonuses(prev => ({ ...prev, [selectedId]: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-1 px-4 py-3 bg-primary/5 rounded-b-none">
                <span className="text-xs font-bold text-card-foreground text-right">Total</span>
                <span className="text-xs font-bold tabular-nums text-card-foreground text-right w-16">
                  {total !== null ? total.toFixed(2) : '—'}
                </span>
              </div>
            </div>

            {/* Tentative Grade */}
            {tentativeGrade !== null && (
              <div className="bg-primary/8 px-4 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-card-foreground">Tentative Quarter Grade</span>
                  <div className="text-right">
                    <span
                      className="text-3xl font-normal tabular-nums text-primary"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      {formatGrade(tentativeGrade)}
                    </span>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {getGradeLabel(tentativeGrade)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
