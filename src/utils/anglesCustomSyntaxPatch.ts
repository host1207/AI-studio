/**
 * Angles Custom Syntax Compiler Patch:
 * 1) <box w points = (x1,y1),(x2,y2),(x3,y3),(x4,y4) [bg-color = #hex] [text-color = #hex]>text here</box w>
 *    - Invisible background (transparent) & invisible border (transparent) by default
 *    - Black text (#000000) by default
 *    - Internal baseline line running parallel to the bottom edge ((x4,y4) -> (x3,y3)) at 25% height from the bottom
 *    - Text sits centered at the middle of that baseline line, resting directly on top of the line
 *    - Optional dev overrides: bg-color = #hex, text-color = #hex
 *
 * 2) <line d [line-color = #hex] [text-color = #hex]>(x1,y1),(x2,y2) text here</line d>
 *    - Sits ON TOP OF <box> elements (highest z-index layer: z-index 40)
 *    - Text written inside sits directly on top of the line, ~4 mm (15.12 CSS px at 96 DPI) above the midpoint
 *    - Optional dev overrides: line-color = #hex (or color = #hex), text-color = #hex
 *
 * 3) Enhanced <math == expression> compiler
 *    - Supports fractions, roots (sqrt, cbrt), powers (^), subscripts (_), Greek names,
 *      trig ratios (sin, cos, tan, cosec, sec, cot), geometry operators (deg, ang, tri, perp, par, =>, ->)
 */

export interface GridPoint {
  col: number;
  row: number;
}

export interface ParsedBoxWItem {
  id: string;
  points: [GridPoint, GridPoint, GridPoint, GridPoint];
  bgColor: string; // 'transparent' by default unless bg-color = #hex is specified
  borderColor: string; // 'transparent' by default unless bg-color = #hex is specified
  textColor: string; // '#000000' by default unless text-color = #hex is specified
  rawText: string;
  baselineStart: { x: number; y: number };
  baselineEnd: { x: number; y: number };
  baselineMidpoint: { x: number; y: number };
  angleDeg: number;
}

export interface ParsedLineDItem {
  id: string;
  points: GridPoint[];
  lineColor: string; // '#000000' by default unless line-color = #hex is specified
  textColor: string; // '#000000' by default unless text-color = #hex is specified
  labelText: string;
  midpoint: { x: number; y: number };
  angleDeg: number;
  offsetPx: number; // 4mm = 15.12px at 96 DPI
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function normalizeHex(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : fallback;
}

export function parseCoordinatePairs(raw: string): GridPoint[] {
  const pts: GridPoint[] = [];
  const pairRegex = /\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = pairRegex.exec(raw)) !== null) {
    const col = parseFloat(m[1]);
    const row = parseFloat(m[2]);
    if (col >= 1 && row >= 1) {
      pts.push({ col, row });
    }
  }
  return pts;
}

export function extractBoxWElements(
  rawMkml: string,
  cellWidthPx = 28,
  rowHeightPx = 32,
  topOriginPx = 47
): {
  items: ParsedBoxWItem[];
  cleanedMkml: string;
} {
  const items: ParsedBoxWItem[] = [];
  const boxWRegex = /<box\s+w\s+([^>]+)>([\s\S]*?)<\/box\s+w>/gi;
  let idx = 0;

  const cleanedMkml = rawMkml.replace(boxWRegex, (_full, attrStr: string, innerText: string) => {
    idx++;
    const ptsMatch = attrStr.match(/points\s*=\s*([^\s>]+(?:\s*,\s*\(\s*\d+\s*,\s*\d+\s*\))*)/i);
    const pts = parseCoordinatePairs(ptsMatch ? ptsMatch[1] : attrStr);
    if (pts.length !== 4) {
      return '';
    }

    const bgMatch = attrStr.match(/bg-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);
    const textMatch = attrStr.match(/text-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);

    const bgColor = bgMatch ? normalizeHex(bgMatch[1], 'transparent') : 'transparent';
    const borderColor = bgMatch ? normalizeHex(bgMatch[1], 'transparent') : 'transparent';
    const textColor = textMatch ? normalizeHex(textMatch[1], '#000000') : '#000000';

    const toPx = (p: GridPoint) => ({
      x: (p.col - 1) * cellWidthPx,
      y: topOriginPx + (p.row - 1) * rowHeightPx,
    });

    const p1 = toPx(pts[0]);
    const p2 = toPx(pts[1]);
    const p3 = toPx(pts[2]);
    const p4 = toPx(pts[3]);

    // 25% height from bottom = 75% interpolation from top edge (P1..P2) to bottom edge (P4..P3)
    const t = 0.75;
    const baselineStart = {
      x: p1.x + (p4.x - p1.x) * t,
      y: p1.y + (p4.y - p1.y) * t,
    };
    const baselineEnd = {
      x: p2.x + (p3.x - p2.x) * t,
      y: p2.y + (p3.y - p2.y) * t,
    };
    const baselineMidpoint = {
      x: (baselineStart.x + baselineEnd.x) / 2,
      y: (baselineStart.y + baselineEnd.y) / 2,
    };

    let angleDeg =
      (Math.atan2(baselineEnd.y - baselineStart.y, baselineEnd.x - baselineStart.x) * 180) /
      Math.PI;
    if (angleDeg > 90) angleDeg -= 180;
    if (angleDeg < -90) angleDeg += 180;

    items.push({
      id: `box-w-${idx}`,
      points: [pts[0], pts[1], pts[2], pts[3]],
      bgColor,
      borderColor,
      textColor,
      rawText: innerText.trim(),
      baselineStart,
      baselineEnd,
      baselineMidpoint,
      angleDeg,
    });

    return '';
  });

  return { items, cleanedMkml };
}

export function extractLineDElements(
  rawMkml: string,
  cellWidthPx = 28,
  rowHeightPx = 32,
  topOriginPx = 47
): {
  items: ParsedLineDItem[];
  cleanedMkml: string;
} {
  const items: ParsedLineDItem[] = [];
  const lineDRegex = /<line\s+d([^>]*)>([\s\S]*?)(?:<\/line\s+d>|<line\s+d>)/gi;
  let idx = 0;

  const cleanedMkml = rawMkml.replace(lineDRegex, (_full, attrStr: string, bodyStr: string) => {
    idx++;
    const lineColorMatch =
      attrStr.match(/line-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i) ||
      attrStr.match(/color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);
    const textColorMatch = attrStr.match(/text-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);

    const lineColor = lineColorMatch ? normalizeHex(lineColorMatch[1], '#000000') : '#000000';
    const textColor = textColorMatch ? normalizeHex(textColorMatch[1], '#000000') : '#000000';

    const pts = parseCoordinatePairs(bodyStr);
    if (pts.length < 2) {
      return '';
    }

    const labelText = bodyStr
      .replace(/\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*\)/g, '')
      .replace(/^[\s,|:-]+/, '')
      .trim();

    const toPx = (p: GridPoint) => ({
      x: (p.col - 1) * cellWidthPx,
      y: topOriginPx + (p.row - 1) * rowHeightPx,
    });

    const segIdx = Math.floor((pts.length - 1) / 2);
    const pA = toPx(pts[segIdx]);
    const pB = toPx(pts[segIdx + 1]);

    const midpoint = {
      x: (pA.x + pB.x) / 2,
      y: (pA.y + pB.y) / 2,
    };

    let angleDeg = (Math.atan2(pB.y - pA.y, pB.x - pA.x) * 180) / Math.PI;
    if (angleDeg > 90) angleDeg -= 180;
    if (angleDeg < -90) angleDeg += 180;

    items.push({
      id: `line-d-${idx}`,
      points: pts,
      lineColor,
      textColor,
      labelText,
      midpoint,
      angleDeg,
      offsetPx: 15.12, // 4 mm above the line
    });

    return '';
  });

  return { items, cleanedMkml };
}

export function compileAnglesMathExpression(expr: string): string {
  let out = expr.trim();

  out = out.replace(/cbrt\(([^()]+)\)/gi, '∛($1)');
  out = out.replace(/sqrt\(([^()]*\([^()]*\)[^()]*)\)/gi, '√($1)');
  out = out.replace(/sqrt\(([^()]+)\)/gi, '√($1)');

  const symbols: Record<string, string> = {
    theta: 'θ',
    alpha: 'α',
    beta: 'β',
    gamma: 'γ',
    delta: 'δ',
    phi: 'φ',
    omega: 'ω',
    pi: 'π',
    inf: '∞',
    infinity: '∞',
    tri: 'Δ',
    ang: '∠',
    deg: '°',
    perp: '⊥',
    par: '∥',
    div: '÷',
  };

  Object.entries(symbols).forEach(([word, sym]) => {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    out = out.replace(re, sym);
  });

  out = out
    .replace(/<=>/g, '⇔')
    .replace(/=>/g, '⇒')
    .replace(/->/g, '→')
    .replace(/~=/g, '≅')
    .replace(/!=/g, '≠')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/\+-/g, '±')
    .replace(/\/\//g, '÷')
    .replace(/\*/g, '×');

  out = out.replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');
  out = out.replace(/\^([0-9a-zA-Z+-]+)/g, '<sup>$1</sup>');

  out = out.replace(/_\(([^)]+)\)/g, '<sub>$1</sub>');
  out = out.replace(/_([0-9a-zA-Z+-]+)/g, '<sub>$1</sub>');

  return out;
}

export function compileAnglesMathTags(rawText: string): string {
  return rawText.replace(/<math\s*==\s*([^>]+)>/gi, (_m, expr: string) => {
    return compileAnglesMathExpression(expr);
  });
}
