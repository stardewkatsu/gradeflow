import { useState } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { percentToGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { Plus, X, ChevronRight } from 'lucide-react';

interface ScoreItem { score: string; total: string; }
interface AssessmentConfig { name: string; weight: number; }
interface AssessmentEntry { mode: 'single' | 'items'; single: string; items: ScoreItem[]; }
interface SubScores { [assessmentName: string]: AssessmentEntry; }

const defaultEntry = (): AssessmentEntry => ({ mode: 'items', single: '', items: [{ score: '', total: '' }] });

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
    let totalScore = 0, totalPossible = 0, pctEquivalent: number | null = null, percentage: number | null = null;
    if (entry.mode === 'items') {
      const valid = entry.items.filter(i => i.score !== '' && i.total !== '' && !isNaN(Number(i.score)) && !isNaN(Number(i.total)) && Number(i.total) > 0);
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
      [selectedId]: { ...prev[selectedId], [name]: { ...defaultEntry(), ...prev[selectedId]?.[name], ...update } },
    }));
  };

  const updateAssessment = (idx: number, field: 'name' | 'weight', value: string) => {
    const current = [...assessments];
    if (field === 'weight') current[idx] = { ...current[idx], weight: parseFloat(value) || 0 };
    else current[idx] = { ...current[idx], name: value };
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
      <header className="px-4 pt-14 pb-1">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">Calculator</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Compute per subject</p>
      </header>

      <div className="px-4 pt-3 space-y-3">
        {/* Subject selector */}
        <div className="card-ios p-4">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Subject</label>
          <button
            onClick={() => setShowSubjectPicker(!showSubjectPicker)}
            className="mt-1.5 w-full flex items-center justify-between rounded-lg bg-secondary px-4 py-3 text-[15px] font-medium text-foreground active:opacity-70 transition-opacity"
          >
            {subject.name}
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showSubjectPicker ? 'rotate-90' : ''}`} />
          </button>
          {showSubjectPicker && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setShowSubjectPicker(false); }}
                  className={`rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all active:scale-95 ${
                    s.id === selectedId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Customize weights */}
        <button
          onClick={() => setEditingAssessments(!editingAssessments)}
          className="text-[13px] font-medium text-primary active:opacity-60 transition-opacity px-1"
        >
          {editingAssessments ? 'Done' : 'Customize Weights'}
        </button>

        {editingAssessments && (
          <div className="card-ios p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Components
              <span className={`ml-2 ${Math.abs(totalWeight - 1) < 0.001 ? 'text-primary' : 'text-destructive'}`}>
                ({(totalWeight * 100).toFixed(0)}%)
              </span>
            </p>
            <div className="space-y-2">
              {assessments.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg bg-secondary px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={a.name}
                    onChange={e => updateAssessment(idx, 'name', e.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min="0" max="100" step="1"
                      className="w-14 rounded-lg bg-secondary px-2 py-2.5 text-[13px] text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={Math.round(a.weight * 100)}
                      onChange={e => updateAssessment(idx, 'weight', String(parseFloat(e.target.value) / 100))}
                    />
                    <span className="text-[13px] text-muted-foreground">%</span>
                  </div>
                  {assessments.length > 1 && (
                    <button onClick={() => removeAssessment(idx)} className="p-1 text-destructive"><X className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addAssessment} className="flex items-center gap-1 text-[13px] text-primary mt-2">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        )}

        {/* Grade Table */}
        <div className="card-ios overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 px-4 py-2.5 bg-secondary/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Component</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right w-14">Raw</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right w-12">%Eq</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right w-14">Wtd%</span>
          </div>

          {/* Rows */}
          {assessmentData.map((a, idx) => (
            <div key={a.name} className={`px-4 py-3 ${idx < assessmentData.length - 1 ? 'border-b border-border/50' : ''}`}>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 items-center">
                <span className="text-[13px] font-medium text-foreground">
                  {a.name} <span className="text-muted-foreground">({(a.weight * 100).toFixed(0)}%)</span>
                </span>
                <span className="text-[13px] tabular-nums text-foreground text-right w-14">{a.rawScore}</span>
                <span className="text-[13px] tabular-nums text-foreground text-right w-12">
                  {a.pctEquivalent !== null ? (a.pctEquivalent * 100).toFixed(1) : '—'}
                </span>
                <span className="text-[13px] tabular-nums font-semibold text-foreground text-right w-14">
                  {a.percentage !== null ? a.percentage.toFixed(2) : '—'}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="flex justify-end">
                  <button
                    onClick={() => updateEntry(a.name, {
                      mode: a.entry.mode === 'items' ? 'single' : 'items',
                      items: a.entry.mode === 'single' && a.entry.items.length === 0 ? [{ score: '', total: '' }] : a.entry.items,
                    })}
                    className="text-[11px] text-primary active:opacity-60"
                  >
                    {a.entry.mode === 'items' ? 'Use total %' : 'Add items'}
                  </button>
                </div>

                {a.entry.mode === 'single' ? (
                  <input
                    type="number" min="0" max="100" step="0.01" placeholder="0–100%"
                    className="w-full rounded-lg bg-secondary px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={a.entry.single || ''}
                    onChange={e => updateEntry(a.name, { single: e.target.value })}
                  />
                ) : (
                  <>
                    {a.entry.items.map((item, idx2) => (
                      <div key={idx2} className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-4 text-right tabular-nums shrink-0">{idx2 + 1}</span>
                        <input
                          type="number" min="0" step="0.01" placeholder="score"
                          className="flex-1 rounded-lg bg-secondary px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={item.score}
                          onChange={e => {
                            const newItems = [...a.entry.items];
                            newItems[idx2] = { ...newItems[idx2], score: e.target.value };
                            updateEntry(a.name, { items: newItems });
                          }}
                        />
                        <span className="text-muted-foreground text-[15px] font-medium">/</span>
                        <input
                          type="number" min="0" step="0.01" placeholder="total"
                          className="flex-1 rounded-lg bg-secondary px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={item.total}
                          onChange={e => {
                            const newItems = [...a.entry.items];
                            newItems[idx2] = { ...newItems[idx2], total: e.target.value };
                            updateEntry(a.name, { items: newItems });
                          }}
                        />
                        {a.entry.items.length > 1 && (
                          <button onClick={() => updateEntry(a.name, { items: a.entry.items.filter((_, j) => j !== idx2) })} className="p-1 text-destructive shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateEntry(a.name, { items: [...a.entry.items, { score: '', total: '' }] })}
                      className="flex items-center gap-1 text-[11px] text-primary py-0.5"
                    >
                      <Plus className="h-3 w-3" /> Add item
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="border-t border-border/50">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] font-semibold text-foreground">Subtotal</span>
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {subtotal !== null ? subtotal.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50">
              <span className="text-[13px] text-muted-foreground">Bonus</span>
              <input
                type="number" min="0" step="0.01" placeholder="0"
                className="w-16 rounded-lg bg-secondary px-2.5 py-2 text-[13px] text-foreground text-right tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={bonuses[selectedId] || ''}
                onChange={e => setBonuses(prev => ({ ...prev, [selectedId]: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-border/50">
              <span className="text-[13px] font-bold text-foreground">Total</span>
              <span className="text-[13px] font-bold tabular-nums text-foreground">
                {total !== null ? total.toFixed(2) : '—'}
              </span>
            </div>
          </div>

          {/* Tentative Grade */}
          {tentativeGrade !== null && (
            <div className="bg-primary/8 px-4 py-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-foreground">Tentative Grade</span>
                <div className="text-right">
                  <span className="text-[28px] font-bold tabular-nums text-primary">
                    {formatGrade(tentativeGrade)}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {getGradeLabel(tentativeGrade)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
