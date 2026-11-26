import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Edit3,
  Play,
  Plus,
  SkipForward,
  Trash2,
  X,
} from 'lucide-react';
import {
  parseEndPointChain,
  type BoundaryRuleItem,
  type OperatorRuleItem,
  type SolverPathRuleItem,
  type SymbolAliasItem,
} from '../utils/givenAskedEngine';
import {
  formatNumClean,
  solveWithRegistry,
  type DiscoveryCandidate,
  type SolverRunReport,
} from '../utils/solverEngine';
import type { ConceptItem, MicroConceptItem } from './ExamRegistryDashboard';

interface BoundarySectionProps {
  title: string;
  subtitle: string;
  accentHex: string;
  addButtonLabel: string;
  rules: BoundaryRuleItem[];
  setRules: React.Dispatch<React.SetStateAction<BoundaryRuleItem[]>>;
  combineFallback: boolean;
  setCombineFallback: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BoundaryRegistrySection: React.FC<BoundarySectionProps> = ({
  title,
  subtitle,
  accentHex,
  addButtonLabel,
  rules,
  setRules,
  combineFallback,
  setCombineFallback,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [startInput, setStartInput] = useState('');
  const [endHops, setEndHops] = useState<{ text: string; repeat: boolean }[]>([
    { text: ',', repeat: true },
    { text: 'then | find | what | . | ?', repeat: false },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; startPoint: string; endPoint: string }>({
    name: '',
    startPoint: '',
    endPoint: '',
  });

  const compiledEndPoint = endHops
    .map((h) => {
      const clean = h.text.trim();
      if (!clean) return '';
      return h.repeat && !clean.endsWith('*') ? `${clean}*` : clean;
    })
    .filter(Boolean)
    .join(' -> ');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const startPoint = startInput.trim();
    const endPoint = compiledEndPoint.trim();
    if (!name || !startPoint || !endPoint) {
      setErrorMsg('Enter Name, Start Point, and at least one End Point.');
      return;
    }
    const id = `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setRules((prev) => [...prev, { id, name, startPoint, endPoint }]);
    setNameInput('');
    setStartInput('');
    setEndHops([{ text: '', repeat: false }]);
    setErrorMsg(null);
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= rules.length) return;
    setRules((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const handleStartEdit = (rule: BoundaryRuleItem) => {
    setEditingId(rule.id);
    setEditDraft({
      name: rule.name,
      startPoint: rule.startPoint,
      endPoint: rule.endPoint,
    });
  };

  const handleSaveEdit = (id: string) => {
    const name = editDraft.name.trim();
    const startPoint = editDraft.startPoint.trim();
    const endPoint = editDraft.endPoint.trim();
    if (!name || !startPoint || !endPoint) return;
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name, startPoint, endPoint } : r))
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="p-5 space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
              {title}
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">{subtitle}</div>
          </div>

          <button
            type="button"
            onClick={() => setCombineFallback((v) => !v)}
            className={`px-3 py-1.5 rounded border text-[11px] font-mono font-bold transition-colors cursor-pointer ${
              combineFallback
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                : 'bg-[#F9F8F4] border-[#DFDDD4] text-[#4B5563]'
            }`}
          >
            Combined Rule Fallback: {combineFallback ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                <th className="py-2.5 px-4 w-16">S.No</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Start Point</th>
                <th className="py-2.5 px-4">End Point</th>
                <th className="py-2.5 px-4 text-right w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {rules.map((rule, idx) => {
                const isEditing = editingId === rule.id;
                return (
                  <tr key={rule.id} className="hover:bg-[#F9F8F4]/60">
                    <td className="py-2.5 px-4 text-[#6B7280] font-bold">{idx + 1})</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDraft.name}
                          onChange={(e) =>
                            setEditDraft((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#1D4ED8] rounded focus:outline-none"
                        />
                      ) : (
                        rule.name
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDraft.startPoint}
                          onChange={(e) =>
                            setEditDraft((prev) => ({ ...prev, startPoint: e.target.value }))
                          }
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#1D4ED8] rounded focus:outline-none"
                        />
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded border text-xs font-bold"
                          style={{
                            borderColor: `${accentHex}40`,
                            backgroundColor: `${accentHex}12`,
                            color: accentHex,
                          }}
                        >
                          {rule.startPoint}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editDraft.endPoint}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, endPoint: e.target.value }))
                            }
                            placeholder="e.g. , -> ,  or  , | and* -> find | ."
                            className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#1D4ED8] rounded focus:outline-none"
                          />
                          <div className="text-[10px] font-mono text-[#6B7280]">
                            Use <code>-&gt;</code> for chained hops (E1 -&gt; E2), <code>|</code> for OR, trailing <code>*</code> to repeat separator
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1">
                          {parseEndPointChain(rule.endPoint).map((hop, hIdx, arr) => (
                            <React.Fragment key={`${rule.id}-hop-${hIdx}`}>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#DFDDD4] bg-[#F9F8F4] text-[#111827] font-bold">
                                {arr.length > 1 && (
                                  <span className="text-[10px] text-[#1D4ED8]">E{hIdx + 1}:</span>
                                )}
                                <span>{hop.tokens.join(' | ')}</span>
                                {hop.repeat && (
                                  <span className="text-[10px] text-[#15803D]" title="Repeats until next hop">
                                    (repeat)
                                  </span>
                                )}
                              </span>
                              {hIdx < arr.length - 1 && (
                                <span className="text-[#6B7280] font-bold">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(rule.id)}
                              className="p-1 rounded bg-[#15803D] text-white hover:bg-[#166534] cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded border border-[#DFDDD4] bg-white text-[#4B5563] hover:bg-[#F9F8F4] cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMove(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded border border-[#DFDDD4] bg-white text-[#4B5563] hover:bg-[#F9F8F4] disabled:opacity-35 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(idx, 1)}
                              disabled={idx === rules.length - 1}
                              className="p-1 rounded border border-[#DFDDD4] bg-white text-[#4B5563] hover:bg-[#F9F8F4] disabled:opacity-35 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(rule)}
                              className="p-1 rounded border border-[#DFDDD4] bg-white text-[#1D4ED8] hover:bg-[#EFF6FF] cursor-pointer"
                              title="Edit Rule"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(rule.id)}
                              className="p-1 rounded border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-xs text-[#6B7280]">
                    No rules added yet. Add a rule below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Rule Form with Multi-Endpoint Chain Builder (E1 -> E2 -> ...) */}
      <form
        onSubmit={handleAdd}
        className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-mono font-bold text-[#1D4ED8]">{addButtonLabel}</div>
          <span className="text-[11px] font-mono text-[#6B7280]">
            OR via <code>|</code> (<code>. | ?</code>) · Sequential Multi-Given via <code>E1 → E2</code>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Name (e.g. given)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
          />
          <input
            type="text"
            placeholder="Start Point (e.g. given)"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
          />
          <button
            type="button"
            onClick={() => setEndHops((prev) => [...prev, { text: '', repeat: false }])}
            className="px-3 py-2 bg-white hover:bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-mono font-semibold rounded flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Endpoint (E{endHops.length + 1})</span>
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {endHops.map((hop, hIdx) => (
            <div
              key={`add-hop-${hIdx}`}
              className="flex items-center gap-2 bg-white border border-[#DFDDD4] rounded px-2.5 py-1.5 font-mono text-xs"
            >
              <span className="font-bold text-[#1D4ED8] shrink-0">E{hIdx + 1}:</span>
              <input
                type="text"
                value={hop.text}
                onChange={(e) =>
                  setEndHops((prev) =>
                    prev.map((item, i) => (i === hIdx ? { ...item, text: e.target.value } : item))
                  )
                }
                placeholder={hIdx === 0 ? 'e.g. , | and' : 'e.g. find | .'}
                className="flex-1 min-w-0 bg-transparent text-[#111827] focus:outline-none"
              />
              {hIdx < endHops.length - 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setEndHops((prev) =>
                      prev.map((item, i) => (i === hIdx ? { ...item, repeat: !item.repeat } : item))
                    )
                  }
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                    hop.repeat
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                      : 'bg-[#F9F8F4] border-[#DFDDD4] text-[#6B7280]'
                  }`}
                  title="Repeat this separator for 2, 3, 4+ items until next endpoint"
                >
                  {hop.repeat ? 'Repeat ON' : 'Once'}
                </button>
              )}
              {endHops.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEndHops((prev) => prev.filter((_, i) => i !== hIdx))}
                  className="text-[#DC2626] hover:bg-[#FEF2F2] rounded p-0.5 cursor-pointer"
                  title="Remove Endpoint"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-[11px] font-mono text-[#4B5563]">
          Compiled Rule: <span className="font-bold text-[#111827]">{startInput || 'St'}</span> →{' '}
          <span className="font-bold text-[#1D4ED8]">{compiledEndPoint || '—'}</span>
        </div>

        {errorMsg && (
          <div className="text-[11px] font-mono text-[#DC2626] font-semibold">{errorMsg}</div>
        )}
      </form>
    </div>
  );
};

// ============================================================================
// PAGE 8: OPERATOR REGISTRY (S.No | Name | Eg Output | Symbol | Topic)
// ============================================================================

interface OperatorSectionProps {
  operatorRules: OperatorRuleItem[];
  setOperatorRules: React.Dispatch<React.SetStateAction<OperatorRuleItem[]>>;
}

export const OperatorRegistrySection: React.FC<OperatorSectionProps> = ({
  operatorRules,
  setOperatorRules,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [egOutputInput, setEgOutputInput] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const [topicInput, setTopicInput] = useState('General');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const egOutput = egOutputInput.trim();
    const symbol = symbolInput.trim();
    const topic = topicInput.trim() || 'General';

    if (!name || !symbol) {
      setErrorMsg('Enter Name and Symbol.');
      return;
    }
    const duplicate = operatorRules.some(
      (op) => op.symbol.toLowerCase() === symbol.toLowerCase()
    );
    if (duplicate) {
      setErrorMsg(`Symbol "${symbol}" already exists in Operator Registry.`);
      return;
    }
    const nextOp: OperatorRuleItem = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      egOutput: egOutput || `${symbol}`,
      symbol,
      topic,
      enabled: true,
    };
    setOperatorRules((prev) => [...prev, nextOp]);
    setNameInput('');
    setEgOutputInput('');
    setSymbolInput('');
    setErrorMsg(null);
  };

  const toggleEnabled = (id: string) => {
    setOperatorRules((prev) =>
      prev.map((op) => (op.id === id ? { ...op, enabled: !op.enabled } : op))
    );
  };

  return (
    <div className="p-5 space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
              8) Operator Registry
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
              1) Inside &lt;math == ...&gt;, operators appear as symbols. 2) System scans for registered &quot;symbol&quot; and adjacent variables and passes them to the Solver.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[11px] font-bold">
            {operatorRules.filter((o) => o.enabled !== false).length} / {operatorRules.length} Active
          </span>
        </div>

        <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                <th className="py-2.5 px-3 w-14">S.No</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Eg Output</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3 text-center w-24">Solver</th>
                <th className="py-2.5 px-3 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {operatorRules.map((op, idx) => (
                <tr
                  key={op.id}
                  className={op.enabled === false ? 'bg-[#F9F8F4] opacity-55' : 'hover:bg-[#F9F8F4]/60'}
                >
                  <td className="py-2 px-3 text-[#6B7280] font-bold">{idx + 1})</td>
                  <td className="py-2 px-3 font-sans font-semibold text-[#111827]">{op.name}</td>
                  <td className="py-2 px-3 text-[#374151]">{op.egOutput}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded font-bold">
                      {op.symbol}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-[#4B5563] text-[11px]">
                      {op.topic}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleEnabled(op.id)}
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                        op.enabled !== false
                          ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                          : 'bg-white border-[#DFDDD4] text-[#6B7280]'
                      }`}
                    >
                      {op.enabled !== false ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setOperatorRules((prev) => prev.filter((item) => item.id !== op.id))
                      }
                      className="p-1 rounded border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                      title="Delete Operator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Operator Form */}
      <form
        onSubmit={handleAdd}
        className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
      >
        <div className="text-xs font-mono font-bold text-[#1D4ED8]">
          8a) Add MKML Operator Rule
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            placeholder="Name (e.g. plus)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
          />
          <input
            type="text"
            placeholder="Eg Output (e.g. x + x = 2x)"
            value={egOutputInput}
            onChange={(e) => setEgOutputInput(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
          />
          <input
            type="text"
            placeholder="Symbol (e.g. +)"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            className="w-32 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
          />
          <input
            type="text"
            placeholder="Topic (e.g. General)"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="w-36 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Operator</span>
          </button>
        </div>
        {errorMsg && (
          <div className="text-[11px] font-mono text-[#DC2626] font-semibold">{errorMsg}</div>
        )}
      </form>
    </div>
  );
};

// ============================================================================
// PAGE 9: SOLVER'S REGISTRY + SYMBOL ALIASES + AUTONOMOUS SOLVER ENGINE
// ============================================================================

interface SolverSectionProps {
  solverPaths: SolverPathRuleItem[];
  setSolverPaths: React.Dispatch<React.SetStateAction<SolverPathRuleItem[]>>;
  symbolAliases: SymbolAliasItem[];
  setSymbolAliases: React.Dispatch<React.SetStateAction<SymbolAliasItem[]>>;
  operatorRules: OperatorRuleItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
}

export const SolverRegistrySection: React.FC<SolverSectionProps> = ({
  solverPaths,
  setSolverPaths,
  symbolAliases,
  setSymbolAliases,
  operatorRules,
}) => {
  // Symbol Alias Add Form
  const [aliasListInput, setAliasListInput] = useState('');
  const [canonicalInput, setCanonicalInput] = useState('');
  const [aliasErr, setAliasErr] = useState<string | null>(null);

  // Solver's Registry Add Form (Asked | Given | Breakdown)
  const [askedInput, setAskedInput] = useState('');
  const [givenInput, setGivenInput] = useState('');
  const [breakdownInput, setBreakdownInput] = useState('');
  const [rowErr, setRowErr] = useState<string | null>(null);

  // Add branch inline state for an existing Asked row
  const [addingBranchRowId, setAddingBranchRowId] = useState<string | null>(null);
  const [branchGivenInput, setBranchGivenInput] = useState('');
  const [branchBreakdownInput, setBranchBreakdownInput] = useState('');

  // Autonomous Backward + Substitution + Discovery Testbed State
  const [testGiven, setTestGiven] = useState('selling price = 30, cost price = 20');
  const [testAsked, setTestAsked] = useState('Profit%');
  const [testExpected, setTestExpected] = useState('50');
  const [testTopic, setTestTopic] = useState('General');
  const [runReport, setRunReport] = useState<SolverRunReport | null>(null);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [confirmFeedback, setConfirmFeedback] = useState<string | null>(null);

  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault();
    const aliases = aliasListInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const canonical = canonicalInput.trim() || aliases[aliases.length - 1] || '';
    if (aliases.length === 0 || !canonical) {
      setAliasErr('Enter comma-separated aliases (e.g. cost price, CP) and canonical short symbol.');
      return;
    }
    setSymbolAliases((prev) => [
      ...prev,
      {
        id: `sym-${Date.now()}`,
        aliases: Array.from(new Set([...aliases, canonical])),
        canonical,
        writtenBy: 'User',
      },
    ]);
    setAliasListInput('');
    setCanonicalInput('');
    setAliasErr(null);
  };

  const handleAddSolverRow = (e: React.FormEvent) => {
    e.preventDefault();
    const askedAliases = askedInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const givenVars = givenInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const breakdown = breakdownInput.trim();

    if (askedAliases.length === 0 || givenVars.length === 0 || !breakdown) {
      setRowErr('Enter Asked name/aliases, Given variables, and Breakdown formula.');
      return;
    }

    // If Asked already matches an existing row, append a branch to that row instead of creating a duplicate Asked row
    const existingIdx = solverPaths.findIndex((row) =>
      row.askedAliases.some((a) =>
        askedAliases.some((na) => a.toLowerCase() === na.toLowerCase())
      )
    );
    const newBranch = {
      id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      givenVars,
      breakdown,
    };

    if (existingIdx >= 0) {
      setSolverPaths((prev) =>
        prev.map((row, idx) =>
          idx === existingIdx
            ? {
                ...row,
                askedAliases: Array.from(new Set([...row.askedAliases, ...askedAliases])),
                branches: [...row.branches, newBranch],
              }
            : row
        )
      );
    } else {
      setSolverPaths((prev) => [
        ...prev,
        {
          id: `sol-${Date.now()}`,
          askedAliases,
          branches: [newBranch],
          hitCount: 0,
          writtenBy: 'User',
        },
      ]);
    }
    setAskedInput('');
    setGivenInput('');
    setBreakdownInput('');
    setRowErr(null);
  };

  const handleAddBranchToRow = (rowId: string) => {
    const givenVars = branchGivenInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const breakdown = branchBreakdownInput.trim();
    if (givenVars.length === 0 || !breakdown) return;
    setSolverPaths((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              branches: [
                ...r.branches,
                { id: `br-${Date.now()}`, givenVars, breakdown },
              ],
            }
          : r
      )
    );
    setAddingBranchRowId(null);
    setBranchGivenInput('');
    setBranchBreakdownInput('');
  };

  const handleRunSolver = (override?: { g: string; a: string; exp: string }) => {
    const g = override ? override.g : testGiven;
    const a = override ? override.a : testAsked;
    const exp = override ? override.exp : testExpected;
    if (override) {
      setTestGiven(override.g);
      setTestAsked(override.a);
      setTestExpected(override.exp);
    }
    const report = solveWithRegistry({
      givenInput: g,
      askedInput: a,
      expectedAnswerInput: exp,
      topic: testTopic,
      operatorRules,
      solverEntries: solverPaths,
      symbolAliases,
    });
    setRunReport(report);
    setCandidateIdx(0);
    setConfirmFeedback(null);
  };

  const activeCandidate: DiscoveryCandidate | null =
    runReport?.discoveryCandidates[candidateIdx] || null;

  const handleConfirmCandidate = (cand: DiscoveryCandidate, mergeAliasOnly: boolean) => {
    if (mergeAliasOnly && cand.matchingExistingRowId) {
      setSolverPaths((prev) =>
        prev.map((r) =>
          r.id === cand.matchingExistingRowId
            ? {
                ...r,
                askedAliases: Array.from(new Set([...r.askedAliases, cand.askedLabel])),
                hitCount: r.hitCount + 1,
                writtenBy: 'Solver',
              }
            : r
        )
      );
      setConfirmFeedback(
        `Appended alias "${cand.askedLabel}" under existing row (${cand.matchingExistingAsked}).`
      );
    } else {
      const existingRow = solverPaths.find((r) =>
        r.askedAliases.some((a) => a.toLowerCase() === cand.askedLabel.toLowerCase())
      );
      const newBranch = {
        id: `br-${Date.now()}`,
        givenVars: cand.givenVars,
        breakdown: cand.breakdown,
      };
      if (existingRow) {
        setSolverPaths((prev) =>
          prev.map((r) =>
            r.id === existingRow.id
              ? { ...r, branches: [...r.branches, newBranch], writtenBy: 'Solver' }
              : r
          )
        );
      } else {
        setSolverPaths((prev) => [
          ...prev,
          {
            id: `sol-${Date.now()}`,
            askedAliases: [cand.askedLabel],
            branches: [newBranch],
            hitCount: 1,
            writtenBy: 'Solver',
          },
        ]);
      }
      setConfirmFeedback(
        `Confirmed & appended [${cand.askedLabel} = ${cand.breakdown}] to Solver's Registry.`
      );
    }
    setRunReport(null);
  };

  return (
    <div className="p-5 space-y-6">
      {/* 9A) SOLVER'S REGISTRY TABLE */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
              9) Solver&apos;s Registry (Asked | Given | Breakdown)
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
              Single Asked supports multiple (Given → Breakdown) branches, backward subgoal chaining, and missing-variable substitution (e.g. SP = CP - L finds L when SP &amp; CP are given).
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#F9F8F4] border border-[#DFDDD4] font-mono text-[11px] text-[#4B5563]">
            {solverPaths.length} Asked Groups
          </span>
        </div>

        <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                <th className="py-2.5 px-3 w-14">S.No</th>
                <th className="py-2.5 px-3">Asked</th>
                <th className="py-2.5 px-3">Given</th>
                <th className="py-2.5 px-3">Breakdown</th>
                <th className="py-2.5 px-3 w-24 text-center">Source</th>
                <th className="py-2.5 px-3 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDDD4]">
              {solverPaths.map((row, idx) => (
                <React.Fragment key={row.id}>
                  {row.branches.map((br, bIdx) => (
                    <tr key={br.id} className="hover:bg-[#F9F8F4]/60">
                      {bIdx === 0 && (
                        <>
                          <td
                            rowSpan={row.branches.length}
                            className="py-2.5 px-3 text-[#6B7280] font-bold align-top border-r border-[#F0EFEA]"
                          >
                            {idx + 1})
                          </td>
                          <td
                            rowSpan={row.branches.length}
                            className="py-2.5 px-3 align-top border-r border-[#F0EFEA]"
                          >
                            <div className="space-y-1">
                              {row.askedAliases.map((alias, aIdx) => (
                                <div
                                  key={`${row.id}-a-${aIdx}`}
                                  className={`font-sans font-bold ${
                                    aIdx === 0 ? 'text-[#B45309]' : 'text-[#374151] text-[11px]'
                                  }`}
                                >
                                  {alias}
                                </div>
                              ))}
                            </div>
                          </td>
                        </>
                      )}
                      <td className="py-2 px-3 text-[#15803D] font-bold">
                        {br.givenVars.join(', ')}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-[#111827] font-bold">
                          {br.breakdown}
                        </span>
                      </td>
                      {bIdx === 0 && (
                        <>
                          <td
                            rowSpan={row.branches.length}
                            className="py-2.5 px-3 text-center align-top border-l border-[#F0EFEA]"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                                row.writtenBy === 'Solver'
                                  ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                                  : 'bg-[#F9F8F4] border-[#DFDDD4] text-[#4B5563]'
                              }`}
                            >
                              {row.writtenBy}
                            </span>
                          </td>
                          <td
                            rowSpan={row.branches.length}
                            className="py-2.5 px-3 text-right align-top"
                          >
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingBranchRowId(
                                    addingBranchRowId === row.id ? null : row.id
                                  );
                                  setBranchGivenInput('');
                                  setBranchBreakdownInput('');
                                }}
                                className="px-2 py-1 rounded border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold cursor-pointer"
                                title="Add Given -> Breakdown branch to this Asked"
                              >
                                + Branch
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setSolverPaths((prev) => prev.filter((item) => item.id !== row.id))
                                }
                                className="p-1 rounded border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                                title="Delete Asked Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {addingBranchRowId === row.id && (
                    <tr className="bg-[#EFF6FF]/60">
                      <td colSpan={6} className="p-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-[#1D4ED8]">
                            Add branch to {row.askedAliases[0]}:
                          </span>
                          <input
                            type="text"
                            placeholder="Given vars (e.g. MP, D)"
                            value={branchGivenInput}
                            onChange={(e) => setBranchGivenInput(e.target.value)}
                            className="px-2.5 py-1 text-xs bg-white border border-[#BFDBFE] rounded"
                          />
                          <input
                            type="text"
                            placeholder="Breakdown (e.g. MP - D)"
                            value={branchBreakdownInput}
                            onChange={(e) => setBranchBreakdownInput(e.target.value)}
                            className="px-2.5 py-1 text-xs bg-white border border-[#BFDBFE] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddBranchToRow(row.id)}
                            className="px-2.5 py-1 bg-[#1D4ED8] text-white rounded text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingBranchRowId(null)}
                            className="px-2 py-1 bg-white border border-[#DFDDD4] text-[#4B5563] rounded text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Solver Row Form */}
        <form
          onSubmit={handleAddSolverRow}
          className="mt-3 p-3.5 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] flex flex-wrap items-center gap-2.5"
        >
          <input
            type="text"
            placeholder="Asked (e.g. Selling Price, S.P., SP)"
            value={askedInput}
            onChange={(e) => setAskedInput(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-xs font-mono bg-white border border-[#D1CFC7] rounded"
          />
          <input
            type="text"
            placeholder="Given (e.g. CP, P)"
            value={givenInput}
            onChange={(e) => setGivenInput(e.target.value)}
            className="w-48 px-3 py-1.5 text-xs font-mono bg-white border border-[#D1CFC7] rounded"
          />
          <input
            type="text"
            placeholder="Breakdown (e.g. CP + P)"
            value={breakdownInput}
            onChange={(e) => setBreakdownInput(e.target.value)}
            className="w-48 px-3 py-1.5 text-xs font-mono bg-white border border-[#D1CFC7] rounded"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Formula</span>
          </button>
          {rowErr && <div className="w-full text-[11px] font-mono text-[#DC2626]">{rowErr}</div>}
        </form>
      </div>

      {/* 9B) AUTONOMOUS BACKWARD-CHAINING, SUBSTITUTION & DISCOVERY ENGINE */}
      <div className="p-4 rounded-lg bg-[#FBFBF7] border border-[#DFDDD4] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1D4ED8]">
              9a) Autonomous Solver Engine (Backward Chaining · Substitution · Operator Discovery)
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
              Priority: All-Given Breakdown first → Backward subgoal lookup → Missing-var substitution (SP = CP - L) → Bounded discovery with User Confirmation.
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleRunSolver({
                  g: 'selling price = 30, cost price = 20',
                  a: 'Profit%',
                  exp: '50',
                })
              }
              className="px-2 py-1 rounded border border-[#DFDDD4] bg-white hover:bg-[#F9F8F4] font-mono text-[10px] font-bold text-[#111827] cursor-pointer"
            >
              Sample: Backward Profit%
            </button>
            <button
              type="button"
              onClick={() =>
                handleRunSolver({
                  g: 'SP = 30, CP = 40',
                  a: 'L',
                  exp: '10',
                })
              }
              className="px-2 py-1 rounded border border-[#DFDDD4] bg-white hover:bg-[#F9F8F4] font-mono text-[10px] font-bold text-[#111827] cursor-pointer"
            >
              Sample: Missing L (SP=CP-L)
            </button>
            <button
              type="button"
              onClick={() =>
                handleRunSolver({
                  g: 'x + y = 5, y - x = 1',
                  a: 'x + y',
                  exp: '5',
                })
              }
              className="px-2 py-1 rounded border border-[#DFDDD4] bg-white hover:bg-[#F9F8F4] font-mono text-[10px] font-bold text-[#111827] cursor-pointer"
            >
              Sample: x+y=5, y-x=1
            </button>
            <button
              type="button"
              onClick={() =>
                handleRunSolver({
                  g: 'MP = 100, D = 15',
                  a: 'Net Sale',
                  exp: '85',
                })
              }
              className="px-2 py-1 rounded border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] font-mono text-[10px] font-bold text-[#B45309] cursor-pointer"
            >
              Sample: Discover + Alias Match
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 font-mono text-xs">
          <div className="md:col-span-5">
            <label className="block text-[10px] uppercase text-[#15803D] font-bold mb-1">
              Given
            </label>
            <input
              type="text"
              value={testGiven}
              onChange={(e) => setTestGiven(e.target.value)}
              placeholder="e.g. SP = 30, CP = 20"
              className="w-full px-3 py-2 bg-white border border-[#D1CFC7] rounded focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[10px] uppercase text-[#B45309] font-bold mb-1">
              Asked
            </label>
            <input
              type="text"
              value={testAsked}
              onChange={(e) => setTestAsked(e.target.value)}
              placeholder="e.g. Profit% or L"
              className="w-full px-3 py-2 bg-white border border-[#D1CFC7] rounded focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase text-[#6B7280] font-bold mb-1">
              Expected Ans
            </label>
            <input
              type="text"
              value={testExpected}
              onChange={(e) => setTestExpected(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 bg-white border border-[#D1CFC7] rounded focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => handleRunSolver()}
              className="w-full py-2 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Solver</span>
            </button>
          </div>
        </div>

        {confirmFeedback && (
          <div className="p-2.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-mono font-bold text-[#15803D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{confirmFeedback}</span>
          </div>
        )}

        {runReport && (
          <div className="p-3.5 rounded-lg bg-white border border-[#DFDDD4] space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0EFEA] pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                    runReport.solved
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                      : runReport.mode === 'discovery-needed'
                        ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                        : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                  }`}
                >
                  {runReport.solved
                    ? `SOLVED: ${runReport.normalizedAsked} = ${runReport.derivedText}`
                    : runReport.mode === 'discovery-needed'
                      ? 'DISCOVERY CANDIDATE READY'
                      : 'NOT SOLVED'}
                </span>
                {runReport.matchesExpected !== null && (
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                      runReport.matchesExpected
                        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                        : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                    }`}
                  >
                    {runReport.matchesExpected
                      ? `Matches Target (${formatNumClean(runReport.expectedValue!)})`
                      : `Mismatch (Expected ${formatNumClean(runReport.expectedValue!)})`}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#6B7280]">{runReport.statusMessage}</span>
            </div>

            {runReport.steps.length > 0 && (
              <div className="space-y-1.5">
                {runReport.steps.map((st) => (
                  <div
                    key={st.stepNo}
                    className="p-2 rounded bg-[#F9F8F4] border border-[#E5E3DC] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-[#1D4ED8] mr-2">Step - {st.stepNo}:</span>
                      <span className="text-[#111827]">{st.description}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white border border-[#DFDDD4] font-bold text-[#15803D]">
                      {st.resultText}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* User Confirmation Gate for Discovered Registry Candidates */}
            {activeCandidate && (
              <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#B45309]">
                    Candidate {candidateIdx + 1} / {runReport.discoveryCandidates.length}:{' '}
                    <code>
                      {activeCandidate.askedLabel} = {activeCandidate.breakdown}
                    </code>{' '}
                    (Given: {activeCandidate.givenVars.join(', ')})
                  </span>
                  {!activeCandidate.usesAllGivens && (
                    <span className="px-2 py-0.5 rounded bg-white border border-[#FDE68A] text-[10px] text-[#B45309]">
                      Uses subset of Given (remaining kept for later)
                    </span>
                  )}
                </div>

                {activeCandidate.matchingExistingAsked && (
                  <div className="text-[11px] text-[#1D4ED8] font-bold">
                    Matches existing formula under &quot;{activeCandidate.matchingExistingAsked}
                    &quot; — Solver suggests appending &quot;{activeCandidate.askedLabel}&quot; as
                    an alias!
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {activeCandidate.matchingExistingRowId && (
                    <button
                      type="button"
                      onClick={() => handleConfirmCandidate(activeCandidate, true)}
                      className="px-3 py-1.5 rounded bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        Confirm Alias (&quot;{activeCandidate.askedLabel}&quot; →{' '}
                        {activeCandidate.matchingExistingAsked})
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleConfirmCandidate(activeCandidate, false)}
                    className="px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Append New Entry</span>
                  </button>
                  {runReport.discoveryCandidates.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCandidateIdx((i) => (i + 1) % runReport.discoveryCandidates.length)
                      }
                      className="px-3 py-1.5 rounded border border-[#D1CFC7] bg-white hover:bg-[#F9F8F4] text-[#4B5563] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Reject &amp; Next Candidate</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 9C) SYMBOL ALIASES TABLE ("cost price" -> "CP", written by User / Solver) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
            9b) Symbol Alias Reformation Table (Normalizes Long Names ↔ Short Symbols)
          </div>
        </div>
        <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                <th className="py-2 px-3 w-14">S.No</th>
                <th className="py-2 px-3">Aliases</th>
                <th className="py-2 px-3">Canonical Symbol</th>
                <th className="py-2 px-3 text-center w-24">Written By</th>
                <th className="py-2 px-3 text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {symbolAliases.map((sa, idx) => (
                <tr key={sa.id} className="hover:bg-[#F9F8F4]/60">
                  <td className="py-2 px-3 text-[#6B7280] font-bold">{idx + 1})</td>
                  <td className="py-2 px-3 text-[#111827]">
                    {sa.aliases.map((a, aIdx) => (
                      <span
                        key={`${sa.id}-${aIdx}`}
                        className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-[11px]"
                      >
                        ({['i', 'ii', 'iii', 'iv'][aIdx] || aIdx + 1}) {a}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-bold">
                      {sa.canonical}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-[#4B5563]">{sa.writtenBy}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setSymbolAliases((prev) => prev.filter((item) => item.id !== sa.id))
                      }
                      className="p-1 rounded border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                      title="Delete Alias"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleAddAlias}
          className="mt-2.5 p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] flex flex-wrap items-center gap-2.5"
        >
          <input
            type="text"
            placeholder="Aliases comma-separated (e.g. cost price, CP)"
            value={aliasListInput}
            onChange={(e) => setAliasListInput(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-1.5 text-xs font-mono bg-white border border-[#D1CFC7] rounded"
          />
          <input
            type="text"
            placeholder="Canonical (e.g. CP)"
            value={canonicalInput}
            onChange={(e) => setCanonicalInput(e.target.value)}
            className="w-40 px-3 py-1.5 text-xs font-mono bg-white border border-[#D1CFC7] rounded"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Symbol Alias</span>
          </button>
          {aliasErr && <div className="w-full text-[11px] font-mono text-[#DC2626]">{aliasErr}</div>}
        </form>
      </div>
    </div>
  );
};
