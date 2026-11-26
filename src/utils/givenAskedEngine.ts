export interface BoundaryRuleItem {
  id: string;
  name: string;
  startPoint: string;
  /** Supports single end marker (e.g. `.`) or pipe-separated multi-endpoints (e.g. `. | ? | [`) */
  endPoint: string;
}

/** Matches notebook "Eg - Operator Registry": S.no | name | eg output | symbol | Topic */
export interface OperatorRuleItem {
  id: string;
  name: string;
  egOutput: string;
  symbol: string;
  topic: string;
  enabled: boolean;
}

/** Matches notebook top section: S.no | "symbol" aliases -> written by User/Solver */
export interface SymbolAliasItem {
  id: string;
  /** Listed aliases, e.g. ["cost price", "CP"] */
  aliases: string[];
  /** Canonical short token used in formulas, e.g. "CP" */
  canonical: string;
  writtenBy: 'User' | 'Solver';
}

export interface SolverBreakdownBranch {
  id: string;
  givenVars: string[];
  breakdown: string;
}

/** Matches notebook "Solver's Registry": S.no | Asked (aliases) | Given | Breakdown */
export interface SolverPathRuleItem {
  id: string;
  askedAliases: string[];
  branches: SolverBreakdownBranch[];
  hitCount: number;
  writtenBy: 'User' | 'Solver';
}

export interface MatchedRuleResult {
  ruleNo: number;
  ruleId: string;
  ruleName: string;
  startPoint: string;
  matchedEndPoint: string;
  extracted: string;
  startIdx: number;
  endIdx: number;
}

export interface ExtractionSideResult {
  items: string[];
  usedRulesText: string;
  matchedRules: MatchedRuleResult[];
  recognizedOperators: OperatorRuleItem[];
  usedCombinedFallback: boolean;
}

export interface GivenAskedExtractionOutput {
  given: ExtractionSideResult;
  asked: ExtractionSideResult;
}

export const INITIAL_ASKED_RULES: BoundaryRuleItem[] = [
  { id: 'ask-1', name: 'then find the value of', startPoint: 'then find the value of', endPoint: '. | ? | [' },
  { id: 'ask-2', name: 'find the value of', startPoint: 'find the value of', endPoint: '. | ? | [' },
  { id: 'ask-3', name: 'then find', startPoint: 'then find', endPoint: '. | ? | [' },
  { id: 'ask-4', name: 'find', startPoint: 'find', endPoint: '. | ? | [' },
  { id: 'ask-5', name: 'what is the value of', startPoint: 'what is the value of', endPoint: '? | . | [' },
];

export const INITIAL_GIVEN_RULES: BoundaryRuleItem[] = [
  { id: 'giv-1', name: 'if', startPoint: 'If', endPoint: ', | and* -> then | find | what | . | ?' },
  { id: 'giv-2', name: 'given', startPoint: 'given', endPoint: ', | and* -> then | find | what | . | ?' },
  { id: 'giv-3', name: 'and', startPoint: 'and', endPoint: ', | . | then | find | What' },
  { id: 'giv-4', name: 'in', startPoint: 'In', endPoint: ', | . | then' },
  { id: 'giv-5', name: 'let', startPoint: 'Let', endPoint: ', | . | then' },
];

export const INITIAL_OPERATOR_RULES: OperatorRuleItem[] = [
  { id: 'op-plus', name: 'plus', egOutput: 'x + x = 2x', symbol: '+', topic: 'General', enabled: true },
  { id: 'op-divide', name: 'divide', egOutput: 'x / x = 1', symbol: '/', topic: 'General', enabled: true },
  { id: 'op-multiply', name: 'multiply', egOutput: 'x * x = x^2', symbol: '*', topic: 'General', enabled: true },
  { id: 'op-subtract', name: 'subtraction', egOutput: 'x - x = 0', symbol: '-', topic: 'General', enabled: true },
  { id: 'op-equals', name: 'equals / substitute', egOutput: 'a = b => a - b = 0', symbol: '=', topic: 'General', enabled: true },
  { id: 'op-pow', name: 'power', egOutput: 'x * x = x^2', symbol: '^', topic: 'General', enabled: true },
  { id: 'op-sqrt', name: 'square root', egOutput: 'sqrt(x^2) = x', symbol: 'sqrt', topic: 'General', enabled: true },
  { id: 'op-cbrt', name: 'cube root', egOutput: 'cbrt(x^3) = x', symbol: 'cbrt', topic: 'General', enabled: true },
  { id: 'op-ddiv', name: 'inline divide', egOutput: 'a // b = a / b', symbol: '//', topic: 'General', enabled: true },
  { id: 'op-divkw', name: 'div word', egOutput: 'a div b = a / b', symbol: 'div', topic: 'General', enabled: true },
  { id: 'op-ratio', name: 'ratio', egOutput: 'a : b = a / b', symbol: ':', topic: 'General', enabled: true },
  { id: 'op-le', name: 'less or equal', egOutput: '0 <= x <= 90', symbol: '<=', topic: 'General', enabled: true },
  { id: 'op-ge', name: 'greater or equal', egOutput: 'x >= 0', symbol: '>=', topic: 'General', enabled: true },
  { id: 'op-ne', name: 'not equal', egOutput: 'x != 0', symbol: '!=', topic: 'General', enabled: true },
  { id: 'op-sin', name: 'sine', egOutput: 'sin theta = O / H', symbol: 'sin', topic: 'Trigonometry', enabled: true },
  { id: 'op-cos', name: 'cosine', egOutput: 'cos theta = A / H', symbol: 'cos', topic: 'Trigonometry', enabled: true },
  { id: 'op-tan', name: 'tangent', egOutput: 'tan theta = O / A', symbol: 'tan', topic: 'Trigonometry', enabled: true },
  { id: 'op-cot', name: 'cotangent', egOutput: 'cot theta = A / O', symbol: 'cot', topic: 'Trigonometry', enabled: true },
  { id: 'op-sec', name: 'secant', egOutput: 'sec theta = H / A', symbol: 'sec', topic: 'Trigonometry', enabled: true },
  { id: 'op-cosec', name: 'cosecant', egOutput: 'cosec theta = H / O', symbol: 'cosec', topic: 'Trigonometry', enabled: true },
  { id: 'op-deg', name: 'degree', egOutput: '90 deg', symbol: 'deg', topic: 'Geometry', enabled: true },
  { id: 'op-ang', name: 'angle', egOutput: 'ang B = 90 deg', symbol: 'ang', topic: 'Geometry', enabled: true },
  { id: 'op-tri', name: 'triangle', egOutput: 'tri ABC', symbol: 'tri', topic: 'Geometry', enabled: true },
  { id: 'op-approx', name: 'congruent', egOutput: 'tri ABC ~= tri DEF', symbol: '~=', topic: 'Geometry', enabled: true },
  { id: 'op-theta', name: 'theta symbol', egOutput: 'sin theta', symbol: 'theta', topic: 'Trigonometry', enabled: true },
  { id: 'op-alpha', name: 'alpha symbol', egOutput: 'sin alpha', symbol: 'alpha', topic: 'Trigonometry', enabled: true },
  { id: 'op-beta', name: 'beta symbol', egOutput: 'sin beta', symbol: 'beta', topic: 'Trigonometry', enabled: true },
  { id: 'op-pi', name: 'pi constant', egOutput: 'pi = 3.14159', symbol: 'pi', topic: 'General', enabled: true },
];

export const INITIAL_SYMBOL_ALIASES: SymbolAliasItem[] = [
  { id: 'sym-cp', aliases: ['cost price', 'CP', 'C.P.'], canonical: 'CP', writtenBy: 'User' },
  { id: 'sym-sp', aliases: ['selling price', 'S.P.', 'SP'], canonical: 'SP', writtenBy: 'User' },
  { id: 'sym-p', aliases: ['profit', 'gain', 'P'], canonical: 'P', writtenBy: 'User' },
  { id: 'sym-l', aliases: ['loss', 'L'], canonical: 'L', writtenBy: 'User' },
  { id: 'sym-mp', aliases: ['marked price', 'M.P.', 'MP'], canonical: 'MP', writtenBy: 'User' },
  { id: 'sym-d', aliases: ['discount', 'D'], canonical: 'D', writtenBy: 'User' },
  { id: 'sym-ppct', aliases: ['profit percentage', 'profit percent', 'profit%', 'P%'], canonical: 'Profit%', writtenBy: 'User' },
  { id: 'sym-lpct', aliases: ['loss percentage', 'loss percent', 'loss%', 'L%'], canonical: 'Loss%', writtenBy: 'User' },
];

export const INITIAL_SOLVER_PATH_RULES: SolverPathRuleItem[] = [
  {
    id: 'sol-sp',
    askedAliases: ['Selling Price', 'S.P.', 'SP'],
    branches: [
      { id: 'br-sp-1', givenVars: ['CP', 'P'], breakdown: 'CP + P' },
      { id: 'br-sp-2', givenVars: ['CP', 'L'], breakdown: 'CP - L' },
      { id: 'br-sp-3', givenVars: ['MP', 'D'], breakdown: 'MP - D' },
    ],
    hitCount: 0,
    writtenBy: 'User',
  },
  {
    id: 'sol-ppct',
    askedAliases: ['Profit%', 'Profit Percentage', 'P%'],
    branches: [
      { id: 'br-ppct-1', givenVars: ['P', 'CP'], breakdown: 'P / CP * 100' },
    ],
    hitCount: 0,
    writtenBy: 'User',
  },
  {
    id: 'sol-lpct',
    askedAliases: ['Loss%', 'Loss Percentage', 'L%'],
    branches: [
      { id: 'br-lpct-1', givenVars: ['L', 'CP'], breakdown: 'L / CP * 100' },
    ],
    hitCount: 0,
    writtenBy: 'User',
  },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMathMask(raw: string): { masked: string } {
  const masked = raw.replace(/<math\s*==\s*([^>]+)>/gi, (full) => {
    return `\u0001${'\u0002'.repeat(Math.max(0, full.length - 2))}\u0003`;
  });
  return { masked };
}

function findTokenMatches(
  text: string,
  maskedText: string,
  token: string,
  _isEndToken: boolean
): { start: number; end: number }[] {
  const cleanTok = token.trim();
  if (!cleanTok) return [];

  const results: { start: number; end: number }[] = [];
  const isWordLike = /^[A-Za-z0-9_ ]+$/.test(cleanTok);

  if (cleanTok === '.' || cleanTok === ',') {
    const punctRe = cleanTok === '.' ? /\./g : /,/g;
    let m: RegExpExecArray | null;
    while ((m = punctRe.exec(maskedText)) !== null) {
      const idx = m.index;
      const prev = idx > 0 ? text[idx - 1] : '';
      const next = idx + 1 < text.length ? text[idx + 1] : '';
      if (/\d/.test(prev) && /\d/.test(next)) continue;
      results.push({ start: idx, end: idx + 1 });
    }
    return results;
  }

  let pattern: RegExp;
  if (isWordLike) {
    const flexWords = cleanTok
      .split(/\s+/)
      .map(escapeRegex)
      .join('\\s+');
    pattern = new RegExp(`\\b${flexWords}\\b`, 'gi');
  } else {
    pattern = new RegExp(escapeRegex(cleanTok), 'gi');
  }

  let m: RegExpExecArray | null;
  while ((m = pattern.exec(maskedText)) !== null) {
    results.push({ start: m.index, end: m.index + m[0].length });
  }
  return results;
}

function cleanExtractedFragment(rawFragment: string): string {
  let out = rawFragment.trim();
  out = out.replace(/^[,;:\-\s]+/, '').trim();
  out = out.replace(/(?:\s*=\s*\?|\s*=|\s*\?|\s*[,.;:]+)+$/g, '').trim();
  out = out.replace(/\s*\[[^\]]*$/g, '').trim();
  return out;
}

export function recognizeOperatorsInText(
  texts: string[],
  operatorRules: OperatorRuleItem[]
): OperatorRuleItem[] {
  const combined = texts
    .map((t) => t.replace(/<math\s*==\s*([^>]+)>/gi, ' $1 '))
    .join(' ');
  if (!combined.trim()) return [];

  const sorted = [...operatorRules]
    .filter((op) => op.enabled !== false && op.symbol.trim().length > 0)
    .sort((a, b) => b.symbol.length - a.symbol.length);

  const found: OperatorRuleItem[] = [];
  const seenSymbols = new Set<string>();

  for (const op of sorted) {
    const sym = op.symbol.trim();
    const symKey = sym.toLowerCase();
    if (!sym || seenSymbols.has(symKey)) continue;
    let matched = false;
    if (/^[A-Za-z0-9_]+$/.test(sym)) {
      const re = new RegExp(`\\b${escapeRegex(sym)}\\b`, 'i');
      matched = re.test(combined);
    } else if (sym === '=') {
      matched = /(?:^|[^<>!~])=(?:$|[^=>])/.test(combined);
    } else if (sym === '/') {
      matched = /(?:^|[^/])\/(?:$|[^/])/.test(combined);
    } else {
      matched = combined.includes(sym);
    }
    if (matched) {
      seenSymbols.add(symKey);
      found.push(op);
    }
  }

  return found;
}

interface EndpointHop {
  tokens: string[];
  repeat: boolean;
}

export function parseEndPointChain(endPointRaw: string): EndpointHop[] {
  return String(endPointRaw || '')
    .split(/\s*->\s*/)
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return null;
      const repeat = /\*$/.test(trimmed);
      const body = repeat ? trimmed.slice(0, -1).trim() : trimmed;
      const tokens = body
        .split('|')
        .map((t) => t.trim())
        .filter(Boolean);
      if (tokens.length === 0) return null;
      return { tokens, repeat };
    })
    .filter((h): h is EndpointHop => h !== null);
}

const TERMINAL_STOP_TOKENS = new Set(['.', '?', 'find', 'then', 'what', 'what is']);

function findEarliestTokenHitAfter(
  source: string,
  masked: string,
  tokens: string[],
  afterIdx: number
): { start: number; end: number; tok: string } | null {
  let best: { start: number; end: number; tok: string } | null = null;
  for (const tok of tokens) {
    const hits = findTokenMatches(source, masked, tok, true);
    for (const h of hits) {
      if (h.start >= afterIdx) {
        if (!best || h.start < best.start) {
          best = { ...h, tok };
        }
        break;
      }
    }
  }
  return best;
}

function runSideExtraction(
  questionText: string,
  rules: BoundaryRuleItem[],
  combineFallback: boolean,
  operatorRules: OperatorRuleItem[]
): ExtractionSideResult {
  const source = String(questionText || '').trim();
  if (!source || rules.length === 0) {
    return {
      items: [],
      usedRulesText: '—',
      matchedRules: [],
      recognizedOperators: [],
      usedCombinedFallback: false,
    };
  }

  const { masked } = buildMathMask(source);
  type CandidateWithSegments = MatchedRuleResult & {
    segments: string[];
    startLen: number;
    spanLen: number;
  };
  const allCandidates: CandidateWithSegments[] = [];

  rules.forEach((rule, idx) => {
    const ruleNo = idx + 1;
    const startTokens = rule.startPoint
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    const hops = parseEndPointChain(rule.endPoint);

    if (startTokens.length === 0 || hops.length === 0) return;

    for (const sTok of startTokens) {
      const sHits = findTokenMatches(source, masked, sTok, false);
      for (const sHit of sHits) {
        let cursor = sHit.end;
        const segments: string[] = [];
        let lastEndIdx = sHit.end;
        let lastMatchedTok = '';
        let abortedByTerminal = false;

        for (let hIdx = 0; hIdx < hops.length && !abortedByTerminal; hIdx += 1) {
          const hop = hops[hIdx];
          const nextHop = hops[hIdx + 1];

          if (hop.repeat) {
            for (let guard = 0; guard < 15; guard += 1) {
              const sepHit = findEarliestTokenHitAfter(source, masked, hop.tokens, cursor);
              const stopHit = nextHop
                ? findEarliestTokenHitAfter(source, masked, nextHop.tokens, cursor)
                : null;
              if (!sepHit) break;
              if (stopHit && stopHit.start <= sepHit.start) break;

              const slice = cleanExtractedFragment(source.slice(cursor, sepHit.start));
              if (slice) segments.push(slice);
              cursor = sepHit.end;
              lastEndIdx = sepHit.start;
              lastMatchedTok = sepHit.tok;
              if (TERMINAL_STOP_TOKENS.has(sepHit.tok.toLowerCase())) {
                abortedByTerminal = true;
                break;
              }
            }
          } else {
            const hit = findEarliestTokenHitAfter(source, masked, hop.tokens, cursor);
            if (!hit) {
              // If this single hop didn't match, stop chaining unless it's already captured earlier segments
              break;
            }
            const slice = cleanExtractedFragment(source.slice(cursor, hit.start));
            if (slice) segments.push(slice);
            cursor = hit.end;
            lastEndIdx = hit.start;
            lastMatchedTok = hit.tok;
            if (TERMINAL_STOP_TOKENS.has(hit.tok.toLowerCase())) {
              abortedByTerminal = true;
            }
          }
        }

        if (segments.length === 0) continue;

        allCandidates.push({
          ruleNo,
          ruleId: rule.id,
          ruleName: rule.name,
          startPoint: sTok,
          matchedEndPoint:
            segments.length > 1 ? `St → E1..E${segments.length} (${lastMatchedTok})` : lastMatchedTok,
          extracted: segments.join(', '),
          segments,
          startIdx: sHit.start,
          endIdx: lastEndIdx,
          startLen: sTok.trim().length,
          spanLen: Math.max(1, lastEndIdx - sHit.end),
        });
      }
    }
  });

  if (allCandidates.length === 0) {
    return {
      items: [],
      usedRulesText: 'No matching rule',
      matchedRules: [],
      recognizedOperators: [],
      usedCombinedFallback: false,
    };
  }

  const ranked = [...allCandidates].sort((a, b) => {
    if (b.startLen !== a.startLen) return b.startLen - a.startLen;
    if (b.segments.length !== a.segments.length) return b.segments.length - a.segments.length;
    if (a.spanLen !== b.spanLen) return a.spanLen - b.spanLen;
    if (a.startIdx !== b.startIdx) return a.startIdx - b.startIdx;
    return a.ruleNo - b.ruleNo;
  });

  const formatRuleLabel = (c: CandidateWithSegments) =>
    c.segments.length > 1
      ? `${c.ruleNo} (${c.ruleName}: ${Array.from({ length: c.segments.length }, (_, i) => `E${i + 1}`).join('→')})`
      : `${c.ruleNo} (${c.ruleName})`;

  if (!combineFallback) {
    const winner = ranked[0];
    const items = [...winner.segments];
    return {
      items,
      usedRulesText: formatRuleLabel(winner),
      matchedRules: [winner],
      recognizedOperators: recognizeOperatorsInText(items, operatorRules),
      usedCombinedFallback: false,
    };
  }

  const chosen: typeof ranked = [];
  const usedRanges: { start: number; end: number }[] = [];
  const seenNormalizedText = new Set<string>();
  const collectedItems: string[] = [];

  for (const cand of ranked) {
    const overlaps = usedRanges.some(
      (r) => cand.startIdx < r.end && cand.endIdx > r.start
    );
    if (overlaps) continue;
    const freshSegments = cand.segments.filter((seg) => {
      const norm = seg.toLowerCase().replace(/\s+/g, ' ');
      return !seenNormalizedText.has(norm);
    });
    if (freshSegments.length === 0) continue;

    chosen.push(cand);
    usedRanges.push({ start: cand.startIdx, end: cand.endIdx });
    freshSegments.forEach((seg) => {
      seenNormalizedText.add(seg.toLowerCase().replace(/\s+/g, ' '));
    });
  }

  chosen.sort((a, b) => a.startIdx - b.startIdx);

  const seenFinal = new Set<string>();
  for (const cand of chosen) {
    for (const seg of cand.segments) {
      const norm = seg.toLowerCase().replace(/\s+/g, ' ');
      if (seenFinal.has(norm)) continue;
      seenFinal.add(norm);
      collectedItems.push(seg);
    }
  }

  const usedCombined = chosen.length > 1;
  const usedRulesText = usedCombined
    ? `${chosen.map(formatRuleLabel).join(' + ')} [Combined]`
    : formatRuleLabel(chosen[0]);

  return {
    items: collectedItems,
    usedRulesText,
    matchedRules: chosen,
    recognizedOperators: recognizeOperatorsInText(collectedItems, operatorRules),
    usedCombinedFallback: usedCombined,
  };
}

export function extractGivenAndAsked(
  questionText: string,
  givenRules: BoundaryRuleItem[],
  askedRules: BoundaryRuleItem[],
  operatorRules: OperatorRuleItem[],
  options: { combineGivenFallback: boolean; combineAskedFallback: boolean }
): GivenAskedExtractionOutput {
  return {
    given: runSideExtraction(
      questionText,
      givenRules,
      options.combineGivenFallback,
      operatorRules
    ),
    asked: runSideExtraction(
      questionText,
      askedRules,
      options.combineAskedFallback,
      operatorRules
    ),
  };
}
