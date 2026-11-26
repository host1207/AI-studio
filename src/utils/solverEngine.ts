import type {
  OperatorRuleItem,
  SolverBreakdownBranch,
  SolverPathRuleItem,
  SymbolAliasItem,
} from './givenAskedEngine';

// ============================================================================
// 1. AST & SAFE EXPRESSION ENGINE (GATED BY ACTIVE OPERATOR REGISTRY)
// ============================================================================

export type MathAst =
  | { type: 'num'; value: number }
  | { type: 'var'; name: string }
  | { type: 'unary'; op: '-'; arg: MathAst }
  | { type: 'call'; fn: string; arg: MathAst }
  | { type: 'bin'; op: '+' | '-' | '*' | '/' | '^'; left: MathAst; right: MathAst };

interface Tok {
  kind: 'num' | 'id' | 'op' | 'lparen' | 'rparen';
  val: string;
}

const KNOWN_FUNCTIONS = new Set(['sqrt', 'cbrt', 'sin', 'cos', 'tan', 'cot', 'sec', 'cosec']);

export function normalizeSymbolWithAliases(
  rawText: string,
  symbolAliases: SymbolAliasItem[]
): string {
  let out = String(rawText || '')
    .replace(/<math\s*==\s*([^>]+)>/gi, ' $1 ')
    .replace(/\u221A/g, 'sqrt')
    .replace(/\s+/g, ' ')
    .trim();

  // Sort longest alias first so "cost price" or "selling price" replaces before single tokens
  const pairs: { alias: string; canonical: string }[] = [];
  for (const item of symbolAliases) {
    const canon = item.canonical.trim();
    if (!canon) continue;
    for (const a of item.aliases) {
      const cleanAlias = a.trim();
      if (cleanAlias && cleanAlias.toLowerCase() !== canon.toLowerCase()) {
        pairs.push({ alias: cleanAlias, canonical: canon });
      }
    }
  }
  pairs.sort((a, b) => b.alias.length - a.alias.length);

  for (const { alias, canonical } of pairs) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    // Use boundary-safe matching even when alias ends with `.` or `%` (like S.P. or profit%)
    const re = new RegExp(`(^|[^A-Za-z0-9_])${escaped}(?=$|[^A-Za-z0-9_])`, 'gi');
    out = out.replace(re, `$1${canonical}`);
  }

  return out.replace(/\s+/g, ' ').trim();
}

function tokenizeMath(expr: string): Tok[] {
  const s = expr
    .replace(/<math\s*==\s*([^>]+)>/gi, ' $1 ')
    .replace(/\/\//g, '/')
    .replace(/\bdiv\b/gi, '/')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  const tokens: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(s[i + 1] || ''))) {
      let end = i + 1;
      while (end < s.length && /[\d.]/.test(s[end])) end += 1;
      tokens.push({ kind: 'num', val: s.slice(i, end) });
      i = end;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let end = i + 1;
      while (end < s.length && /[A-Za-z0-9_.]/.test(s[end])) {
        // Don't swallow trailing sentence dot
        if (s[end] === '.' && (end + 1 >= s.length || !/[A-Za-z0-9_]/.test(s[end + 1]))) {
          break;
        }
        end += 1;
      }
      if (end < s.length && s[end] === '%') {
        end += 1;
      }
      tokens.push({ kind: 'id', val: s.slice(i, end) });
      i = end;
      continue;
    }
    if (ch === '(' || ch === '[') {
      tokens.push({ kind: 'lparen', val: '(' });
      i += 1;
      continue;
    }
    if (ch === ')' || ch === ']') {
      tokens.push({ kind: 'rparen', val: ')' });
      i += 1;
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ kind: 'op', val: ch });
      i += 1;
      continue;
    }
    i += 1;
  }

  // Insert implicit `*` where appropriate (e.g. `2 x`, `2(a+b)`, `(a)(b)`, `x sqrt(2)`)
  const withImplicit: Tok[] = [];
  for (let k = 0; k < tokens.length; k += 1) {
    const curr = tokens[k];
    const prev = withImplicit[withImplicit.length - 1];
    if (prev) {
      const prevIsVal = prev.kind === 'num' || prev.kind === 'rparen' || (prev.kind === 'id' && !KNOWN_FUNCTIONS.has(prev.val.toLowerCase()));
      const currIsVal = curr.kind === 'num' || curr.kind === 'lparen' || curr.kind === 'id';
      if (prevIsVal && currIsVal) {
        withImplicit.push({ kind: 'op', val: '*' });
      }
    }
    withImplicit.push(curr);
  }
  return withImplicit;
}

export function parseMathAst(expr: string): MathAst | null {
  const tokens = tokenizeMath(expr);
  if (tokens.length === 0) return null;
  let pos = 0;

  const peek = (): Tok | undefined => tokens[pos];
  const consume = (): Tok | undefined => tokens[pos++];

  const parseAddSub = (): MathAst | null => {
    let left = parseMulDiv();
    if (!left) return null;
    while (peek()?.kind === 'op' && (peek()?.val === '+' || peek()?.val === '-')) {
      const op = consume()!.val as '+' | '-';
      const right = parseMulDiv();
      if (!right) return null;
      left = { type: 'bin', op, left, right };
    }
    return left;
  };

  const parseMulDiv = (): MathAst | null => {
    let left = parseUnary();
    if (!left) return null;
    while (peek()?.kind === 'op' && (peek()?.val === '*' || peek()?.val === '/')) {
      const op = consume()!.val as '*' | '/';
      const right = parseUnary();
      if (!right) return null;
      left = { type: 'bin', op, left, right };
    }
    return left;
  };

  const parseUnary = (): MathAst | null => {
    if (peek()?.kind === 'op' && (peek()?.val === '-' || peek()?.val === '+')) {
      const op = consume()!.val;
      const arg = parseUnary();
      if (!arg) return null;
      return op === '-' ? { type: 'unary', op: '-', arg } : arg;
    }
    return parsePow();
  };

  const parsePow = (): MathAst | null => {
    const base = parsePrimary();
    if (!base) return null;
    if (peek()?.kind === 'op' && peek()?.val === '^') {
      consume();
      const exp = parseUnary();
      if (!exp) return null;
      return { type: 'bin', op: '^', left: base, right: exp };
    }
    return base;
  };

  const parsePrimary = (): MathAst | null => {
    const t = peek();
    if (!t) return null;
    if (t.kind === 'num') {
      consume();
      const v = Number(t.val);
      return Number.isFinite(v) ? { type: 'num', value: v } : null;
    }
    if (t.kind === 'id') {
      consume();
      const lower = t.val.toLowerCase();
      if (lower === 'pi') return { type: 'num', value: Math.PI };
      if (KNOWN_FUNCTIONS.has(lower)) {
        const arg = parsePrimary();
        if (!arg) return null;
        return { type: 'call', fn: lower, arg };
      }
      return { type: 'var', name: t.val };
    }
    if (t.kind === 'lparen') {
      consume();
      const inner = parseAddSub();
      if (!inner) return null;
      if (peek()?.kind === 'rparen') consume();
      return inner;
    }
    return null;
  };

  const ast = parseAddSub();
  if (!ast || pos < tokens.length) return null;
  return ast;
}

export function extractVarsFromAst(ast: MathAst): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const walk = (node: MathAst) => {
    if (node.type === 'var') {
      const key = node.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(node.name);
      }
      return;
    }
    if (node.type === 'unary' || node.type === 'call') {
      walk(node.arg);
      return;
    }
    if (node.type === 'bin') {
      walk(node.left);
      walk(node.right);
    }
  };
  walk(ast);
  return ordered;
}

export function formatAst(node: MathAst): string {
  switch (node.type) {
    case 'num':
      return Number.isInteger(node.value)
        ? String(node.value)
        : String(Number(node.value.toFixed(6)));
    case 'var':
      return node.name;
    case 'unary':
      return `-${formatAst(node.arg)}`;
    case 'call':
      return `${node.fn}(${formatAst(node.arg)})`;
    case 'bin': {
      const l = node.left.type === 'bin' ? `(${formatAst(node.left)})` : formatAst(node.left);
      const r = node.right.type === 'bin' ? `(${formatAst(node.right)})` : formatAst(node.right);
      return `${l} ${node.op} ${r}`;
    }
  }
}

function getEnabledSymbols(operatorRules: OperatorRuleItem[]): Set<string> {
  const set = new Set<string>();
  for (const op of operatorRules) {
    if (op.enabled !== false && op.symbol.trim()) {
      set.add(op.symbol.trim().toLowerCase());
    }
  }
  return set;
}

export function evaluateAst(
  node: MathAst,
  vars: Record<string, number>,
  enabledSymbols: Set<string>
): { ok: boolean; value: number; usedOps: string[]; missingOp?: string } {
  const usedOps: string[] = [];

  const lookupVar = (name: string): number | undefined => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) return vars[name];
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(vars)) {
      if (k.toLowerCase() === lower) return v;
    }
    return undefined;
  };

  const evalRec = (n: MathAst): { ok: boolean; value: number; missingOp?: string } => {
    if (n.type === 'num') return { ok: true, value: n.value };
    if (n.type === 'var') {
      const v = lookupVar(n.name);
      return v !== undefined ? { ok: true, value: v } : { ok: false, value: NaN };
    }
    if (n.type === 'unary') {
      if (!enabledSymbols.has('-')) return { ok: false, value: NaN, missingOp: '-' };
      usedOps.push('-');
      const r = evalRec(n.arg);
      return r.ok ? { ok: true, value: -r.value } : r;
    }
    if (n.type === 'call') {
      if (!enabledSymbols.has(n.fn)) return { ok: false, value: NaN, missingOp: n.fn };
      usedOps.push(n.fn);
      const arg = evalRec(n.arg);
      if (!arg.ok) return arg;
      const rad = (arg.value * Math.PI) / 180;
      let val = NaN;
      switch (n.fn) {
        case 'sqrt':
          val = arg.value >= 0 ? Math.sqrt(arg.value) : NaN;
          break;
        case 'cbrt':
          val = Math.cbrt(arg.value);
          break;
        case 'sin':
          val = Math.sin(rad);
          break;
        case 'cos':
          val = Math.cos(rad);
          break;
        case 'tan':
          val = Math.tan(rad);
          break;
        case 'cot':
          val = Math.tan(rad) !== 0 ? 1 / Math.tan(rad) : NaN;
          break;
        case 'sec':
          val = Math.cos(rad) !== 0 ? 1 / Math.cos(rad) : NaN;
          break;
        case 'cosec':
          val = Math.sin(rad) !== 0 ? 1 / Math.sin(rad) : NaN;
          break;
      }
      return Number.isFinite(val) ? { ok: true, value: val } : { ok: false, value: NaN };
    }
    // binary
    const sym = n.op;
    if (!enabledSymbols.has(sym)) return { ok: false, value: NaN, missingOp: sym };
    usedOps.push(sym);
    const l = evalRec(n.left);
    if (!l.ok) return l;
    const r = evalRec(n.right);
    if (!r.ok) return r;
    let out = NaN;
    if (sym === '+') out = l.value + r.value;
    else if (sym === '-') out = l.value - r.value;
    else if (sym === '*') out = l.value * r.value;
    else if (sym === '/') out = Math.abs(r.value) > 1e-12 ? l.value / r.value : NaN;
    else if (sym === '^') out = Math.pow(l.value, r.value);
    return Number.isFinite(out) ? { ok: true, value: out } : { ok: false, value: NaN };
  };

  const res = evalRec(node);
  return {
    ok: res.ok,
    value: res.value,
    usedOps: Array.from(new Set(usedOps)),
    missingOp: res.missingOp,
  };
}

// ============================================================================
// 2. SYMBOLIC EQUATION ISOLATION (SOLVES MISSING VARIABLE VIA SUBSTITUTION)
//    e.g. SP = CP - L with SP=30, CP=40 => 30 = 40 - L => L = 40 - 30 = 10
// ============================================================================

function astContainsVar(node: MathAst, targetLower: string): number {
  if (node.type === 'var') return node.name.toLowerCase() === targetLower ? 1 : 0;
  if (node.type === 'unary' || node.type === 'call') return astContainsVar(node.arg, targetLower);
  if (node.type === 'bin') return astContainsVar(node.left, targetLower) + astContainsVar(node.right, targetLower);
  return 0;
}

function isolateSingleVar(
  targetExpr: MathAst,
  otherSide: MathAst,
  targetLower: string,
  enabledSymbols: Set<string>,
  requiredOps: Set<string>
): { isolated: MathAst; missingOp?: string } | null {
  if (targetExpr.type === 'var' && targetExpr.name.toLowerCase() === targetLower) {
    return { isolated: otherSide };
  }

  if (targetExpr.type === 'unary' && targetExpr.op === '-') {
    if (!enabledSymbols.has('-')) return { isolated: otherSide, missingOp: '-' };
    requiredOps.add('-');
    return isolateSingleVar(
      targetExpr.arg,
      { type: 'unary', op: '-', arg: otherSide },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  if (targetExpr.type === 'call' && targetExpr.fn === 'sqrt') {
    if (!enabledSymbols.has('^')) return { isolated: otherSide, missingOp: '^' };
    requiredOps.add('^');
    return isolateSingleVar(
      targetExpr.arg,
      { type: 'bin', op: '^', left: otherSide, right: { type: 'num', value: 2 } },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  if (targetExpr.type !== 'bin') return null;

  const leftCount = astContainsVar(targetExpr.left, targetLower);
  const rightCount = astContainsVar(targetExpr.right, targetLower);
  if (leftCount > 0 && rightCount > 0) return null; // appears on both branches

  const inLeft = leftCount > 0;
  const xBranch = inLeft ? targetExpr.left : targetExpr.right;
  const knownBranch = inLeft ? targetExpr.right : targetExpr.left;

  if (targetExpr.op === '+') {
    if (!enabledSymbols.has('-')) return { isolated: otherSide, missingOp: '-' };
    requiredOps.add('-');
    return isolateSingleVar(
      xBranch,
      { type: 'bin', op: '-', left: otherSide, right: knownBranch },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  if (targetExpr.op === '-') {
    if (inLeft) {
      // X - known = other => X = other + known
      if (!enabledSymbols.has('+')) return { isolated: otherSide, missingOp: '+' };
      requiredOps.add('+');
      return isolateSingleVar(
        xBranch,
        { type: 'bin', op: '+', left: otherSide, right: knownBranch },
        targetLower,
        enabledSymbols,
        requiredOps
      );
    }
    // known - X = other => X = known - other
    if (!enabledSymbols.has('-')) return { isolated: otherSide, missingOp: '-' };
    requiredOps.add('-');
    return isolateSingleVar(
      xBranch,
      { type: 'bin', op: '-', left: knownBranch, right: otherSide },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  if (targetExpr.op === '*') {
    if (!enabledSymbols.has('/')) return { isolated: otherSide, missingOp: '/' };
    requiredOps.add('/');
    return isolateSingleVar(
      xBranch,
      { type: 'bin', op: '/', left: otherSide, right: knownBranch },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  if (targetExpr.op === '/') {
    if (inLeft) {
      // X / known = other => X = other * known
      if (!enabledSymbols.has('*')) return { isolated: otherSide, missingOp: '*' };
      requiredOps.add('*');
      return isolateSingleVar(
        xBranch,
        { type: 'bin', op: '*', left: otherSide, right: knownBranch },
        targetLower,
        enabledSymbols,
        requiredOps
      );
    }
    // known / X = other => X = known / other
    if (!enabledSymbols.has('/')) return { isolated: otherSide, missingOp: '/' };
    requiredOps.add('/');
    return isolateSingleVar(
      xBranch,
      { type: 'bin', op: '/', left: knownBranch, right: otherSide },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  if (targetExpr.op === '^' && inLeft && targetExpr.right.type === 'num' && targetExpr.right.value === 2) {
    if (!enabledSymbols.has('sqrt')) return { isolated: otherSide, missingOp: 'sqrt' };
    requiredOps.add('sqrt');
    return isolateSingleVar(
      xBranch,
      { type: 'call', fn: 'sqrt', arg: otherSide },
      targetLower,
      enabledSymbols,
      requiredOps
    );
  }

  return null;
}

function solveEquationAstForVar(
  lhsText: string,
  rhsText: string,
  targetVar: string,
  knownVars: Record<string, number>,
  enabledSymbols: Set<string>
): {
  ok: boolean;
  value: number;
  isolatedExpr: string;
  usedOps: string[];
  missingOp?: string;
} | null {
  if (!enabledSymbols.has('=')) return null;
  const lhsAst = parseMathAst(lhsText);
  const rhsAst = parseMathAst(rhsText);
  if (!lhsAst || !rhsAst) return null;

  const targetLower = targetVar.toLowerCase();
  const lCount = astContainsVar(lhsAst, targetLower);
  const rCount = astContainsVar(rhsAst, targetLower);
  if (lCount + rCount !== 1) return null;

  const reqOps = new Set<string>(['=']);
  const iso =
    lCount === 1
      ? isolateSingleVar(lhsAst, rhsAst, targetLower, enabledSymbols, reqOps)
      : isolateSingleVar(rhsAst, lhsAst, targetLower, enabledSymbols, reqOps);

  if (!iso) return null;
  if (iso.missingOp) {
    return {
      ok: false,
      value: NaN,
      isolatedExpr: '',
      usedOps: [],
      missingOp: iso.missingOp,
    };
  }

  const evalRes = evaluateAst(iso.isolated, knownVars, enabledSymbols);
  if (!evalRes.ok) {
    return evalRes.missingOp
      ? { ok: false, value: NaN, isolatedExpr: '', usedOps: [], missingOp: evalRes.missingOp }
      : null;
  }

  evalRes.usedOps.forEach((op) => reqOps.add(op));
  return {
    ok: true,
    value: evalRes.value,
    isolatedExpr: formatAst(iso.isolated),
    usedOps: Array.from(reqOps),
  };
}

// ============================================================================
// 3. PARSE GIVEN CLAUSES INTO VARIABLE BINDINGS & MULTI-VAR EQUATIONS
// ============================================================================

interface ParsedGivenData {
  bindings: Record<string, number>;
  equations: { raw: string; lhs: string; rhs: string }[];
  displayPairs: string[];
}

export function parseGivenClauses(
  givenInput: string,
  symbolAliases: SymbolAliasItem[],
  enabledSymbols: Set<string>
): ParsedGivenData {
  const normalized = normalizeSymbolWithAliases(givenInput, symbolAliases);
  const parts = normalized
    .split(/[;,\n]+|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const bindings: Record<string, number> = {};
  const equations: { raw: string; lhs: string; rhs: string }[] = [];
  const displayPairs: string[] = [];

  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const lhs = part.slice(0, eqIdx).trim();
    const rhs = part.slice(eqIdx + 1).trim();
    if (!lhs || !rhs) continue;

    // Simple assignment: Var = numeric expression
    const lhsAst = parseMathAst(lhs);
    const rhsAst = parseMathAst(rhs);
    if (lhsAst && rhsAst && lhsAst.type === 'var' && extractVarsFromAst(rhsAst).length === 0) {
      const ev = evaluateAst(rhsAst, {}, enabledSymbols);
      if (ev.ok) {
        bindings[lhsAst.name] = ev.value;
        displayPairs.push(`${lhsAst.name} = ${formatNumClean(ev.value)}`);
        continue;
      }
    }
    if (lhsAst && rhsAst && rhsAst.type === 'var' && rhsAst.type === 'var') {
      equations.push({ raw: `${lhs} = ${rhs}`, lhs, rhs });
      continue;
    }
    // Reversed assignment: 30 = SP
    if (lhsAst && rhsAst && rhsAst.type === 'var' && extractVarsFromAst(lhsAst).length === 0) {
      const ev = evaluateAst(lhsAst, {}, enabledSymbols);
      if (ev.ok) {
        bindings[rhsAst.name] = ev.value;
        displayPairs.push(`${rhsAst.name} = ${formatNumClean(ev.value)}`);
        continue;
      }
    }
    equations.push({ raw: `${lhs} = ${rhs}`, lhs, rhs });
  }

  return { bindings, equations, displayPairs };
}

export function formatNumClean(n: number): string {
  if (!Number.isFinite(n)) return 'NaN';
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return String(Number(n.toFixed(4)));
}

function getBindingKey(bindings: Record<string, number>, name: string): { key: string; value: number } | null {
  if (Object.prototype.hasOwnProperty.call(bindings, name)) {
    return { key: name, value: bindings[name] };
  }
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(bindings)) {
    if (k.toLowerCase() === lower) return { key: k, value: v };
  }
  return null;
}

// ============================================================================
// 4. BACKWARD CHAINING + MISSING-VAR SUBSTITUTION + FORWARD STEP PLANNER
// ============================================================================

export interface SolverStepOutput {
  stepNo: number;
  kind: 'given' | 'subgoal' | 'substitution' | 'target' | 'system';
  description: string;
  formulaUsed: string;
  resultText: string;
  opsUsed: string[];
}

export interface DiscoveryCandidate {
  id: string;
  askedLabel: string;
  givenVars: string[];
  breakdown: string;
  derivedValue: number;
  depth: number;
  usesAllGivens: boolean;
  /** If this candidate matches an existing Solver's Registry entry's Breakdown, identify it for alias merging! */
  matchingExistingRowId?: string;
  matchingExistingAsked?: string;
}

export interface SolverRunReport {
  solved: boolean;
  mode: 'direct' | 'backward-chain' | 'substitution' | 'linear-system' | 'discovery-needed' | 'unsolved';
  normalizedAsked: string;
  derivedValue: number | null;
  derivedText: string;
  matchesExpected: boolean | null;
  expectedValue: number | null;
  steps: SolverStepOutput[];
  opsUsed: string[];
  discoveryCandidates: DiscoveryCandidate[];
  statusMessage: string;
}

/** Try solving a 2x2 linear system from Givens if operators (+, -, *, /, =) are active */
function trySolve2x2LinearSystem(
  equations: { raw: string; lhs: string; rhs: string }[],
  knownBindings: Record<string, number>,
  enabledSymbols: Set<string>
): { resolvedVars: Record<string, number>; steps: SolverStepOutput[]; ops: string[] } | null {
  if (equations.length < 2) return null;
  if (!enabledSymbols.has('=') || !enabledSymbols.has('+') || !enabledSymbols.has('-') || !enabledSymbols.has('/')) {
    return null;
  }

  for (let i = 0; i < equations.length; i += 1) {
    for (let j = i + 1; j < equations.length; j += 1) {
      const e1 = equations[i];
      const e2 = equations[j];
      const l1 = parseMathAst(e1.lhs);
      const r1 = parseMathAst(e1.rhs);
      const l2 = parseMathAst(e2.lhs);
      const r2 = parseMathAst(e2.rhs);
      if (!l1 || !r1 || !l2 || !r2) continue;

      const f1Ast: MathAst = { type: 'bin', op: '-', left: l1, right: r1 };
      const f2Ast: MathAst = { type: 'bin', op: '-', left: l2, right: r2 };
      const vars = Array.from(
        new Set([...extractVarsFromAst(f1Ast), ...extractVarsFromAst(f2Ast)])
      ).filter((v) => !getBindingKey(knownBindings, v));
      if (vars.length !== 2) continue;

      const [v1, v2] = vars;
      const ev1 = (a: number, b: number) => evaluateAst(f1Ast, { ...knownBindings, [v1]: a, [v2]: b }, enabledSymbols);
      const ev2 = (a: number, b: number) => evaluateAst(f2Ast, { ...knownBindings, [v1]: a, [v2]: b }, enabledSymbols);

      const c1Res = ev1(0, 0);
      const a1Res = ev1(1, 0);
      const b1Res = ev1(0, 1);
      const c2Res = ev2(0, 0);
      const a2Res = ev2(1, 0);
      const b2Res = ev2(0, 1);
      if (!c1Res.ok || !a1Res.ok || !b1Res.ok || !c2Res.ok || !a2Res.ok || !b2Res.ok) continue;

      const a1 = a1Res.value - c1Res.value;
      const b1 = b1Res.value - c1Res.value;
      const k1 = -c1Res.value;
      const a2 = a2Res.value - c2Res.value;
      const b2 = b2Res.value - c2Res.value;
      const k2 = -c2Res.value;

      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-10) continue;

      const val1 = (k1 * b2 - k2 * b1) / det;
      const val2 = (a1 * k2 - a2 * k1) / det;

      // Verify exact residuals
      const chk1 = ev1(val1, val2);
      const chk2 = ev2(val1, val2);
      if (!chk1.ok || !chk2.ok || Math.abs(chk1.value) > 1e-6 || Math.abs(chk2.value) > 1e-6) {
        continue;
      }

      const usedOps = ['=', '+', '-', '/'];
      if (enabledSymbols.has('*')) usedOps.push('*');
      return {
        resolvedVars: { [v1]: val1, [v2]: val2 },
        ops: usedOps,
        steps: [
          {
            stepNo: 1,
            kind: 'system',
            formulaUsed: `${e1.raw}  &  ${e2.raw}`,
            description: `Eliminate variable across [${e1.raw}] and [${e2.raw}]`,
            resultText: `${v1} = ${formatNumClean(val1)}, ${v2} = ${formatNumClean(val2)}`,
            opsUsed: usedOps,
          },
        ],
      };
    }
  }
  return null;
}

export function solveWithRegistry(params: {
  givenInput: string;
  askedInput: string;
  expectedAnswerInput?: string;
  topic?: string;
  operatorRules: OperatorRuleItem[];
  solverEntries: SolverPathRuleItem[];
  symbolAliases: SymbolAliasItem[];
}): SolverRunReport {
  const {
    givenInput,
    askedInput,
    expectedAnswerInput = '',
    topic = 'General',
    operatorRules,
    solverEntries,
    symbolAliases,
  } = params;

  const topicLower = topic.trim().toLowerCase();
  const topicScopedRules = operatorRules.filter(
    (op) =>
      op.enabled !== false &&
      (op.topic.trim().toLowerCase() === 'general' ||
        op.topic.trim().toLowerCase() === topicLower ||
        topicLower === 'general')
  );
  const enabledSymbols = getEnabledSymbols(topicScopedRules);

  const parsedGiven = parseGivenClauses(givenInput, symbolAliases, enabledSymbols);
  const bindings: Record<string, number> = { ...parsedGiven.bindings };

  const normalizedAsked = normalizeSymbolWithAliases(askedInput, symbolAliases);

  // Parse expected answer value if provided
  let expectedValue: number | null = null;
  if (expectedAnswerInput.trim()) {
    const cleanedExp = normalizeSymbolWithAliases(expectedAnswerInput.replace(/%/g, ''), symbolAliases);
    const eqPos = cleanedExp.lastIndexOf('=');
    const expStr = eqPos !== -1 ? cleanedExp.slice(eqPos + 1).trim() : cleanedExp;
    const expAst = parseMathAst(expStr);
    if (expAst && extractVarsFromAst(expAst).length === 0) {
      const ev = evaluateAst(expAst, {}, enabledSymbols);
      if (ev.ok) expectedValue = ev.value;
    }
  }

  const collectedSteps: SolverStepOutput[] = [];
  const allOpsUsed = new Set<string>();

  // First record Step 1: Given bindings
  if (parsedGiven.displayPairs.length > 0) {
    collectedSteps.push({
      stepNo: 1,
      kind: 'given',
      description: `Record Given: ${parsedGiven.displayPairs.join(', ')}`,
      formulaUsed: parsedGiven.displayPairs.join(', '),
      resultText: parsedGiven.displayPairs.join(', '),
      opsUsed: ['='],
    });
  }

  // Handle multi-equation linear systems in Given if equations remain
  if (parsedGiven.equations.length >= 2) {
    const sysRes = trySolve2x2LinearSystem(parsedGiven.equations, bindings, enabledSymbols);
    if (sysRes) {
      for (const [k, v] of Object.entries(sysRes.resolvedVars)) {
        bindings[k] = v;
      }
      sysRes.ops.forEach((op) => allOpsUsed.add(op));
      collectedSteps.push(
        ...sysRes.steps.map((st, idx) => ({ ...st, stepNo: collectedSteps.length + idx + 1 }))
      );
    }
  }

  // Handle single equations in Given where 1 variable is missing vs bindings
  let changedGivenEq = true;
  let guard = 0;
  while (changedGivenEq && guard < 5) {
    changedGivenEq = false;
    guard += 1;
    for (const eq of parsedGiven.equations) {
      const astL = parseMathAst(eq.lhs);
      const astR = parseMathAst(eq.rhs);
      if (!astL || !astR) continue;
      const vars = Array.from(new Set([...extractVarsFromAst(astL), ...extractVarsFromAst(astR)]));
      const missing = vars.filter((v) => !getBindingKey(bindings, v));
      if (missing.length === 1) {
        const solvedEq = solveEquationAstForVar(eq.lhs, eq.rhs, missing[0], bindings, enabledSymbols);
        if (solvedEq?.ok) {
          bindings[missing[0]] = solvedEq.value;
          solvedEq.usedOps.forEach((op) => allOpsUsed.add(op));
          collectedSteps.push({
            stepNo: collectedSteps.length + 1,
            kind: 'substitution',
            description: `Substitute known values into [${eq.raw}] to isolate ${missing[0]}`,
            formulaUsed: `${missing[0]} = ${solvedEq.isolatedExpr}`,
            resultText: `${missing[0]} = ${formatNumClean(solvedEq.value)}`,
            opsUsed: solvedEq.usedOps,
          });
          changedGivenEq = true;
        }
      }
    }
  }

  // Recursive backward subgoal resolver (ignores numeric constants automatically via extractVarsFromAst!)
  const resolvedCache = new Map<string, number>();
  for (const [k, v] of Object.entries(bindings)) {
    resolvedCache.set(k.toLowerCase(), v);
  }

  const resolveVariableGoal = (
    targetVar: string,
    visiting: Set<string>,
    stepTrail: SolverStepOutput[]
  ): { ok: boolean; value: number; modeUsed: SolverRunReport['mode'] } => {
    const keyLower = targetVar.toLowerCase();
    const cached = resolvedCache.get(keyLower);
    if (cached !== undefined) {
      return { ok: true, value: cached, modeUsed: 'direct' };
    }
    if (visiting.has(keyLower)) {
      return { ok: false, value: NaN, modeUsed: 'unsolved' };
    }

    const nextVisiting = new Set(visiting);
    nextVisiting.add(keyLower);

    // 1) Direct Solver's Registry lookup where targetVar is Asked
    const matchingRows = solverEntries.filter((row) =>
      row.askedAliases.some(
        (alias) =>
          normalizeSymbolWithAliases(alias, symbolAliases).toLowerCase() === keyLower ||
          alias.trim().toLowerCase() === keyLower
      )
    );

    const candidateBranches: { row: SolverPathRuleItem; branch: SolverBreakdownBranch; score: number }[] = [];
    for (const row of matchingRows) {
      for (const branch of row.branches) {
        const ast = parseMathAst(normalizeSymbolWithAliases(branch.breakdown, symbolAliases));
        if (!ast) continue;
        // Constants like 100, 2 are ignored automatically by extractVarsFromAst!
        const reqVars = extractVarsFromAst(ast);
        if (reqVars.some((rv) => nextVisiting.has(rv.toLowerCase()))) continue;
        const alreadyKnownCount = reqVars.filter((rv) => resolvedCache.has(rv.toLowerCase())).length;
        const allKnownBonus = alreadyKnownCount === reqVars.length ? 100 : 0;
        // Prioritize branch matching ALL givens, then fewest missing vars
        const score = allKnownBonus + alreadyKnownCount * 10 - reqVars.length;
        candidateBranches.push({ row, branch, score });
      }
    }
    candidateBranches.sort((a, b) => b.score - a.score);

    for (const cand of candidateBranches) {
      const normalizedBreakdown = normalizeSymbolWithAliases(cand.branch.breakdown, symbolAliases);
      const ast = parseMathAst(normalizedBreakdown);
      if (!ast) continue;
      const reqVars = extractVarsFromAst(ast);

      const localSteps: SolverStepOutput[] = [];
      const localVars: Record<string, number> = {};
      let allSubgoalsOk = true;
      let usedSubgoalChain = false;

      for (const rv of reqVars) {
        const rvKnown = resolvedCache.get(rv.toLowerCase());
        if (rvKnown !== undefined) {
          localVars[rv] = rvKnown;
        } else {
          usedSubgoalChain = true;
          const subRes = resolveVariableGoal(rv, nextVisiting, localSteps);
          if (!subRes.ok) {
            allSubgoalsOk = false;
            break;
          }
          localVars[rv] = subRes.value;
        }
      }

      if (!allSubgoalsOk) continue;

      const ev = evaluateAst(ast, localVars, enabledSymbols);
      if (!ev.ok) continue;

      stepTrail.push(...localSteps);
      ev.usedOps.forEach((op) => allOpsUsed.add(op));
      resolvedCache.set(keyLower, ev.value);

      const substitutedPreview = normalizedBreakdown.replace(
        /[A-Za-z_][A-Za-z0-9_]*%?/g,
        (tok) => {
          const hit = getBindingKey(localVars, tok);
          return hit ? formatNumClean(hit.value) : tok;
        }
      );

      stepTrail.push({
        stepNo: 0,
        kind: visiting.size === 0 ? 'target' : 'subgoal',
        formulaUsed: `${targetVar} = ${normalizedBreakdown}`,
        description: `${targetVar} = ${normalizedBreakdown} = ${substitutedPreview}`,
        resultText: `${targetVar} = ${formatNumClean(ev.value)}`,
        opsUsed: ev.usedOps,
      });

      return {
        ok: true,
        value: ev.value,
        modeUsed: usedSubgoalChain ? 'backward-chain' : 'direct',
      };
    }

    // 2) Inverse / Missing-Variable Substitution across ALL Solver's Registry equations!
    //    e.g., SP = CP - L with SP = 30, CP = 40, Asked = L => Substitute 30 = 40 - L => L = 10
    const substitutionCandidates: {
      lhsName: string;
      breakdown: string;
      allVars: string[];
      alreadyKnown: number;
    }[] = [];

    for (const row of solverEntries) {
      const primaryLhs = normalizeSymbolWithAliases(
        row.askedAliases[row.askedAliases.length - 1] || row.askedAliases[0] || '',
        symbolAliases
      );
      if (!primaryLhs || nextVisiting.has(primaryLhs.toLowerCase())) continue;

      for (const branch of row.branches) {
        const normBreakdown = normalizeSymbolWithAliases(branch.breakdown, symbolAliases);
        const astR = parseMathAst(normBreakdown);
        if (!astR) continue;
        const rhsVars = extractVarsFromAst(astR);
        if (!rhsVars.some((rv) => rv.toLowerCase() === keyLower)) continue;

        const allEqVars = [primaryLhs, ...rhsVars];
        const alreadyKnown = allEqVars.filter(
          (v) => v.toLowerCase() !== keyLower && resolvedCache.has(v.toLowerCase())
        ).length;
        substitutionCandidates.push({
          lhsName: primaryLhs,
          breakdown: normBreakdown,
          allVars: allEqVars,
          alreadyKnown,
        });
      }
    }

    substitutionCandidates.sort((a, b) => b.alreadyKnown - a.alreadyKnown);

    for (const sc of substitutionCandidates) {
      const otherVars = Array.from(
        new Set(sc.allVars.filter((v) => v.toLowerCase() !== keyLower))
      );
      if (otherVars.some((ov) => nextVisiting.has(ov.toLowerCase()))) continue;

      const localSteps: SolverStepOutput[] = [];
      const localVars: Record<string, number> = {};
      let allOtherOk = true;
      for (const ov of otherVars) {
        const known = resolvedCache.get(ov.toLowerCase());
        if (known !== undefined) {
          localVars[ov] = known;
        } else {
          const subRes = resolveVariableGoal(ov, nextVisiting, localSteps);
          if (!subRes.ok) {
            allOtherOk = false;
            break;
          }
          localVars[ov] = subRes.value;
        }
      }
      if (!allOtherOk) continue;

      const eqSolved = solveEquationAstForVar(
        sc.lhsName,
        sc.breakdown,
        targetVar,
        localVars,
        enabledSymbols
      );
      if (!eqSolved?.ok) continue;

      stepTrail.push(...localSteps);
      eqSolved.usedOps.forEach((op) => allOpsUsed.add(op));
      resolvedCache.set(keyLower, eqSolved.value);

      const substitutedEq = `${sc.lhsName} = ${sc.breakdown}`.replace(
        /[A-Za-z_][A-Za-z0-9_]*%?/g,
        (tok) => {
          const hit = getBindingKey(localVars, tok);
          return hit ? formatNumClean(hit.value) : tok;
        }
      );

      stepTrail.push({
        stepNo: 0,
        kind: 'substitution',
        formulaUsed: `${sc.lhsName} = ${sc.breakdown}  =>  ${targetVar} = ${eqSolved.isolatedExpr}`,
        description: `Substitute into [${sc.lhsName} = ${sc.breakdown}]: ${substitutedEq}  =>  ${targetVar} = ${eqSolved.isolatedExpr}`,
        resultText: `${targetVar} = ${formatNumClean(eqSolved.value)}`,
        opsUsed: eqSolved.usedOps,
      });

      return { ok: true, value: eqSolved.value, modeUsed: 'substitution' };
    }

    return { ok: false, value: NaN, modeUsed: 'unsolved' };
  };

  // Evaluate direct multi-var expression in Asked (e.g. `x + y` or `P / CP * 100`) OR variable target
  const askedAst = parseMathAst(normalizedAsked);
  if (askedAst && askedAst.type !== 'var') {
    const reqVars = extractVarsFromAst(askedAst);
    const exprTrail: SolverStepOutput[] = [];
    const localVars: Record<string, number> = {};
    let ok = true;
    for (const rv of reqVars) {
      const r = resolveVariableGoal(rv, new Set(), exprTrail);
      if (!r.ok) {
        ok = false;
        break;
      }
      localVars[rv] = r.value;
    }
    if (ok) {
      const ev = evaluateAst(askedAst, localVars, enabledSymbols);
      if (ev.ok) {
        ev.usedOps.forEach((op) => allOpsUsed.add(op));
        const finalSteps: SolverStepOutput[] = [
          ...collectedSteps,
          ...exprTrail,
          {
            stepNo: 0,
            kind: 'target' as const,
            formulaUsed: normalizedAsked,
            description: `Evaluate ${normalizedAsked}`,
            resultText: `${normalizedAsked} = ${formatNumClean(ev.value)}`,
            opsUsed: ev.usedOps,
          },
        ].map((st, idx) => ({ ...st, stepNo: idx + 1 }));

        const matchesExpected =
          expectedValue !== null ? Math.abs(ev.value - expectedValue) < 1e-6 : null;

        return {
          solved: true,
          mode: parsedGiven.equations.length >= 2 ? 'linear-system' : 'backward-chain',
          normalizedAsked,
          derivedValue: ev.value,
          derivedText: formatNumClean(ev.value),
          matchesExpected,
          expectedValue,
          steps: finalSteps,
          opsUsed: Array.from(allOpsUsed),
          discoveryCandidates: [],
          statusMessage: `Solved ${normalizedAsked} = ${formatNumClean(ev.value)}.`,
        };
      }
    }
  }

  // Variable goal lookup (backward chaining + missing-variable substitution)
  const varTrail: SolverStepOutput[] = [];
  const goalRes = resolveVariableGoal(normalizedAsked, new Set(), varTrail);
  if (goalRes.ok) {
    const finalSteps: SolverStepOutput[] = [...collectedSteps, ...varTrail].map((st, idx) => ({
      ...st,
      stepNo: idx + 1,
    }));
    const matchesExpected =
      expectedValue !== null ? Math.abs(goalRes.value - expectedValue) < 1e-6 : null;

    return {
      solved: true,
      mode: goalRes.modeUsed,
      normalizedAsked,
      derivedValue: goalRes.value,
      derivedText: formatNumClean(goalRes.value),
      matchesExpected,
      expectedValue,
      steps: finalSteps,
      opsUsed: Array.from(allOpsUsed),
      discoveryCandidates: [],
      statusMessage: `Solved ${normalizedAsked} = ${formatNumClean(goalRes.value)} via ${
        goalRes.modeUsed === 'substitution'
          ? 'equation substitution'
          : goalRes.modeUsed === 'backward-chain'
            ? 'backward subgoal chaining'
            : 'registry formula'
      }.`,
    };
  }

  // 3) No existing formula resolved Asked — run Bounded Brute-Force Discovery if Expected Answer is given!
  if (expectedValue !== null && Object.keys(bindings).length > 0) {
    const candidates = discoverFormulaCandidates({
      askedLabel: normalizedAsked,
      bindings,
      expectedValue,
      enabledSymbols,
      solverEntries,
      symbolAliases,
    });

    if (candidates.length > 0) {
      return {
        solved: false,
        mode: 'discovery-needed',
        normalizedAsked,
        derivedValue: candidates[0].derivedValue,
        derivedText: formatNumClean(candidates[0].derivedValue),
        matchesExpected: true,
        expectedValue,
        steps: collectedSteps,
        opsUsed: Array.from(allOpsUsed),
        discoveryCandidates: candidates,
        statusMessage: `Found ${candidates.length} candidate formula(s) matching ${formatNumClean(expectedValue)}. Confirm before saving to Solver's Registry.`,
      };
    }
  }

  return {
    solved: false,
    mode: 'unsolved',
    normalizedAsked,
    derivedValue: null,
    derivedText: '—',
    matchesExpected: null,
    expectedValue,
    steps: collectedSteps,
    opsUsed: Array.from(allOpsUsed),
    discoveryCandidates: [],
    statusMessage:
      expectedValue === null
        ? `No formula found for "${normalizedAsked}" in Solver's Registry. Supply Expected Answer to run autonomous operator discovery.`
        : `No operator combination within depth cap matched Expected Answer ${formatNumClean(expectedValue)}. Check active Operator Registry symbols or add a subgoal formula.`,
  };
}

// ============================================================================
// 5. BOUNDED BRUTE-FORCE DISCOVERY (WITH COMBINATORIAL EXPLOSION GUARDS)
// ============================================================================

interface SearchNode {
  expr: string;
  value: number;
  usedVarsMask: number;
  depth: number;
  constantCount: number;
}

function discoverFormulaCandidates(params: {
  askedLabel: string;
  bindings: Record<string, number>;
  expectedValue: number;
  enabledSymbols: Set<string>;
  solverEntries: SolverPathRuleItem[];
  symbolAliases: SymbolAliasItem[];
}): DiscoveryCandidate[] {
  const { askedLabel, bindings, expectedValue, enabledSymbols, solverEntries, symbolAliases } = params;
  const varEntries = Object.entries(bindings);
  if (varEntries.length === 0) return [];

  const allVarsMask = (1 << varEntries.length) - 1;
  const wantsPercent = /%|percent/i.test(askedLabel);

  const initialNodes: SearchNode[] = varEntries.map(([name, value], idx) => ({
    expr: name,
    value,
    usedVarsMask: 1 << idx,
    depth: 0,
    constantCount: 0,
  }));

  // Guard 1: Scoped constant injection only when meaningful (e.g. `100` for `%`)
  if (wantsPercent) {
    initialNodes.push({
      expr: '100',
      value: 100,
      usedVarsMask: 0,
      depth: 0,
      constantCount: 1,
    });
  }

  const MAX_DEPTH = 3;
  const MAX_STATES = 2500;
  const allLayers: SearchNode[] = [...initialNodes];
  const visitedKey = new Set<string>();
  for (const n of initialNodes) {
    visitedKey.add(`${n.usedVarsMask}:${n.value.toFixed(6)}`);
  }

  const binaryOps = (['+', '-', '*', '/'] as const).filter((op) => enabledSymbols.has(op));
  const rawMatches: SearchNode[] = [];

  for (const n of initialNodes) {
    if (n.usedVarsMask > 0 && Math.abs(n.value - expectedValue) < 1e-6) {
      rawMatches.push(n);
    }
  }

  // Iterative Deepening BFS (Depth 1 -> 2 -> 3) with Value+VarMask deduplication
  let prevLayerStart = 0;
  for (let depth = 1; depth <= MAX_DEPTH && allLayers.length < MAX_STATES; depth += 1) {
    const currentEnd = allLayers.length;
    for (let i = 0; i < currentEnd && allLayers.length < MAX_STATES; i += 1) {
      for (let j = prevLayerStart; j < currentEnd && allLayers.length < MAX_STATES; j += 1) {
        if (i === j) continue;
        const a = allLayers[i];
        const b = allLayers[j];
        const combinedMask = a.usedVarsMask | b.usedVarsMask;
        // Skip combining two pure constants or zero-mask pairs
        if (combinedMask === 0) continue;

        for (const op of binaryOps) {
          const pairs: [SearchNode, SearchNode][] =
            op === '+' || op === '*' ? [[a, b]] : [[a, b], [b, a]];

          for (const [left, right] of pairs) {
            // Skip self-canceling forms like X - X or X / X when same variable expr
            if ((op === '-' || op === '/') && left.expr === right.expr) continue;

            let val = NaN;
            if (op === '+') val = left.value + right.value;
            else if (op === '-') val = left.value - right.value;
            else if (op === '*') val = left.value * right.value;
            else if (op === '/') {
              if (Math.abs(right.value) < 1e-10) continue;
              val = left.value / right.value;
            }
            if (!Number.isFinite(val) || Math.abs(val) > 1e9) continue;

            const memoKey = `${combinedMask}:${val.toFixed(6)}`;
            if (visitedKey.has(memoKey)) continue;
            visitedKey.add(memoKey);

            const leftStr = left.depth > 0 ? `(${left.expr})` : left.expr;
            const rightStr = right.depth > 0 ? `(${right.expr})` : right.expr;
            const expr = `${leftStr} ${op} ${rightStr}`;
            const node: SearchNode = {
              expr,
              value: val,
              usedVarsMask: combinedMask,
              depth,
              constantCount: left.constantCount + right.constantCount,
            };
            allLayers.push(node);

            if (Math.abs(val - expectedValue) < 1e-6 && combinedMask > 0) {
              rawMatches.push(node);
            }
          }
        }
      }
    }
    prevLayerStart = currentEnd;
  }

  // Meet-in-the-middle check when % target: multiply candidate `(expr) * 100`
  if (wantsPercent && enabledSymbols.has('*')) {
    for (const n of allLayers) {
      if (n.usedVarsMask > 0 && n.constantCount === 0 && Math.abs(n.value * 100 - expectedValue) < 1e-6) {
        rawMatches.push({
          expr: `${n.depth > 0 ? `(${n.expr})` : n.expr} * 100`,
          value: n.value * 100,
          usedVarsMask: n.usedVarsMask,
          depth: n.depth + 1,
          constantCount: 1,
        });
      }
    }
  }

  // Deduplicate formatted expressions & rank multi-var / percent-consistent formulas higher
  // than single-operation coincidences (like SP + CP = 50 on Profit% with 30 & 20)
  const seenExpr = new Set<string>();
  const uniqueRanked = rawMatches
    .filter((m) => {
      const clean = m.expr.replace(/\s+/g, ' ');
      if (seenExpr.has(clean)) return false;
      seenExpr.add(clean);
      return true;
    })
    .sort((a, b) => {
      // If Asked wants %, rank expressions using `* 100` above raw accidental sums
      if (wantsPercent) {
        const aPct = a.expr.includes('100') ? 1 : 0;
        const bPct = b.expr.includes('100') ? 1 : 0;
        if (bPct !== aPct) return bPct - aPct;
      }
      // Prefer consuming ALL given variables
      const aAll = a.usedVarsMask === allVarsMask ? 1 : 0;
      const bAll = b.usedVarsMask === allVarsMask ? 1 : 0;
      if (bAll !== aAll) return bAll - aAll;
      // Otherwise shortest depth & fewest constants
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.constantCount - b.constantCount;
    })
    .slice(0, 6);

  return uniqueRanked.map((m, idx) => {
    const usedVars = varEntries
      .filter((_, vIdx) => (m.usedVarsMask & (1 << vIdx)) !== 0)
      .map(([name]) => name);

    // Check if discovered Breakdown matches an existing formula in Solver's Registry (for Alias Merging!)
    const astCand = parseMathAst(m.expr);
    let matchingExistingRowId: string | undefined;
    let matchingExistingAsked: string | undefined;
    if (astCand) {
      const probeEnv: Record<string, number> = {};
      varEntries.forEach(([vName], vIdx) => {
        probeEnv[vName] = 7.3 + vIdx * 3.7;
      });
      const candProbe = evaluateAst(astCand, probeEnv, enabledSymbols);
      if (candProbe.ok) {
        for (const row of solverEntries) {
          for (const br of row.branches) {
            const normBr = normalizeSymbolWithAliases(br.breakdown, symbolAliases);
            const brAst = parseMathAst(normBr);
            if (!brAst) continue;
            const brProbe = evaluateAst(brAst, probeEnv, enabledSymbols);
            if (brProbe.ok && Math.abs(brProbe.value - candProbe.value) < 1e-6) {
              matchingExistingRowId = row.id;
              matchingExistingAsked = row.askedAliases[0];
              break;
            }
          }
          if (matchingExistingRowId) break;
        }
      }
    }

    return {
      id: `cand-${Date.now()}-${idx}`,
      askedLabel,
      givenVars: usedVars,
      breakdown: m.expr,
      derivedValue: m.value,
      depth: m.depth,
      usesAllGivens: m.usedVarsMask === allVarsMask,
      matchingExistingRowId,
      matchingExistingAsked,
    };
  });
}
