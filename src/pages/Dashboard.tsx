import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, transmuteGWA, formatGrade } from '@/lib/gradeUtils';
import { useGrades } from '@/hooks/useGrades';
import { useGWASetContext } from '@/contexts/GWASetContext';
import { useAuth } from '@/hooks/useAuth';
import GWADonutChart from '@/components/GWADonutChart';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, ChevronDown, Trash2, Pencil, Check, X } from 'lucide-react';
import { useState } from 'react';

const GRADE_OPTIONS = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00];

export default function Dashboard() {
  const { signOut } = useAuth();
  const { sets, activeSetId, setActiveSetId, addSet, renameSet, deleteSet } = useGWASetContext();
  const { grades, updateGrade } = useGrades(activeSetId);
  const [showSetMenu, setShowSetMenu] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <h1 className="text-3xl text-foreground tracking-tight">GradeFlow</h1>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground italic ml-9">your grades, beautifully ✨</p>
        </div>
        <button
          onClick={signOut}
          className="mt-2 flex items-center gap-1.5 rounded-2xl bg-secondary/50 px-3 py-2 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95"
        >
          <LogOut className="h-3 w-3" />
          out
        </button>
      </header>

      {/* GWA Set Switcher */}
      <div className="px-5 py-2">
        <div className="relative">
          <button
            onClick={() => setShowSetMenu(!showSetMenu)}
            className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 card-cute w-full active:scale-[0.99] transition-transform"
          >
            <span className="text-sm font-medium text-foreground flex-1 text-left">
              📚 {sets.find(s => s.id === activeSetId)?.name || 'Loading…'}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${showSetMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showSetMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-card card-cute z-20 overflow-hidden"
              >
                {sets.map(s => (
                  <div key={s.id} className={`flex items-center gap-2 px-4 py-3 ${s.id === activeSetId ? 'bg-primary/6' : 'hover:bg-secondary/40'} transition-colors`}>
                    {editingId === s.id ? (
                      <>
                        <input
                          autoFocus
                          className="flex-1 text-sm bg-transparent border-0 outline-none text-foreground"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { renameSet(s.id, editName); setEditingId(null); }
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button onClick={() => { renameSet(s.id, editName); setEditingId(null); }} className="p-1.5 text-primary rounded-xl hover:bg-primary/10"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground rounded-xl hover:bg-secondary"><X className="h-3.5 w-3.5" /></button>
                      </>
                    ) : (
                      <>
                        <button
                          className="flex-1 text-left text-sm text-foreground"
                          onClick={() => { setActiveSetId(s.id); setShowSetMenu(false); }}
                        >
                          {s.name}
                        </button>
                        <button onClick={() => { setEditingId(s.id); setEditName(s.name); }} className="p-1.5 text-muted-foreground/40 hover:text-foreground rounded-xl hover:bg-secondary/60 transition-all">
                          <Pencil className="h-3 w-3" />
                        </button>
                        {sets.length > 1 && (
                          <button onClick={() => deleteSet(s.id)} className="p-1.5 text-muted-foreground/40 hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={async () => {
                    await addSet(`Quarter ${sets.length + 1}`);
                    setShowSetMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors border-t border-border/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add new set
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* GWA Chart */}
      <div className="px-5 py-3">
        <div className="rounded-3xl bg-card p-5 card-cute">
          <GWADonutChart grades={grades} />
        </div>
      </div>

      {/* Subjects */}
      <div className="px-5 pt-2">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60">
          ✦ Subjects
        </p>
        <div className="space-y-2.5">
          {SUBJECTS.map((subject, i) => {
            const g = grades[subject.id];
            const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
            const rawFinal = hasBoth ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!) : null;
            const final = rawFinal != null ? transmuteGWA(rawFinal) : null;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="rounded-2xl bg-card p-4 card-cute"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${SUBJECT_COLORS[subject.id]})` }} />
                    <span className="text-sm font-medium text-card-foreground">{subject.name}</span>
                  </div>
                  {final != null && (
                    <span className="text-xl tabular-nums text-card-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {final.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-semibold text-muted-foreground/60 tracking-wider uppercase">Previous</label>
                    <select
                      className="mt-1 w-full rounded-xl border-0 bg-secondary/50 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-shadow"
                      value={g?.previousGrade ?? ''}
                      onChange={e => updateGrade(subject.id, 'previousGrade', e.target.value ? parseFloat(e.target.value) : null)}
                    >
                      <option value="">—</option>
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{formatGrade(g)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold text-muted-foreground/60 tracking-wider uppercase">Tentative</label>
                    <select
                      className="mt-1 w-full rounded-xl border-0 bg-secondary/50 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-shadow"
                      value={g?.tentativeGrade ?? ''}
                      onChange={e => updateGrade(subject.id, 'tentativeGrade', e.target.value ? parseFloat(e.target.value) : null)}
                    >
                      <option value="">—</option>
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{formatGrade(g)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
