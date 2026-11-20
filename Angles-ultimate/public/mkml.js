/* Angles MKML compiler. Canonical syntax is documented in MKML-SYNTAX.md. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MKML = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function toTex(expression) {
    const rawExpr = String(expression || '');
    const tokens = rawExpr.match(/<=>|=>|->|\+-|-\+|\/\/|~=|<=|>=|!=|[A-Za-z][A-Za-z0-9]*(?:_(?:\{[^}]*\}|[A-Za-z0-9]+))?(?:\^(?:\{[^}]*\}|\([^()]*\)|[A-Za-z0-9+-]+))?|\d+(?:\.\d+)?(?:\^(?:\{[^}]*\}|\([^()]*\)|[A-Za-z0-9+-]+))?|[+\-*/=()[\]{}_,°]|[^\s]/g) || [];
    let cursor = 0;
    const precedence = {
      '<=>': 0, '=>': 0, '->': 0, '~=': 0, '=': 0, '!=': 0, '<=': 0, '>=': 0, 'approx': 0,
      '+': 1, '-': 1, '+-': 1, '-+': 1, 'perp': 1, 'par': 1,
      '/': 2, '//': 2, '*': 2, div: 2
    };
    const greek = {
      alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma', delta: '\\delta',
      epsilon: '\\epsilon', zeta: '\\zeta', eta: '\\eta', theta: '\\theta',
      iota: '\\iota', kappa: '\\kappa', lambda: '\\lambda', mu: '\\mu',
      nu: '\\nu', xi: '\\xi', pi: '\\pi', rho: '\\rho', sigma: '\\sigma',
      tau: '\\tau', upsilon: '\\upsilon', phi: '\\phi', chi: '\\chi',
      psi: '\\psi', omega: '\\omega',
      Gamma: '\\Gamma', Delta: '\\Delta', Theta: '\\Theta', Lambda: '\\Lambda',
      Xi: '\\Xi', Pi: '\\Pi', Sigma: '\\Sigma', Phi: '\\Phi', Psi: '\\Psi', Omega: '\\Omega',
      inf: '\\infty', infinity: '\\infty'
    };
    const trigFuncs = {
      sin: '\\sin', cos: '\\cos', tan: '\\tan',
      sec: '\\sec', cot: '\\cot', csc: '\\csc',
      cosec: '\\operatorname{cosec}',
      arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan',
      sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh',
      log: '\\log', ln: '\\ln'
    };

    function formatIdentifierToken(token) {
      const match = /^([A-Za-z][A-Za-z0-9]*)(_(?:\{[^}]*\}|[A-Za-z0-9]+))?(\^(?:\{[^}]*\}|\([^()]*\)|[A-Za-z0-9+-]+))?$/.exec(token);
      if (!match) return { tex: token, isPrefixSymbol: false };
      const base = match[1];
      const lower = base.toLowerCase();
      const sub = match[2] || '';
      let sup = match[3] || '';
      if (sup.startsWith('^(') && sup.endsWith(')')) {
        sup = `^{${sup.slice(2, -1)}}`;
      }
      if (lower === 'tri') return { tex: `\\triangle${sub}${sup}`, isPrefixSymbol: true };
      if (lower === 'ang' || lower === 'angle') return { tex: `\\angle${sub}${sup}`, isPrefixSymbol: true };
      if (lower === 'deg') return { tex: '^\\circ', isPostfixDeg: true };
      if (lower === 'perp') return { tex: '\\perp', isPrefixSymbol: true };
      if (lower === 'par') return { tex: '\\parallel', isPrefixSymbol: true };
      if (trigFuncs[lower]) {
        return { tex: `${trigFuncs[lower]}${sub}${sup}`, isPrefixSymbol: true };
      }
      const baseTex = greek[base] || greek[lower] || base;
      const needsSpace = baseTex.startsWith('\\');
      return { tex: `${baseTex}${sub}${sup}`, isPrefixSymbol: needsSpace };
    }

    function parsePrimary() {
      const token = tokens[cursor++];
      if (token === undefined) return '';
      const lower = token.toLowerCase();
      if ((lower === 'sqrt' || lower === 'cbrt') && tokens[cursor] === '(') {
        cursor++;
        const inner = parseExpression(0);
        if (tokens[cursor] === ')') cursor++;
        return lower === 'cbrt' ? `\\sqrt[3]{${inner}}` : `\\sqrt{${inner}}`;
      }
      const groups = { '(': [')', '\\left(', '\\right)'], '[': [']', '\\left[', '\\right]'], '{': ['}', '\\left\\{', '\\right\\}'] };
      if (groups[token]) {
        const [closing, left, right] = groups[token];
        const inner = parseExpression(0);
        if (tokens[cursor] === closing) cursor++;
        return `${left}${inner}${right}`;
      }
      if (token === '≅') return '\\cong';
      if (token === '°') return '^\\circ';
      const formatted = formatIdentifierToken(token);
      return formatted.tex;
    }

    function startsPrimary(token) {
      if (token === undefined) return false;
      const lower = token.toLowerCase();
      return ![')', ']', '}', '+', '-', '+-', '-+', '*', '/', '//', 'div', '~=', '=', '!=', '<=', '>=', '<=>', '=>', '->', 'approx', 'perp', 'par', ','].includes(lower);
    }

    function parseExpression(minPrecedence = 0) {
      let left = parsePrimary();
      while (cursor < tokens.length) {
        const op = tokens[cursor];
        if ([')', ']', '}'].includes(op)) break;
        if (op === ',') { cursor++; left += ', '; continue; }
        if (op.toLowerCase() === 'deg' || op === '°') {
          cursor++;
          left = `${left}^\\circ`;
          continue;
        }
        const opLower = op.toLowerCase();
        const opPrecedence = Object.prototype.hasOwnProperty.call(precedence, opLower) ? precedence[opLower] : null;
        if (opPrecedence === null) {
          if (!startsPrimary(op)) break;
          const right = parsePrimary();
          const needsSpace = /\\[A-Za-z]+(?:\^[A-Za-z0-9{}]+)?$/.test(left) || left === '\\triangle' || left === '\\angle';
          left += (needsSpace ? ' ' : '') + right;
          continue;
        }
        if (opPrecedence < minPrecedence) break;
        cursor++;
        const right = parseExpression(opPrecedence + 1);
        if (op === '/') left = `\\dfrac{${left}}{${right}}`;
        else if (op === '*') left = `${left} \\times ${right}`;
        else if (op === '//' || opLower === 'div') left = `${left} \\div ${right}`;
        else if (op === '~=' || op === '≅') left = `${left} \\cong ${right}`;
        else if (op === '!=') left = `${left} \\ne ${right}`;
        else if (op === '<=') left = `${left} \\le ${right}`;
        else if (op === '>=') left = `${left} \\ge ${right}`;
        else if (op === '<=>') left = `${left} \\Leftrightarrow ${right}`;
        else if (op === '=>') left = `${left} \\Rightarrow ${right}`;
        else if (op === '->') left = `${left} \\rightarrow ${right}`;
        else if (op === '+-') left = `${left} \\pm ${right}`;
        else if (op === '-+') left = `${left} \\mp ${right}`;
        else if (opLower === 'approx') left = `${left} \\approx ${right}`;
        else if (opLower === 'perp') left = `${left} \\perp ${right}`;
        else if (opLower === 'par') left = `${left} \\parallel ${right}`;
        else left = `${left} ${op} ${right}`;
      }
      return left;
    }

    return parseExpression().trim();
  }

  function findMathClose(source, from) {
    for (let i = from; i < source.length; i++) {
      if (source[i] === '>') {
        if (source[i - 1] === '-' || source[i - 1] === '=') continue;
        if (source[i + 1] === '=') continue;
        return i;
      }
    }
    return -1;
  }

  function compileMathInline(source) {
    const input = String(source);
    const opener = /<math\s*==\s*/gi;
    let out = '';
    let cursor = 0;
    let match;
    while ((match = opener.exec(input)) !== null) {
      const bodyStart = match.index + match[0].length;
      const closeIndex = findMathClose(input, bodyStart);
      if (closeIndex < 0) break;
      const expr = input.slice(bodyStart, closeIndex).trim();
      out += input.slice(cursor, match.index);
      out += `<span class="mkml-math" data-tex="${escapeHtml(toTex(expr))}">${escapeHtml(expr)}</span>`;
      cursor = closeIndex + 1;
      opener.lastIndex = cursor;
    }
    return out + input.slice(cursor);
  }

  function compileInline(source) {
    const withMath = compileMathInline(source);
    const token = /<(ok|x)\s*=\s*([\s\S]*?)>|<hide\s*==\s*([\s\S]*?)>|<b>([\s\S]*?)<\/b>/gi;
    return withMath.replace(token, (_whole, correction, correctedText, hidden, bold) => {
      if (correction) return `<span class="mkml-${correction.toLowerCase()}">${escapeHtml(correctedText)}</span>`;
      if (hidden !== undefined) return `<span class="mkml-spoiler" role="button" tabindex="0" aria-label="Reveal hidden text">${escapeHtml(hidden)}</span>`;
      return `<b>${bold}</b>`;
    });
  }

  function readAttribute(attributes, name) {
    const match = String(attributes).match(new RegExp(`(?:^|\\s)${name}\\s*[:=]\\s*["']?([^"'>]+?)["']?(?=\\s+[\\w-]+\\s*[:=]|$)`, 'i'));
    return match ? match[1].trim() : '';
  }

  function readAnyAttribute(attributes, names) {
    for (const name of names) {
      const val = readAttribute(attributes, name);
      if (val) return val;
    }
    return '';
  }

  function gridMarkup(attributes, content) {
    const pair = (name, defaults) => {
      const values = readAttribute(attributes, name).split(',').map(value => Number.parseInt(value.trim(), 10));
      return [Number.isSafeInteger(values[0]) && values[0] > 0 ? values[0] : defaults[0], Number.isSafeInteger(values[1]) && values[1] > 0 ? values[1] : defaults[1]];
    };
    const pos = pair('pos', [1, 1]);
    const span = pair('span', [12, 5]);
    const col = pos[0];
    const row = pos[1];
    const colSpan = Math.max(1, span[0]);
    const rowSpan = Math.max(1, span[1]);
    const hasPos = /(?:^|\s)pos\s*=/i.test(attributes);
    const hasSpan = /(?:^|\s)span\s*=/i.test(attributes);
    const placement = hasPos || hasSpan ? ` style="--grid-col:${col};--grid-row:${row};--grid-col-span:${colSpan};--grid-row-span:${rowSpan}"` : '';
    const id = readAttribute(attributes, 'id');
    const customClass = readAttribute(attributes, 'class').split(/\s+/).filter(Boolean).map(escapeHtml).join(' ');
    return `<div${id ? ` id="${escapeHtml(id)}"` : ''} class="grid-box${customClass ? ` ${customClass}` : ''}"${placement}>${content}</div>`;
  }

  function compileCss(source) {
    const css = String(source == null ? '' : source);
    let output = '';
    let index = 0;
    let depth = 0;
    while (index < css.length) {
      if (css.startsWith('/*', index)) {
        const end = css.indexOf('*/', index + 2);
        const stop = end < 0 ? css.length : end + 2;
        output += css.slice(index, stop);
        index = stop;
        continue;
      }
      if (css[index] === '"' || css[index] === "'") {
        const quote = css[index];
        let stop = index + 1;
        while (stop < css.length) {
          if (css[stop] === '\\') { stop += 2; continue; }
          if (css[stop++] === quote) break;
        }
        output += css.slice(index, stop);
        index = stop;
        continue;
      }
      if (css[index] === '{') { depth++; output += css[index++]; continue; }
      if (css[index] === '}') { depth = Math.max(0, depth - 1); output += css[index++]; continue; }

      const declaration = depth > 0 ? css.slice(index).match(/^grid-text-align\s*:\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)(\s*!important)?\s*;?/i) : null;
      let previous = index - 1;
      while (previous >= 0) {
        if (/\s/.test(css[previous])) { previous--; continue; }
        if (previous > 0 && css.slice(previous - 1, previous + 1) === '*/') {
          const commentStart = css.lastIndexOf('/*', previous - 1);
          if (commentStart >= 0) { previous = commentStart - 1; continue; }
        }
        break;
      }
      if (declaration && (previous < 0 || css[previous] === '{' || css[previous] === ';')) {
        const parsedColumn = Number(declaration[1]);
        const parsedRow = Number(declaration[2]);
        if (!Number.isSafeInteger(parsedColumn) || !Number.isSafeInteger(parsedRow)) {
          output += declaration[0];
          index += declaration[0].length;
          continue;
        }
        const column = Math.max(1, parsedColumn);
        const row = Math.max(1, parsedRow);
        const important = declaration[3] ? ' !important' : '';
        const top = 47 + (row - 1) * 32;
        output += `position: absolute${important}; margin: 0 !important; left: calc((${column} - 1) * var(--grid-cell-width))${important}; top: ${top}px${important}; translate: 0 -100% !important; --grid-required-col:${column}; --grid-required-row:${row};`;
        index += declaration[0].length;
        continue;
      }
      output += css[index++];
    }
    return output;
  }

  function linkedCss(cssSources, htmlSource) {
    const linked = new Set([...String(htmlSource == null ? '' : htmlSource).matchAll(/<link-css-id\s*:\s*([\w.-]+)\s*>|<link\s*=\s*([\w.-]+)\s*>/gi)].map(match => match[1] || match[2]));
    const output = [];
    for (const source of Array.isArray(cssSources) ? cssSources : []) {
      const css = String(source || '');
      const marker = /<css-id\s*:\s*([\w.-]+)\s*>/gi;
      let markers = [];
      try { markers = [...css.matchAll(marker)]; } catch { continue; }
      if (!markers.length) { output.push(css); continue; }
      if (css.slice(0, markers[0].index).trim()) output.push(css.slice(0, markers[0].index));
      markers.forEach((entry, index) => {
        if (!linked.has(entry[1])) return;
        const start = entry.index + entry[0].length;
        const end = index + 1 < markers.length ? markers[index + 1].index : css.length;
        output.push(css.slice(start, end));
      });
    }
    return output.join('\n');
  }

  function stripCssLinks(html) {
    return String(html == null ? '' : html).replace(/<link-css-id\s*:\s*[\w.-]+\s*>|<link\s*=\s*[\w.-]+\s*>/gi, '');
  }

  function cleanCss(source) {
    return String(source == null ? '' : source).replace(/<qn\s+all\b[\s\S]*?<\/qn\s+all\s*>/gi, '');
  }

  function compileSemanticBlocks(source) {
    const input = String(source);
    const openerAt = (from) => {
      const matcher = /<(rule|trap|chain)\s*==/ig;
      matcher.lastIndex = from;
      return matcher.exec(input);
    };
    function closeAt(from) {
      let tagDepth = 0;
      for (let index = from; index < input.length; index++) {
        const ch = input[index];
        if (ch === '<' && /[A-Za-z/]/.test(input[index + 1] || '')) {
          tagDepth++;
          continue;
        }
        if (ch === '>') {
          if (input[index - 1] === '-' || input[index - 1] === '=') continue;
          if (input[index + 1] === '=') continue;
          if (tagDepth > 0) {
            tagDepth--;
            continue;
          }
          return index;
        }
      }
      return -1;
    }
    function parseAt(start, depth = 0) {
      if (depth > 64) return null;
      const match = openerAt(start);
      if (!match || match.index !== start) return null;
      const tag = match[1].toLowerCase();
      const bodyStart = match.index + match[0].length;
      let cursor = bodyStart;
      let body = '';
      while (cursor < input.length) {
        const delimiter = closeAt(cursor);
        const nested = openerAt(cursor);
        if (!nested || (delimiter >= 0 && nested.index >= delimiter)) {
          if (delimiter < 0) return null;
          body += input.slice(cursor, delimiter);
          cursor = delimiter + 1;
          const content = compileInline(body.trim());
          const compiled = tag === 'rule'
            ? `<aside class="mkml-callout mkml-rule"><strong>Rule:</strong> ${content}</aside>`
            : tag === 'trap'
              ? `<aside class="mkml-callout mkml-trap"><strong>SSC Trap:</strong> ${content}</aside>`
              : '<div class="mkml-chain">' + content.split(/\s*(?:->|➔|&rarr;)\s*/).map((step, index) => (index ? '<span class="mkml-chain-arrow">➔</span>' : '') + '<span class="mkml-chain-step">' + step + '</span>').join('') + '</div>';
          return { html: compiled, end: cursor };
        }
        const inner = parseAt(nested.index, depth + 1);
        if (!inner) { body += input.slice(cursor, delimiter); cursor = delimiter + 1; continue; }
        body += input.slice(cursor, nested.index) + inner.html;
        cursor = inner.end;
      }
      return null;
    }
    let result = '';
    let cursor = 0;
    while (cursor < input.length) {
      const match = openerAt(cursor);
      if (!match) break;
      const parsed = parseAt(match.index);
      if (!parsed) { result += input.slice(cursor, match.index + match[0].length); cursor = match.index + match[0].length; continue; }
      result += input.slice(cursor, match.index) + parsed.html;
      cursor = parsed.end;
    }
    return result + input.slice(cursor);
  }

  function compileUnderline(source) {
    return String(source).replace(/<ud\s*=\s*([^>]+?)\s*>([\s\S]*?)(?:<\/ud\s*>|<ud\s*>)/gi, (_whole, rawLabel, text) => {
      const isRevealLocked = /\*\*rl\*\*/i.test(rawLabel);
      const label = rawLabel.replace(/\*\*rl\*\*/gi, '').trim();
      const revealClass = isRevealLocked ? ' mkml-rl-target is-rl-hidden' : '';
      return `<span class="angles-ud${revealClass}"${isRevealLocked ? ' data-rl-target="true"' : ''}><span class="angles-ud-word">${compileInline(text)}</span><span class="angles-ud-label">${escapeHtml(label)}</span></span>`;
    });
  }

  function compileTable(match, rowsText, colsText, body) {
    const rows = Math.max(1, Math.min(35, Number(rowsText)));
    const cols = Math.max(1, Math.min(25, Number(colsText)));
    const cellPattern = /<c(\d+)(\d+)\s*=\s*/gi;
    const markers = [...body.matchAll(cellPattern)];
    const cells = new Map();
    markers.forEach((marker, index) => {
      const start = marker.index + marker[0].length;
      const end = index + 1 < markers.length ? markers[index + 1].index : body.length;
      let value = body.slice(start, end).trim();
      if (value.endsWith('>')) value = value.slice(0, -1).trim();
      const row = Number(marker[1]);
      const col = Number(marker[2]);
      if (row >= 1 && row <= rows && col >= 1 && col <= cols) cells.set(`${row}-${col}`, compileInline(value));
    });
    const tableRows = Array.from({ length: rows }, (_, row) => `<tr>${Array.from({ length: cols }, (_, col) => `<td>${cells.get(`${row + 1}-${col + 1}`) || ''}</td>`).join('')}</tr>`).join('');
    return `<table class="angle-table" data-rows="${rows}" data-cols="${cols}"><tbody>${tableRows}</tbody></table>`;
  }

  function trimTagBoundary(value) {
    return String(value).trim().replace(/>\s*$/, '').trim();
  }

  function takeField(source, tag, stopPattern, preserveMarkup = false) {
    const opener = new RegExp(`<${tag}\\s*=\\s*`, 'i');
    const found = opener.exec(source);
    if (!found) return { value: '', source };
    const start = found.index + found[0].length;
    const tail = source.slice(start);
    const stop = stopPattern.exec(tail);
    const end = stop ? stop.index : tail.length;
    const rawValue = tail.slice(0, end);
    const value = preserveMarkup ? rawValue.trim() : trimTagBoundary(rawValue);
    const removeEnd = stop ? start + end : source.length;
    return { value, source: source.slice(0, found.index) + source.slice(removeEnd) };
  }

  function takeAnswer(source) {
    const pattern = /<(?:answer|ans)\s*=\s*([A-D])\s*>|<(?:answer|ans)\s*>\s*([A-D])\s*<\/(?:answer|ans)\s*>/i;
    const match = pattern.exec(source);
    return { answer: match ? (match[1] || match[2]).toLowerCase() : '', source: match ? source.slice(0, match.index) + source.slice(match.index + match[0].length) : source };
  }

  function compileQuestion(body, mode) {
    const idMatch = /<id\s*={1,2}\s*([^>]+)>/i.exec(body);
    const midMatch = /<mid\s*={1,2}\s*([^>]+)>/i.exec(body);
    const gapMatch = /<gap\s*={1,2}\s*([^>]+)>/i.exec(body);
    const typeMatch = /<type\s*={1,2}\s*([^>]+)>/i.exec(body);
    const stepMatch = /<step\s*[-_]?id\s*={1,2}\s*([^>]+)>/i.exec(body);
    const idVal = idMatch ? idMatch[1].trim() : '';
    const midVal = midMatch ? midMatch[1].trim() : '';
    const typeVal = typeMatch ? typeMatch[1].trim().replace(/\s+/g, ' ').toUpperCase() : '';
    const gapVal = gapMatch ? gapMatch[1].trim() : '';
    const stepVal = stepMatch ? stepMatch[1].trim().toUpperCase() : '';
    const badges = [
      idVal ? `<span class="mkml-question-id">${escapeHtml(idVal)}</span>` : '',
      typeVal ? `<span class="mkml-question-type">${escapeHtml(typeVal)}</span>` : '',
      midVal ? `<span class="mkml-question-mid">${escapeHtml(midVal)}</span>` : '',
      stepVal ? `<span class="mkml-question-step" data-step-id="${escapeHtml(stepVal)}">STEP · ${escapeHtml(stepVal)}</span>` : '',
      gapVal ? `<span class="mkml-question-gap">GAP · ${escapeHtml(gapVal)}</span>` : ''
    ].filter(Boolean).join('');
    body = body.replace(/<id\s*={1,2}\s*[^>]+>|<mid\s*={1,2}\s*[^>]+>|<gap\s*={1,2}\s*[^>]+>|<type\s*={1,2}\s*[^>]+>|<step\s*[-_]?id\s*={1,2}\s*[^>]+>/gi, '');
    const answerResult = takeAnswer(body);
    const explanationResult = takeField(answerResult.source, 'explanation', /<\/Qn\s*>|<\/qn\s+all\s*>/i, true);
    let remaining = explanationResult.source.replace(/<\/?Options\s*>/gi, '');
    const promptResult = takeField(remaining, 'text', /<(?:Options)\s*>|<[A-D](?:\s*=|\s+)|<(?:answer|ans|explanation)\s*=/i);
    remaining = promptResult.source;
    const options = [];
    const marker = /<([A-D])(?:\s*=\s*|\s+)/gi;
    const boundaries = [...remaining.matchAll(marker)];
    boundaries.forEach((entry, index) => {
      const start = entry.index + entry[0].length;
      const nextBoundary = index + 1 < boundaries.length ? boundaries[index + 1].index : remaining.length;
      const structural = /<(?:answer|ans|explanation)\s*=|<\/Options\s*>|<\/Qn\s*>|<\/qn\s+all\s*>/i.exec(remaining.slice(start, nextBoundary));
      const end = structural ? start + structural.index : nextBoundary;
      const text = trimTagBoundary(remaining.slice(start, end));
      options.push(`<button type="button" class="answer-option" data-answer="${entry[1].toLowerCase()}"><span class="option-letter">${entry[1].toUpperCase()}</span>${compileInline(text)}</button>`);
    });
    const details = explanationResult.value ? `<div class="explanation">${compileQuestionExplanation(explanationResult.value)}</div>` : '<div class="explanation"></div>';
    const normalizedMode = /^(exam|serious)$/i.test(mode) ? 'exam' : 'normal';
    const extraAttrs = [
      midVal ? ` data-mid="${escapeHtml(midVal)}"` : '',
      typeVal ? ` data-type="${escapeHtml(typeVal)}"` : '',
      stepVal ? ` data-step-id="${escapeHtml(stepVal)}"` : ''
    ].join('');
    return `<section class="question-card" data-mode="${normalizedMode}" data-answer="${escapeHtml(answerResult.answer)}"${extraAttrs}>${badges ? `<div class="mkml-question-badges">${badges}</div>` : ''}<div class="question-prompt">${compileInline(promptResult.value)}</div><div class="quiz-options">${options.join('')}</div><button type="button" class="quiz-explanation" hidden>Explanation</button>${details}<div class="question-result" aria-live="polite"></div></section>`;
  }

  function compileQuizGroup(_whole, attributes, body) {
    const mode = (readAttribute(attributes, 'mode') || 'normal').toLowerCase();
    const questions = [...body.matchAll(/<Qn\s*>([\s\S]*?)<\/Qn\s*>/gi)];
    const normalizedMode = /^(exam|serious)$/i.test(mode) ? 'exam' : 'normal';
    const cards = questions.length ? questions.map(question => compileQuestion(question[1], normalizedMode)) : (body.trim() ? [compileQuestion(body, normalizedMode)] : []);
    const count = cards.length;
    return `<section class="quiz-group" data-mode="${normalizedMode}" data-question-count="${count}"><div class="quiz-group-toolbar"><button type="button" class="quiz-mode-toggle" aria-pressed="${normalizedMode === 'exam'}">Mode: ${normalizedMode === 'exam' ? 'Exam' : 'Normal'}</button><span class="quiz-group-timer" aria-live="polite" hidden></span></div>${cards.join('\n')}<div class="quiz-group-footer"><span class="quiz-progress" aria-live="polite">Answered 0 / ${count}</span><button type="button" class="quiz-group-submit"${normalizedMode === 'exam' ? '' : ' hidden'}>Submit</button></div></section>`;
  }

  function parseGridPoints(source, expectedCount = null, minimumCount = 2) {
    const pair = String.raw`\(\s*\d+\s*,\s*\d+\s*\)`;
    const value = String(source || '').trim();
    if (!new RegExp(`^\\s*${pair}(?:\\s*,\\s*${pair})*\\s*$`).test(value)) return null;
    const points = [...value.matchAll(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/g)].map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
    if (points.length < minimumCount || (expectedCount !== null && points.length !== expectedCount)) return null;
    if (points.some((point) => !Number.isSafeInteger(point.x) || !Number.isSafeInteger(point.y) || point.x < 1 || point.y < 1)) return null;
    return points;
  }

  // Parses <line d> points and inline label text.
  // Supports points either in `points = (x1,y1),(x2,y2)` attribute OR inside the body `(x1,y1),(x2,y2) text here`.
  function parseLineDPointsAndText(attributes, body) {
    const attrPointsRaw = readAttribute(attributes, 'points');
    if (attrPointsRaw) {
      const pts = parseGridPoints(attrPointsRaw, null, 2);
      return pts ? { points: pts, labelText: String(body || '').trim() } : null;
    }
    const rawBody = String(body || '');
    const pointMatches = [...rawBody.matchAll(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/g)];
    if (pointMatches.length < 2) return null;
    const points = pointMatches.map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
    if (points.some((point) => !Number.isSafeInteger(point.x) || !Number.isSafeInteger(point.y) || point.x < 1 || point.y < 1)) return null;
    const labelText = rawBody
      .replace(/\(\s*\d+\s*,\s*\d+\s*\)/g, '')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .trim();
    return { points, labelText };
  }

  function validHexColor(value) { return /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(String(value || '')); }

  function normalizeSelfClosingLineD(source) {
    // Allow `<line d ...> ... <line d>` as an alias for `<line d ...> ... </line d>`
    return String(source || '').replace(/<line(\s+[^>]*?\bd\b[^>]*)>([\s\S]*?)<line\s+d\s*>/gi, '<line$1>$2</line d>');
  }

  function computeUprightAngleDeg(p1, p2, cellWidthPx = 64, rowHeightPx = 32) {
    const dx = (p2.x - p1.x) * cellWidthPx;
    const dy = (p2.y - p1.y) * rowHeightPx;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    return Number(angle.toFixed(2));
  }

  function computeBoxWBaseline(points) {
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const toPct = (pt) => ({
      x: ((pt.x - minX) / spanX) * 100,
      y: ((pt.y - minY) / spanY) * 100
    });
    const p0 = toPct(points[0]);
    const p1 = toPct(points[1]);
    const p2 = toPct(points[2]);
    const p3 = toPct(points[3]);
    // 25% height from the bottom edge (P3 -> P2) = 75% down from top edge (P0 -> P1)
    const t = 0.75;
    const x1 = p0.x + (p3.x - p0.x) * t;
    const y1 = p0.y + (p3.y - p0.y) * t;
    const x2 = p1.x + (p2.x - p1.x) * t;
    const y2 = p1.y + (p2.y - p1.y) * t;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angleDeg = computeUprightAngleDeg(points[3], points[2], 64, 32);
    return {
      x1: formatPercent(x1),
      y1: formatPercent(y1),
      x2: formatPercent(x2),
      y2: formatPercent(y2),
      midX: formatPercent(midX),
      midY: formatPercent(midY),
      angleDeg
    };
  }

  function scanQuestionBoxBlocks(source) {
    const blocks = [];
    const stack = [];
    for (const token of String(source || '').matchAll(/<box\b[^>]*>|<\/box(?:\s+w)?\s*>/gi)) {
      if (/^<box\b/i.test(token[0])) {
        const attrs = token[0].replace(/^<box\b/i, '').replace(/>$/, '');
        const isBoxW = /(?:^|\s)w(?:\s|$)/i.test(attrs);
        const block = { start: token.index, openEnd: token.index + token[0].length, attributes: attrs, isBoxW, parent: stack[stack.length - 1] || null };
        stack.push(block);
      } else {
        const block = stack.pop();
        if (!block) continue;
        if (/<\/box\s+w\s*>/i.test(token[0])) block.isBoxW = true;
        block.closeStart = token.index;
        block.end = token.index + token[0].length;
        block.body = source.slice(block.openEnd, token.index);
        blocks.push(block);
      }
    }
    return blocks.sort((a, b) => a.start - b.start);
  }

  function validFlowPolygon(points) {
    if (!points || points.length !== 4 || new Set(points.map((point) => `${point.x},${point.y}`)).size !== 4) return false;
    const area = points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0);
    return area !== 0 && !segmentsIntersect(points[0], points[1], points[2], points[3]) && !segmentsIntersect(points[1], points[2], points[3], points[0]);
  }

  function compileQuestionExplanation(source) {
    const warnings = [];
    const lines = [];
    const comments = [];
    const maskedComments = String(source || '').replace(/<!--[\s\S]*?-->/g, (comment) => {
      const token = `<!--__MKML_EXP_COMMENT_${comments.length}__-->`;
      comments.push(comment);
      return token;
    });
    const restoreComments = (text) => String(text).replace(/<!--__MKML_EXP_COMMENT_(\d+)__-->/g, (_, idx) => comments[Number(idx)] || '');
    const raw = normalizeSelfClosingLineD(maskedComments);
    let geometrySource = raw.replace(/<line\b([^>]*)>([\s\S]*?)<\/line(\s+[md])?\s*>/gi, (_whole, attributes, body, closingMode) => {
      const isModeM = /(?:^|\s)m(?:\s|$)/i.test(attributes);
      const isModeD = /(?:^|\s)d(?:\s|$)/i.test(attributes);
      const closeTrim = (closingMode || '').trim().toLowerCase();
      if (isModeD) {
        const tag = '<line d>';
        if (closeTrim && closeTrim !== 'd') { warnings.push(warnQuestionGraph(tag, 'opening and closing line tags must use the same mode')); return ''; }
        const parsed = parseLineDPointsAndText(attributes, body);
        if (!parsed) { warnings.push(warnQuestionGraph(tag, 'use at least two comma-separated integer grid points')); return ''; }
        const lineColor = readAnyAttribute(attributes, ['line-color', 'color']);
        const textColor = readAnyAttribute(attributes, ['text-color', 'color']);
        if ((lineColor && !validHexColor(lineColor)) || (textColor && !validHexColor(textColor))) {
          warnings.push(warnQuestionGraph(tag, 'line-color and text-color must be 3- or 6-digit hex values')); return '';
        }
        lines.push({ points: parsed.points, color: lineColor || 'currentColor', textColor: textColor || '#000000', labelText: parsed.labelText, overBox: true, isLineD: true });
        return '';
      }
      const overBox = isModeM;
      const tag = overBox ? '<line m>' : '<line>';
      if (overBox !== (closeTrim === 'm')) { warnings.push(warnQuestionGraph(tag, 'opening and closing line tags must use the same mode')); return ''; }
      const points = parseGridPoints(body, null, 2);
      if (!points) { warnings.push(warnQuestionGraph(tag, 'use at least two comma-separated integer grid points')); return ''; }
      const color = readAttribute(attributes, 'color');
      if (color && !validHexColor(color)) { warnings.push(warnQuestionGraph(tag, 'color must be a 3- or 6-digit hex value')); return ''; }
      lines.push({ points, color: color || 'currentColor', overBox });
      return '';
    });

    const originalBoxBlocks = scanQuestionBoxBlocks(geometrySource);
    const topLevelBoxes = originalBoxBlocks.filter((block) => !block.parent);
    const cropBlock = topLevelBoxes[0] && !topLevelBoxes[0].isBoxW ? topLevelBoxes[0] : null;
    let graphSource = cropBlock
      ? geometrySource.slice(0, cropBlock.start) + cropBlock.body + geometrySource.slice(cropBlock.end)
      : geometrySource;
    let explanationText = geometrySource;
    for (const block of topLevelBoxes.slice().sort((a, b) => b.start - a.start)) {
      explanationText = explanationText.slice(0, block.start) + explanationText.slice(block.end);
    }

    const boxBlocks = scanQuestionBoxBlocks(graphSource);
    const visibleBoxes = [];
    for (const block of boxBlocks) {
      const points = parseGridPoints(readAttribute(block.attributes, 'points'), 4, 4);
      const background = readAnyAttribute(block.attributes, ['bg-color', 'background-color']);
      const color = readAnyAttribute(block.attributes, ['text-color', 'color']);
      const tagLabel = block.isBoxW ? '<box w>' : '<box>';
      if (!validFlowPolygon(points) || (background && !validHexColor(background)) || (color && !validHexColor(color))) {
        warnings.push(warnQuestionGraph(tagLabel, 'use four valid perimeter-ordered points and valid hex colors'));
        continue;
      }
      let body = block.body;
      const childBlocks = boxBlocks.filter((child) => child.parent === block).sort((a, b) => b.start - a.start);
      for (const child of childBlocks) {
        const start = child.start - block.openEnd;
        const end = child.end - block.openEnd;
        body = body.slice(0, start) + body.slice(end);
      }
      visibleBoxes.push({
        points,
        body,
        isBoxW: Boolean(block.isBoxW),
        background: background || (block.isBoxW ? 'transparent' : '#fbfbf7'),
        color: color || (block.isBoxW ? '#000000' : 'var(--ink)')
      });
    }

    let cropPoints = null;
    if (cropBlock) {
      const parsed = parseGridPoints(readAttribute(cropBlock.attributes, 'points'), 4, 4);
      if (validFlowPolygon(parsed)) cropPoints = parsed;
      else warnings.push(warnQuestionGraph('<box>', 'the first outer box is the crop boundary and needs four valid perimeter-ordered points'));
    }
    const allPoints = [...lines.flatMap((line) => line.points), ...visibleBoxes.flatMap((box) => box.points)];
    const cleanExplanationText = restoreComments(explanationText).trim();
    if (!cropPoints && allPoints.length === 0) return `${compileInline(cleanExplanationText)}${warnings.join('')}`;

    const minCol = cropPoints ? Math.min(...cropPoints.map((point) => point.x)) : Math.min(...allPoints.map((point) => point.x));
    const maxCol = cropPoints ? Math.max(...cropPoints.map((point) => point.x)) : Math.max(...allPoints.map((point) => point.x));
    const minRow = cropPoints ? Math.min(...cropPoints.map((point) => point.y)) : Math.min(...allPoints.map((point) => point.y));
    const maxRow = cropPoints ? Math.max(...cropPoints.map((point) => point.y)) : Math.max(...allPoints.map((point) => point.y));
    const colSpan = Math.max(1, maxCol - minCol);
    const rowSpan = Math.max(1, maxRow - minRow);
    const cellWidth = 64;
    const viewWidth = colSpan * 100;
    const viewHeight = rowSpan * 32;
    const clipPoints = cropPoints || [{ x: minCol, y: minRow }, { x: minCol + colSpan, y: minRow }, { x: minCol + colSpan, y: minRow + rowSpan }, { x: minCol, y: minRow + rowSpan }];
    const clipPolygon = clipPoints.map((point) => `${formatPercent((point.x - minCol) / colSpan * 100)}% ${formatPercent((point.y - minRow) / rowSpan * 100)}%`).join(',');
    const normalLines = lines.filter((line) => !line.overBox);
    const overLines = lines.filter((line) => line.overBox);
    const boxMarkup = visibleBoxes.map((box) => {
      const boxMinX = Math.min(...box.points.map((point) => point.x)), boxMaxX = Math.max(...box.points.map((point) => point.x));
      const boxMinY = Math.min(...box.points.map((point) => point.y)), boxMaxY = Math.max(...box.points.map((point) => point.y));
      const polygon = box.points.map((point) => `${formatPercent((point.x - boxMinX) / (boxMaxX - boxMinX) * 100)}% ${formatPercent((point.y - boxMinY) / (boxMaxY - boxMinY) * 100)}%`).join(',');
      if (box.isBoxW) {
        const bw = computeBoxWBaseline(box.points);
        const borderStyle = box.background === 'transparent' ? 'border-color:transparent;' : '';
        return `<div class="mkml-question-graph-box mkml-flow-box-w" style="left:${(boxMinX - minCol) * cellWidth}px;top:${(boxMinY - minRow) * 32}px;width:${Math.max(1, boxMaxX - boxMinX) * cellWidth}px;height:${Math.max(1, boxMaxY - boxMinY) * 32}px;color:${escapeHtml(box.color)}"><div class="mkml-question-graph-shape" style="clip-path:polygon(${polygon});background-color:${escapeHtml(box.background)};color:${escapeHtml(box.color)};${borderStyle}"></div><svg class="mkml-box-w-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="${bw.x1}" y1="${bw.y1}" x2="${bw.x2}" y2="${bw.y2}" stroke="${escapeHtml(box.color)}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg><div class="mkml-question-graph-content mkml-box-w-text" style="left:${bw.midX}%;top:${bw.midY}%;transform:translate(-50%,-100%) rotate(${bw.angleDeg}deg)">${compileMarkup(restoreComments(box.body))}</div></div>`;
      }
      return `<div class="mkml-question-graph-box" style="left:${(boxMinX - minCol) * cellWidth}px;top:${(boxMinY - minRow) * 32}px;width:${Math.max(1, boxMaxX - boxMinX) * cellWidth}px;height:${Math.max(1, boxMaxY - boxMinY) * 32}px;color:${escapeHtml(box.color)}"><div class="mkml-question-graph-shape" style="clip-path:polygon(${polygon});background-color:${escapeHtml(box.background)};color:${escapeHtml(box.color)}"></div><div class="mkml-question-graph-content">${compileMarkup(restoreComments(box.body))}</div></div>`;
    }).join('');
    const lineDLabelsMarkup = overLines.filter((line) => line.isLineD && line.labelText).map((line) => {
      const midIdx = Math.floor((line.points.length - 1) / 2);
      const pA = line.points[midIdx];
      const pB = line.points[Math.min(line.points.length - 1, midIdx + 1)];
      const midX = (((pA.x + pB.x) / 2) - minCol) * cellWidth;
      const midY = (((pA.y + pB.y) / 2) - minRow) * 32;
      const angleDeg = computeUprightAngleDeg(pA, pB, cellWidth, 32);
      return `<div class="mkml-line-d-label" style="left:${midX}px;top:${midY}px;color:${escapeHtml(line.textColor || '#000000')};transform:translate(-50%,-100%) rotate(${angleDeg}deg)">${compileInline(line.labelText)}</div>`;
    }).join('');
    const diagram = `<div class="mkml-question-diagram-scroll"><div class="mkml-question-diagram-window" role="img" aria-label="Question-specific grid diagram" style="width:${colSpan * cellWidth}px;height:${rowSpan * 32}px;clip-path:polygon(${clipPolygon})"><svg class="mkml-question-diagram-lines" viewBox="0 0 ${viewWidth} ${viewHeight}" preserveAspectRatio="none" aria-hidden="true">${normalLines.map((line) => `<polyline points="${line.points.map((point) => `${(point.x - minCol) * 100},${(point.y - minRow) * 32}`).join(' ')}" fill="none" stroke="${escapeHtml(line.color)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>${boxMarkup}<svg class="mkml-question-diagram-over-lines" viewBox="0 0 ${viewWidth} ${viewHeight}" preserveAspectRatio="none" aria-hidden="true">${overLines.map((line) => `<polyline points="${line.points.map((point) => `${(point.x - minCol) * 100},${(point.y - minRow) * 32}`).join(' ')}" fill="none" stroke="${escapeHtml(line.color)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>${lineDLabelsMarkup}</div></div>`;
    return `${compileInline(cleanExplanationText)}${diagram}${warnings.join('')}`;
  }

  function warnQuestionGraph(tag, message) { return `<span class="mkml-flow-error">${escapeHtml(tag)} skipped: ${escapeHtml(message)}</span>`; }
  function formatPercent(value) { return Number(value.toFixed(4)).toString(); }

  function segmentsIntersect(a, b, c, d) {
    const orient = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const onSegment = (p, q, r) => q.x >= Math.min(p.x, r.x) && q.x <= Math.max(p.x, r.x) && q.y >= Math.min(p.y, r.y) && q.y <= Math.max(p.y, r.y);
    const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
    if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) return true;
    return (o1 === 0 && onSegment(a, c, b)) || (o2 === 0 && onSegment(a, d, b)) || (o3 === 0 && onSegment(c, a, d)) || (o4 === 0 && onSegment(c, b, d));
  }

  function findEnclosingConceptMidAt(html, position) {
    const prefix = html.slice(0, position);
    let lastOpen = null;
    for (const token of prefix.matchAll(/<mid\s*=\s*(c\d+|un)\s*>|<\/mid\s*>|<Concept\s*==\s*([^>]+)>|<\/Concept\s*>/gi)) {
      if (/^<mid\b/i.test(token[0])) lastOpen = token[1].toUpperCase();
      else if (/^<Concept\b/i.test(token[0])) lastOpen = token[2].trim();
      else lastOpen = null;
    }
    return lastOpen || '';
  }

  function compileFlowchartTags(source, depth = 0) {
    const comments = [];
    const masked = String(source || '').replace(/<!--[\s\S]*?-->/g, (comment) => {
      const token = `<!--__MKML_FLOW_COMMENT_${comments.length}__-->`;
      comments.push(comment);
      return token;
    });
    const restoreComments = (text) => String(text).replace(/<!--__MKML_FLOW_COMMENT_(\d+)__-->/g, (_, idx) => comments[Number(idx)] || '');
    let html = normalizeSelfClosingLineD(masked);
    const lines = [];
    const overLines = [];
    const boxes = [];
    const warn = (tag, message) => `<span class="mkml-flow-error">${escapeHtml(tag)} skipped: ${escapeHtml(message)}</span>`;
    html = html.replace(/<line\b([^>]*)>([\s\S]*?)<\/line(\s+[md])?\s*>/gi, (_whole, attributes, body, closingMode) => {
      const isModeM = /(?:^|\s)m(?:\s|$)/i.test(attributes);
      const isModeD = /(?:^|\s)d(?:\s|$)/i.test(attributes);
      const closeTrim = (closingMode || '').trim().toLowerCase();
      if (isModeD) {
        const tag = '<line d>';
        if (closeTrim && closeTrim !== 'd') return warn(tag, 'opening and closing line tags must use the same mode');
        const parsed = parseLineDPointsAndText(attributes, body);
        if (!parsed) return warn(tag, 'use at least two comma-separated integer grid points, e.g. (1,1),(4,1) text');
        const lineColor = readAnyAttribute(attributes, ['line-color', 'color']);
        const textColor = readAnyAttribute(attributes, ['text-color', 'color']);
        if ((lineColor && !validHexColor(lineColor)) || (textColor && !validHexColor(textColor))) {
          return warn(tag, 'line-color and text-color must be 3- or 6-digit hex values such as #36C or #3366CC');
        }
        overLines.push({
          points: parsed.points,
          color: lineColor || 'currentColor',
          textColor: textColor || '#000000',
          labelText: parsed.labelText,
          isLineD: true
        });
        return '';
      }
      const overBox = isModeM;
      const tag = overBox ? '<line m>' : '<line>';
      if (overBox !== (closeTrim === 'm')) return warn(tag, 'opening and closing line tags must use the same mode');
      const points = parseGridPoints(body, null, 2);
      if (!points) return warn(tag, 'use at least two comma-separated integer grid points, e.g. (1,1),(4,1)');
      const color = readAttribute(attributes, 'color');
      if (color && !validHexColor(color)) return warn(tag, 'color must be a 3- or 6-digit hex value such as #36C or #3366CC');
      (overBox ? overLines : lines).push({ points, color: color || 'currentColor' });
      return '';
    });
    const boxBlocks = [];
    const boxStack = [];
    for (const token of html.matchAll(/<box\b[^>]*>|<\/box(?:\s+w)?\s*>/gi)) {
      if (/^<box\b/i.test(token[0])) boxStack.push(token);
      else {
        const opening = boxStack.pop();
        if (opening && boxStack.length === 0) {
          const attrs = opening[0].replace(/^<box\b/i, '').replace(/>$/, '');
          const isBoxW = /(?:^|\s)w(?:\s|$)/i.test(attrs) || /<\/box\s+w\s*>/i.test(token[0]);
          const conceptMid = findEnclosingConceptMidAt(html, opening.index);
          boxBlocks.push({
            start: opening.index,
            end: token.index + token[0].length,
            attributes: attrs,
            isBoxW,
            conceptMid,
            body: html.slice(opening.index + opening[0].length, token.index)
          });
        }
      }
    }
    const replacements = [];
    for (const block of boxBlocks) {
      const tagLabel = block.isBoxW ? '<box w>' : '<box>';
      const points = parseGridPoints(readAttribute(block.attributes, 'points'), 4, 4);
      if (!points) { replacements.push({ ...block, markup: warn(tagLabel, 'points must contain exactly four comma-separated integer grid points') }); continue; }
      const unique = new Set(points.map((point) => `${point.x},${point.y}`));
      const area = points.reduce((sum, point, index) => {
        const next = points[(index + 1) % points.length];
        return sum + point.x * next.y - next.x * point.y;
      }, 0);
      if (unique.size !== 4 || area === 0 || segmentsIntersect(points[0], points[1], points[2], points[3]) || segmentsIntersect(points[1], points[2], points[3], points[0])) {
        replacements.push({ ...block, markup: warn(tagLabel, 'the four points must form a non-self-intersecting quadrilateral in perimeter order') }); continue;
      }
      const background = readAnyAttribute(block.attributes, ['bg-color', 'background-color']);
      const color = readAnyAttribute(block.attributes, ['text-color', 'color']);
      if ((background && !validHexColor(background)) || (color && !validHexColor(color))) {
        replacements.push({ ...block, markup: warn(tagLabel, 'background-color/bg-color and color/text-color must be 3- or 6-digit hex values') }); continue;
      }
      boxes.push({
        points,
        body: block.body,
        isBoxW: Boolean(block.isBoxW),
        conceptMid: block.conceptMid || '',
        background: background || (block.isBoxW ? 'transparent' : '#fbfbf7'),
        color: color || (block.isBoxW ? '#000000' : 'var(--ink)')
      });
      replacements.push({ ...block, markup: '' });
    }
    for (const replacement of replacements.reverse()) html = html.slice(0, replacement.start) + replacement.markup + html.slice(replacement.end);

    const maxCol = Math.max(25, ...lines.flatMap((line) => line.points.map((point) => point.x)), ...overLines.flatMap((line) => line.points.map((point) => point.x)), ...boxes.flatMap((box) => box.points.map((point) => point.x)));
    const maxRow = Math.max(35, ...lines.flatMap((line) => line.points.map((point) => point.y)), ...overLines.flatMap((line) => line.points.map((point) => point.y)), ...boxes.flatMap((box) => box.points.map((point) => point.y)));
    const svgWidth = maxCol * 100;
    const svgHeight = maxRow * 32;
    const lineMarkup = lines.length ? `<svg class="mkml-flow-lines" data-max-col="${maxCol}" data-max-row="${maxRow}" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="${svgHeight}" preserveAspectRatio="none" aria-hidden="true">${lines.map((line) => `<polyline points="${line.points.map((point) => `${(point.x - 1) * 100},${(point.y - 1) * 32}`).join(' ')}" fill="none" stroke="${escapeHtml(line.color)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>` : '';
    const lineDLabels = overLines.filter((line) => line.isLineD && line.labelText).map((line) => {
      const midIdx = Math.floor((line.points.length - 1) / 2);
      const pA = line.points[midIdx];
      const pB = line.points[Math.min(line.points.length - 1, midIdx + 1)];
      const midColOffset = ((pA.x + pB.x) / 2) - 1;
      const midRowPx = 47 + (((pA.y + pB.y) / 2) - 1) * 32;
      const angleDeg = computeUprightAngleDeg(pA, pB, 64, 32);
      return `<div class="mkml-line-d-label" data-max-col="${maxCol}" data-max-row="${maxRow}" style="left:calc(${midColOffset} * var(--grid-cell-width));top:${midRowPx}px;color:${escapeHtml(line.textColor || '#000000')};transform:translate(-50%,-100%) rotate(${angleDeg}deg)">${compileInline(line.labelText)}</div>`;
    }).join('');
    const overLineMarkup = (overLines.length ? `<svg class="mkml-flow-lines-m" data-max-col="${maxCol}" data-max-row="${maxRow}" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="${svgHeight}" preserveAspectRatio="none" aria-hidden="true">${overLines.map((line) => `<polyline points="${line.points.map((point) => `${(point.x - 1) * 100},${(point.y - 1) * 32}`).join(' ')}" fill="none" stroke="${escapeHtml(line.color)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>` : '') + lineDLabels;
    const boxMarkup = boxes.map((box) => {
      const minX = Math.min(...box.points.map((point) => point.x)), maxX = Math.max(...box.points.map((point) => point.x));
      const minY = Math.min(...box.points.map((point) => point.y)), maxY = Math.max(...box.points.map((point) => point.y));
      const polygon = box.points.map((point) => `${formatPercent((point.x - minX) / (maxX - minX) * 100)}% ${formatPercent((point.y - minY) / (maxY - minY) * 100)}%`).join(',');
      const left = minX - 1;
      const width = maxX - minX;
      const top = 47 + (minY - 1) * 32;
      const height = (maxY - minY) * 32;
      const content = depth < 16 ? compileSource(restoreComments(box.body), depth + 1) : compileMarkup(restoreComments(box.body));
      const conceptAttr = box.conceptMid ? ` data-concept-mid="${escapeHtml(box.conceptMid)}"` : '';
      if (box.isBoxW) {
        const bw = computeBoxWBaseline(box.points);
        const borderStyle = box.background === 'transparent' ? 'border-color:transparent;' : '';
        return `<div class="mkml-flow-box mkml-flow-box-w" data-box-w="true"${conceptAttr} data-min-col="${minX}" data-min-row="${minY}" data-max-col="${maxX}" data-max-row="${maxY}" data-grid-width="${width}" data-grid-height="${maxY - minY}" style="left:calc(${left} * var(--grid-cell-width));top:${top}px;width:calc(${width} * var(--grid-cell-width));height:${height}px;color:${escapeHtml(box.color)}"><div class="mkml-flow-box-shape" style="clip-path:polygon(${polygon});background-color:${escapeHtml(box.background)};color:${escapeHtml(box.color)};${borderStyle}"></div><svg class="mkml-box-w-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="${bw.x1}" y1="${bw.y1}" x2="${bw.x2}" y2="${bw.y2}" stroke="${escapeHtml(box.color)}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg><div class="mkml-flow-box-content mkml-box-w-text" style="left:${bw.midX}%;top:${bw.midY}%;transform:translate(-50%,-100%) rotate(${bw.angleDeg}deg)">${content}</div></div>`;
      }
      return `<div class="mkml-flow-box"${conceptAttr} data-min-col="${minX}" data-min-row="${minY}" data-max-col="${maxX}" data-max-row="${maxY}" data-grid-width="${width}" data-grid-height="${maxY - minY}" style="left:calc(${left} * var(--grid-cell-width));top:${top}px;width:calc(${width} * var(--grid-cell-width));height:${height}px;color:${escapeHtml(box.color)}"><div class="mkml-flow-box-shape" style="clip-path:polygon(${polygon});background-color:${escapeHtml(box.background)};color:${escapeHtml(box.color)}"></div><div class="mkml-flow-box-content">${content}</div></div>`;
    }).join('');
    return { html: restoreComments(html), lineMarkup, boxMarkup, overLineMarkup };
  }

  function compileMarkup(source) {
    let html = String(source || '');
    html = html.replace(/<(?:Domain|Chapter)\s*==\s*[^>]+>/gi, '');
    html = html.replace(/<Subtopic\s*==\s*([^>]+)>/gi, (_whole, st) => `<section class="mkml-subtopic-scope" data-subtopic="${escapeHtml(st.trim())}">`);
    html = html.replace(/<\/Subtopic\s*>/gi, '</section>');
    html = html.replace(/<Concept\s*==\s*([^>]+)>/gi, (_whole, con) => `<section class="mkml-concept-scope" data-concept="${escapeHtml(con.trim())}">`);
    html = html.replace(/<\/Concept\s*>/gi, '</section>');
    html = html.replace(/<MC\s*==\s*([^>]+)>/gi, (_whole, mc) => `<div class="mkml-mc-scope" data-mc="${escapeHtml(mc.trim())}">`);
    html = html.replace(/<\/MC\s*>/gi, '</div>');
    html = html.replace(/<mid\s*=\s*(c\d+|un)\s*>/gi, (_whole, mid) => `<section class="mkml-mid-concept" data-mid="${escapeHtml(mid.toUpperCase())}">`);
    html = html.replace(/<\/mid\s*>/gi, '</section>');
    html = compileSemanticBlocks(html);
    html = html.replace(/<qn\s+all\b([^>]*)>([\s\S]*?)<\/qn\s+all\s*>/gi, compileQuizGroup);
    html = html.replace(/<qn\s+all\b([^>]*)>((?:(?!<Qn\s*>)[\s\S])*?)<\/qn\s*>/gi, compileQuizGroup);
    html = html.replace(/<table\s+r\s*=\s*(\d+)\s+c\s*=\s*(\d+)\s*>([\s\S]*?)<\/table\s*>/gi, compileTable);
    html = html.replace(/<grid\s+([^>]+)>([\s\S]*?)<\/grid\s*>/gi, (_whole, attrs, content) => gridMarkup(attrs, content));
    html = html.replace(/<grid\s+([^>]+)\s*\/>/gi, (_whole, attrs) => gridMarkup(attrs, ''));
    return compileUnderline(compileInline(html));
  }

  function compileSource(source, depth = 0) {
    const protectedSource = stripCssLinks(source).replace(/(<explanation\s*=\s*)([\s\S]*?)(?=<\/Qn\s*>|<\/qn\s+all\s*>)/gi, (_whole, opening, body) => opening + body.replace(/<(\/?)((?:line|box))\b/gi, '<$1question-$2'));
    const flow = compileFlowchartTags(protectedSource, depth);
    const restoredHtml = flow.html.replace(/<(\/?)question-(line|box)\b/gi, '<$1$2');
    return compileMarkup(restoredHtml) + flow.lineMarkup + flow.boxMarkup + flow.overLineMarkup;
  }

  function compile(source) { return compileSource(source, 0); }

  function renderMath(root) {
    if (!root || !root.querySelectorAll || !globalThis.katex) return;
    root.querySelectorAll('.mkml-math').forEach(node => {
      try { globalThis.katex.render(node.dataset.tex || '', node, { throwOnError: false, strict: 'ignore' }); }
      catch (error) { node.title = error.message || 'Could not typeset expression'; }
    });
  }

  return { compile, compileCss, cleanCss, linkedCss, stripCssLinks, compileInline, toTex, renderMath };
});
