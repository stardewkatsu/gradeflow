import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, transmuteGWA, formatGrade } from '@/lib/gradeUtils';
import { useGrades } from '@/hooks/useGrades';
import { useGWASetContext } from '@/contexts/GWASetContext';
import { useAuth } from '@/hooks/useAuth';
import GWADonutChart from '@/components/GWADonutChart';
import { LogOut, Plus, ChevronRight, Trash2, Pencil, Check, X } from 'lucide-react';
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
      <header className="px-4 pt-14 pb-1 flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">GradeFlow</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-1 text-[13px] text-primary active:opacity-60 transition-opacity"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* GWA Set Switcher */}
      <div className="px-4 py-2">
        <button
          onClick={() => setShowSetMenu(!showSetMenu)}
          className="flex items-center gap-2 text-[15px] text-primary font-medium active:opacity-60 transition-opacity"
        >
          {sets.find(s => s.id === activeSetId)?.name || 'Loading…'}
          <ChevronRight className={`h-4 w-4 transition-transform ${showSetMenu ? 'rotate-90' : ''}`} />
        </button>

        {showSetMenu && (
          <div className="mt-2 card-ios overflow-hidden shadow-lg">
            {sets.map(s => (
              <div key={s.id} className={`flex items-center gap-2 px-4 py-3 border-b border-border/50 ${s.id === activeSetId ? 'bg-primary/5' : ''}`}>
                {editingId === s.id ? (
                  <>
                    <input
                      autoFocus
                      className="flex-1 text-[15px] bg-transparent outline-none text-foreground"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { renameSet(s.id, editName); setEditingId(null); }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button onClick={() => { renameSet(s.id, editName); setEditingId(null); }} className="p-1 text-primary"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <>
                    <button
                      className="flex-1 text-left text-[15px] text-foreground"
                      onClick={() => { setActiveSetId(s.id); setShowSetMenu(false); }}
                    >
                      {s.name}
                    </button>
                    <button onClick={() => { setEditingId(s.id); setEditName(s.name); }} className="p-1 text-muted-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {sets.length > 1 && (
                      <button onClick={() => deleteSet(s.id)} className="p-1 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
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
              className="flex items-center gap-2 w-full px-4 py-3 text-[15px] text-primary"
            >
              <Plus className="h-4 w-4" />
              Add New Set
            </button>
          </div>
        )}
      </div>

      {/* GWA Chart */}
      <div className="px-4 py-3">
        <div className="card-ios p-4">
          <GWADonutChart grades={grades} />
        </div>
      </div>

      {/* Subjects */}
      <div className="px-4 pt-2">
        <p className="mb-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
          Subjects
        </p>
        <div className="card-ios overflow-hidden divide-y divide-border/50">
          {SUBJECTS.map((subject) => {
            const g = grades[subject.id];
            const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
            const rawFinal = hasBoth ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!) : null;
            const final = rawFinal != null ? transmuteGWA(rawFinal) : null;

            return (
              <div key={subject.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${SUBJECT_COLORS[subject.id]})` }} />
                    <span className="text-[15px] font-medium text-foreground">{subject.name}</span>
                  </div>
                  {final != null && (
                    <span className="text-[20px] font-bold tabular-nums text-foreground">
                      {final.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Previous</label>
                    <select
                      className="w-full rounded-lg bg-secondary px-3 py-2.5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
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
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Tentative</label>
                    <select
                      className="w-full rounded-lg bg-secondary px-3 py-2.5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
