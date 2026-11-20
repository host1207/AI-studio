(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const state = {
    chapters: [],
    selectedFolder: '',
    record: null,
    sandboxByFolder: new Map(),
    sandboxSequence: new Map(),
    sandboxActive: false,
    busy: false,
    selectionRequest: 0,
    activeTab: 'part1', // 'part1' | 'part2' | 'cards' | 'test' | 'registry'
    cardFilterConcept: 'ALL',
    cardFilterStepId: 'ALL',
    cardFilterStatus: 'ALL',
    cardMode: 'study', // 'study' | 'shallow'
    fromDiagramPlaceholder: false,
    shallowSelections: {},
    shallowSubmitted: false,
    shallowStartTime: null,
    testSession: null, // { questions: [], index: 0, answers: {}, questionStartAt: 0, durations: {}, submitted: false }
    examWeightsByMid: {
      TRG: { domain: 'Quantitative Aptitude', cgl: 12.5, chsl: 11.0, cpo: 10.5, cds: 16.0, cat: 6.0 },
      PN: { domain: 'English Comprehension', cgl: 8.5, chsl: 9.0, cpo: 9.5, cds: 7.5, cat: 4.0 },
      SVA: { domain: 'English Comprehension', cgl: 10.0, chsl: 10.5, cpo: 11.0, cds: 9.0, cat: 5.0 },
      BS: { domain: 'English Comprehension', cgl: 6.5, chsl: 7.0, cpo: 6.5, cds: 6.0, cat: 3.5 },
      VB: { domain: 'English Comprehension', cgl: 9.5, chsl: 9.0, cpo: 10.0, cds: 8.5, cat: 4.5 },
      TN: { domain: 'English Comprehension', cgl: 9.0, chsl: 9.5, cpo: 9.0, cds: 8.0, cat: 4.0 }
    }
  };
  const Engine = window.AnglesTrackerEngine;

  const STEP_ID_CATALOG = {
    T1: 'T1 · Fundamental Ratio & Right-Triangle Setup',
    T2: 'T2 · Angle / Radian-Degree & Standard Value Conversion',
    T3: 'T3 · Pythagorean Identity & Compound Ratio Simplification',
    TG: 'TG · Multi-Step Algebraic & Trigonometric Trap Synthesis'
  };

  async function api(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || `Request failed (${response.status})`);
      error.code = body.code || 'TRACKER_ERROR'; error.details = body.details || [];
      throw error;
    }
    return body;
  }
  function prettyNumber(value) { return Number(value || 0).toFixed(2); }
  function percentage(value) { return value == null ? 'N/A (0 Questions)' : `${prettyNumber(value)}%`; }
  function currentLedger() { return state.sandboxActive ? state.sandboxByFolder.get(state.selectedFolder) : state.record?.ledger; }
  function countQuestions(ledger) { return Object.values(ledger?.concepts || {}).reduce((sum, questions) => sum + Object.keys(questions || {}).length, 0); }
  function dateLabel(value) {
    if (!value) return 'No evaluations yet';
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? 'Evaluation date unavailable' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }
  function friendlyIssue(status) {
    return ({ 'missing-mid': 'MID not assigned', 'mid-conflict': 'Folder has conflicting MIDs', 'duplicate-mid': 'Root MID is shared', reserved: 'Reserved MID' })[status] || 'Tracker ledger needs attention';
  }

  function collectStructuredQuestions(ledger) {
    if (!ledger || !ledger.concepts) return [];
    const list = [];
    const metaMap = ledger.questionMeta || {};
    for (const [conceptMid, questions] of Object.entries(ledger.concepts)) {
      for (const [questionId, attempts] of Object.entries(questions || {})) {
        const meta = metaMap[questionId] || {};
        const latest = Array.isArray(attempts) && attempts.length ? attempts[attempts.length - 1] : null;
        const status = latest ? latest[0] : 'NA';
        const seconds = latest ? latest[1] : null;
        const accMark = latest ? latest[2] : 0;
        const timeMark = latest ? latest[3] : 0;
        const selectedOption = latest ? latest[4] : '';
        const stepId = (meta.stepId || '').trim().toUpperCase();
        list.push({
          id: questionId,
          conceptMid,
          fullMid: `${ledger.chapterMid}.${conceptMid}`,
          type: meta.type || 'UNTYPED',
          stepId,
          gap: meta.gap || '',
          text: meta.text || '',
          optionsMap: meta.optionsMap || {},
          answer: (meta.answer || 'A').toUpperCase(),
          explanation: meta.explanation || '',
          sourceFile: meta.sourceFile || '',
          attempts: Array.isArray(attempts) ? attempts : [],
          latest,
          status,
          seconds,
          accMark,
          timeMark,
          totalMark: accMark + timeMark,
          selectedOption
        });
      }
    }
    return list;
  }

  function calculateConceptBreakdown(ledger) {
    const config = ledger?.timingConfig || {};
    const rows = [];
    for (const [conceptMid, questions] of Object.entries(ledger?.concepts || {})) {
      let TQ = 0, NQC = 0, NQW = 0, NQS = 0, NQNA = 0, armnt = 0, ntm = 0;
      for (const attempts of Object.values(questions || {})) {
        TQ += 1;
        if (!attempts || !attempts.length) { NQNA += 1; continue; }
        const [status, seconds] = attempts[attempts.length - 1];
        armnt += Engine.ACCURACY[status] || 0;
        if (status === 'C') {
          NQC += 1;
          if (config.locked) ntm += Engine.expectedTimeMark(status, seconds, config);
        } else if (status === 'W') NQW += 1;
        else NQS += 1;
      }
      const MM = TQ * 3;
      const LTM = armnt + ntm;
      const completionPct = MM > 0 ? (LTM / MM) * 100 : null;
      const accuracyPct = (NQC + NQW + NQS) > 0 ? (NQC / (NQC + NQW + NQS)) * 100 : null;
      rows.push({
        conceptMid,
        fullMid: `${ledger.chapterMid}.${conceptMid}`,
        TQ, NQC, NQW, NQS, NQNA,
        MM, ARMNT: armnt, NTM: ntm, LTM,
        completionPct,
        accuracyPct
      });
    }
    return rows;
  }

  function calculateStepIdDiagnostics(ledger) {
    const allQuestions = collectStructuredQuestions(ledger);
    const groups = new Map();
    for (const code of Object.keys(STEP_ID_CATALOG)) {
      groups.set(code, { stepId: code, title: STEP_ID_CATALOG[code], total: 0, attempted: 0, correct: 0, wrong: 0, skipped: 0, unasked: 0, totalSeconds: 0, LTM: 0, MM: 0 });
    }
    for (const q of allQuestions) {
      const key = q.stepId || 'UNTAGGED';
      if (!groups.has(key)) {
        groups.set(key, {
          stepId: key,
          title: key === 'UNTAGGED' ? 'UNTAGGED · Questions without <step id>' : `${key} · Custom Micro-Concept Step`,
          total: 0, attempted: 0, correct: 0, wrong: 0, skipped: 0, unasked: 0, totalSeconds: 0, LTM: 0, MM: 0
        });
      }
      const g = groups.get(key);
      g.total += 1;
      g.MM += 3;
      if (q.status === 'NA') {
        g.unasked += 1;
      } else {
        g.attempted += 1;
        g.totalSeconds += (q.seconds || 0);
        g.LTM += q.totalMark;
        if (q.status === 'C') g.correct += 1;
        else if (q.status === 'W') g.wrong += 1;
        else g.skipped += 1;
      }
    }
    return [...groups.values()].filter((g) => g.total > 0).map((g) => {
      const failureRate = g.attempted > 0 ? ((g.wrong + g.skipped) / g.attempted) * 100 : null;
      const accuracyRate = g.attempted > 0 ? (g.correct / g.attempted) * 100 : null;
      const avgTime = g.attempted > 0 ? g.totalSeconds / g.attempted : null;
      let statusLabel = 'UNPATCHED';
      let statusClass = 'is-neutral';
      if (g.attempted > 0) {
        if (failureRate >= 45) { statusLabel = 'CRITICAL WEAK SPOT'; statusClass = 'is-critical'; }
        else if (failureRate >= 20) { statusLabel = 'NEEDS PATCH'; statusClass = 'is-warning'; }
        else { statusLabel = 'STRONG'; statusClass = 'is-strong'; }
      }
      return { ...g, failureRate, accuracyRate, avgTime, statusLabel, statusClass };
    });
  }

  function renderChapterList() {
    const target = $('#tracker-chapter-list');
    if (!state.chapters.length) { target.innerHTML = '<p class="tracker-empty">No chapter folders found on disk.</p>'; return; }
    target.innerHTML = state.chapters.map((chapter) => {
      const ready = chapter.status === 'ready';
      const selectable = ready || chapter.status === 'ledger-error';
      const roots = chapter.rootMids?.length ? chapter.rootMids.join(' / ') : 'MID —';
      const selected = state.selectedFolder === chapter.folder;
      return `<button type="button" class="tracker-chapter-row ${selected ? 'is-selected' : ''} ${selectable ? '' : 'is-blocked'} ${chapter.status === 'ledger-error' ? 'is-ledger-error' : ''}" data-folder="${esc(chapter.folder)}" ${selectable ? '' : 'disabled'} aria-pressed="${selected}">
        <span class="tracker-chapter-row-top"><strong>${esc(chapter.name)}</strong><span class="tracker-mid-chip">${esc(roots)}</span></span>
        <small class="tracker-folder-path">/${esc(chapter.folder)}/</small>
        ${ready ? `<span class="tracker-chapter-row-stats"><b>${Number.isInteger(chapter.questionCount) ? chapter.questionCount : '—'}</b> questions <span>·</span> ${chapter.timingLocked ? 'timing locked' : 'timing not set'}</span>` : `<span class="tracker-folder-issue"><b>${esc(friendlyIssue(chapter.status))}</b><small>${esc(chapter.issue || '')}</small></span>`}
      </button>`;
    }).join('');
    target.querySelectorAll('.tracker-chapter-row:not(:disabled)').forEach((button) => button.addEventListener('click', () => void loadChapter(button.dataset.folder)));
  }

  function renderError(error) {
    const details = Array.isArray(error.details) && error.details.length
      ? `<ul>${error.details.map((item) => `<li><code>${esc(item.path || item.code || 'validation')}</code> — ${esc(item.message || JSON.stringify(item))}</li>`).join('')}</ul>`
      : '';
    $('#tracker-detail').innerHTML = `<section class="tracker-panel tracker-error"><span class="panel-index">LEDGER SAFETY CHECK</span><h2>Totals withheld</h2><p>${esc(error.message)}</p>${details}<p class="tracker-error-code">${esc(error.code || 'TRACKER_ERROR')}</p></section>`;
  }

  function timingMarkup(ledger) {
    const config = ledger.timingConfig || {};
    const locked = config.locked === true;
    const sandbox = state.sandboxActive;
    const canReset = !sandbox && (locked || Object.values(ledger.concepts || {}).some((questions) => Object.values(questions || {}).some((attempts) => attempts.length)));
    const saved = locked
      ? `<div class="tracker-locked-timing"><div><span>FAST</span><strong>${config.fastLimit}s</strong></div><div><span>MEDIUM</span><strong>${config.mediumLimit}s</strong></div><div><span>SLOW</span><strong>${config.slowLimit}s</strong></div><small>${sandbox ? 'Read-only snapshot of the permanent chapter limits.' : 'Locked for this chapter. Resetting permanent records is required to change the limits.'}</small></div>`
      : sandbox ? '<p class="tracker-form-note">Timing limits are not set on the permanent ledger. Return to the permanent view to configure and lock them before simulating attempts.</p>'
        : `<form id="tracker-timing-form" class="tracker-timing-form"><label>Fast limit (seconds)<input name="fastLimit" type="number" min="1" step="1" inputmode="numeric" required value="${esc(config.fastLimit ?? 30)}"></label><label>Medium limit (seconds)<input name="mediumLimit" type="number" min="1" step="1" inputmode="numeric" required value="${esc(config.mediumLimit ?? 60)}"></label><label>Slow limit (seconds)<input name="slowLimit" type="number" min="1" step="1" inputmode="numeric" required value="${esc(config.slowLimit ?? 120)}"></label><button class="button button-primary" type="submit">Save &amp; lock timing</button><p class="tracker-form-note">Positive whole seconds only · required order: Fast &lt; Medium &lt; Slow.</p></form>`;
    const resetControl = canReset ? '<button type="button" class="tracker-reset-link" id="tracker-reset-records">Reset PERMANENT chapter records &amp; re-enter timings</button>' : sandbox ? '<p class="tracker-form-note">Permanent timing and attempt records cannot be changed from the sandbox.</p>' : '<p class="tracker-form-note">Once saved, these thresholds stay fixed until the chapter ledger is reset.</p>';
    return `<section class="tracker-panel tracker-timing-panel"><div class="tracker-panel-head"><div><span class="panel-index">01 / ONE-TIME TIMING CONFIG</span><h2>Set the pace tiers</h2></div><span class="tracker-lock-state ${locked ? 'is-locked' : ''}">${locked ? 'LOCKED' : 'NOT SET'}</span></div>${saved}<div class="tracker-panel-feedback" id="tracker-timing-feedback" aria-live="polite"></div>${resetControl}</section>`;
  }

  function metricCards(metrics) {
    return `<div class="tracker-metric-grid">
      <article class="tracker-metric-card tracker-metric-primary"><span>TOTAL COMPLETION</span><strong>${percentage(metrics.completionPercent)}</strong><small>Lifetime marks ÷ maximum marks</small></article>
      <article class="tracker-metric-card"><span>MAXIMUM MARKS · MM</span><strong>${prettyNumber(metrics.MM)}</strong><small>${metrics.TQ} questions × 3</small></article>
      <article class="tracker-metric-card"><span>LIFETIME MARKS · LTM</span><strong>${prettyNumber(metrics.LTM)}</strong><small>Accuracy + time marks</small></article>
      <article class="tracker-metric-card"><span>AVAILABLE MARKS · AM</span><strong>${prettyNumber(metrics.AM)}</strong><small>Maximum marks − lifetime marks</small></article>
    </div>`;
  }

  function accuracyTable(metrics) {
    const rows = [
      ['NQC', 'Correct', metrics.NQC, '+1.00', metrics.NQC],
      ['NQW', 'Wrong', metrics.NQW, '−0.50', metrics.NQW * -0.5],
      ['NQS', 'Skipped', metrics.NQS, '−0.20', metrics.NQS * -0.2],
      ['NQNA', 'Not asked', metrics.NQNA, '0.00', 0]
    ];
    return `<section class="tracker-panel"><div class="tracker-panel-head"><div><span class="panel-index">03 / ACCURACY OVERVIEW</span><h2>Accuracy &amp; score deductions</h2></div><span class="tracker-panel-total">ARMNT</span></div><div class="tracker-table-wrap"><table class="tracker-table"><thead><tr><th>STATE</th><th>QUESTIONS</th><th>MARK EACH</th><th>MARKS</th></tr></thead><tbody>${rows.map(([code, label, count, each, total]) => `<tr><th scope="row"><code>${code}</code> ${label}</th><td>${count}</td><td>${each}</td><td>${prettyNumber(total)}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="3">ACCURACY REAL MARKS NET TOTAL · ARMNT</th><td>${prettyNumber(metrics.ARMNT)}</td></tr></tfoot></table></div></section>`;
  }

  function timeTable(metrics, config) {
    const tiers = [
      ['NQF', 'Fast correct', metrics.NQF, '+2.00', metrics.NQF * 2, `≤ ${config.fastLimit ?? '—'}s`],
      ['NQM', 'Medium correct', metrics.NQM, '+1.00', metrics.NQM, `${Number(config.fastLimit || 0) + 1}s–${config.mediumLimit ?? '—'}s`],
      ['NQSl', 'Slow correct', metrics.NQSl, '+0.50', metrics.NQSl * 0.5, `${Number(config.mediumLimit || 0) + 1}s–${config.slowLimit ?? '—'}s`],
      ['NQOT', 'Overtime correct', metrics.NQOT, '0.00', 0, `> ${config.slowLimit ?? '—'}s`],
      ['—', 'Wrong / skipped / not asked', metrics.NQW + metrics.NQS + metrics.NQNA, '0.00', 0, 'No time marks']
    ];
    return `<section class="tracker-panel"><div class="tracker-panel-head"><div><span class="panel-index">04 / SPEED TIERS</span><h2>Time performance</h2></div><span class="tracker-panel-total">NTM</span></div><div class="tracker-table-wrap"><table class="tracker-table"><thead><tr><th>STATE</th><th>COUNT</th><th>TIME BAND</th><th>MARKS</th></tr></thead><tbody>${tiers.map(([code, label, count, each, total, band]) => `<tr><th scope="row"><code>${code}</code> ${label}<small class="tracker-tier-mark">${each} each</small></th><td>${count}</td><td>${band}</td><td>${prettyNumber(total)}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="3">NET TIME MARKS · NTM</th><td>${prettyNumber(metrics.NTM)}</td></tr></tfoot></table></div></section>`;
  }

  function synthesisCard(metrics, invariants) {
    const status = invariants.every((item) => item.passed);
    return `<section class="tracker-panel tracker-synthesis"><div class="tracker-panel-head"><div><span class="panel-index">05 / FINAL SYNTHESIS</span><h2>Formula verification</h2></div><span class="tracker-invariant-state ${status ? 'is-valid' : 'is-invalid'}">${status ? 'ALL INVARIANTS PASS' : 'INVARIANT FAILURE'}</span></div><div class="tracker-formula-grid"><div><span>LIFETIME MARKS</span><strong>${prettyNumber(metrics.LTM)} = ${prettyNumber(metrics.ARMNT)} + ${prettyNumber(metrics.NTM)}</strong><small>LTM = ARMNT + NTM</small></div><div><span>COMPLETION</span><strong>${percentage(metrics.completionPercent)}</strong><small>${metrics.MM ? `${prettyNumber(metrics.LTM)} ÷ ${prettyNumber(metrics.MM)} × 100` : 'No questions in this pool'}</small></div><div><span>POOL COUNTS</span><strong>${metrics.TQ} questions · ${metrics.NQC} correct · ${metrics.NQW} wrong · ${metrics.NQS} skipped · ${metrics.NQNA} not asked</strong><small>Latest attempt only; older attempts remain preserved.</small></div></div><details class="tracker-invariants"><summary>Show validation invariants</summary><ol>${invariants.map((item) => `<li class="${item.passed ? 'is-valid' : 'is-invalid'}"><span>${esc(item.expression)}</span><b>${item.passed ? 'PASS' : 'FAIL'}</b></li>`).join('')}</ol></details></section>`;
  }

  function testPanel() {
    const sandbox = state.sandboxActive;
    const ledger = currentLedger();
    const locked = ledger?.timingConfig?.locked === true;
    return `<section class="tracker-panel tracker-test-panel"><div class="tracker-panel-head"><div><span class="panel-index">06 / LEDGER TEST BAR</span><h2>Test the formulas safely</h2></div><span class="tracker-sandbox-chip ${sandbox ? 'is-active' : ''}">${sandbox ? 'SANDBOX · MEMORY ONLY' : 'PERMANENT LEDGER · READ ONLY'}</span></div><p class="tracker-test-copy">${sandbox ? 'Simulated questions and attempts are isolated in this browser session and never write to the chapter ledger.' : 'Page 1 does not change permanent attempts. Open a sandbox to simulate results without touching your saved records.'}</p><div class="tracker-test-actions">${sandbox ? `<button class="button button-quiet" type="button" id="tracker-sandbox-exit">Return to permanent ledger</button><button class="button button-quiet" type="button" id="tracker-sandbox-reset">Reset sandbox to clean skeleton</button>` : '<button class="button button-quiet" type="button" id="tracker-sandbox-open">Open isolated sandbox</button>'}<button class="button button-quiet" type="button" id="tracker-json-open">View / Copy Ledger JSON</button></div>${sandbox ? `<div class="tracker-sim-controls"><label>Correct-answer pace<select id="tracker-test-tier"><option value="fast">Fast</option><option value="medium">Medium</option><option value="slow">Slow</option><option value="overtime">Overtime</option></select></label><button type="button" class="tracker-sim-button" data-sim="correct" ${locked ? '' : 'disabled'}>＋ Test Correct</button><button type="button" class="tracker-sim-button" data-sim="wrong" ${locked ? '' : 'disabled'}>＋ Test Wrong</button><button type="button" class="tracker-sim-button" data-sim="skip" ${locked ? '' : 'disabled'}>＋ Skip</button><button type="button" class="tracker-sim-button" data-sim="unasked">＋ Add Unattempted Pool Q</button></div>${locked ? '' : '<p class="tracker-form-note">Lock valid timing limits before simulating attempted questions.</p>'}<p id="tracker-sandbox-feedback" class="tracker-panel-feedback" aria-live="polite"></p>` : ''}</section>`;
  }

  function renderPart2(ledger, chapter) {
    const conceptRows = calculateConceptBreakdown(ledger);
    const stepRows = calculateStepIdDiagnostics(ledger);
    return `
      <section class="tracker-panel">
        <div class="tracker-panel-head">
          <div>
            <span class="panel-index">PART 2A / CONCEPT MID BREAKDOWN</span>
            <h2>Subtopics &amp; Concept Nodes (${esc(chapter.rootMid)})</h2>
          </div>
          <span class="tracker-pool-total">${conceptRows.length} CONCEPTS</span>
        </div>
        <p class="tracker-form-note" style="margin-top:0;margin-bottom:12px">Click <strong>Study Mode ↗</strong> or <strong>Shallow Mode ↗</strong> on any concept row (or on its placeholder box in 03 Preview) to open Question Cards filtered strictly to that Concept MID.</p>
        <div class="tracker-table-wrap">
          <table class="tracker-table">
            <thead>
              <tr>
                <th>CONCEPT MID</th>
                <th>QUESTIONS</th>
                <th>CORRECT</th>
                <th>WRONG</th>
                <th>SKIPPED</th>
                <th>UNASKED</th>
                <th>LTM / MM</th>
                <th>COMPLETION</th>
                <th>SCOPED LAUNCH</th>
              </tr>
            </thead>
            <tbody>
              ${conceptRows.map((row) => `
                <tr>
                  <th scope="row"><code>${esc(row.fullMid)}</code></th>
                  <td>${row.TQ}</td>
                  <td>${row.NQC}</td>
                  <td>${row.NQW}</td>
                  <td>${row.NQS}</td>
                  <td>${row.NQNA}</td>
                  <td>${prettyNumber(row.LTM)} / ${prettyNumber(row.MM)}</td>
                  <td><strong>${percentage(row.completionPct)}</strong></td>
                  <td>
                    <div class="tracker-inline-actions">
                      <button type="button" class="tracker-mini-action is-study" data-jump-concept="${esc(row.conceptMid)}" data-jump-mode="study">Study Mode ↗</button>
                      <button type="button" class="tracker-mini-action is-shallow" data-jump-concept="${esc(row.conceptMid)}" data-jump-mode="shallow">Shallow Mode ↗</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="tracker-panel">
        <div class="tracker-panel-head">
          <div>
            <span class="panel-index">PART 2B / STEP-ID DIAGNOSTIC ENGINE (STEP 4 &amp; STEP 5 LOOP)</span>
            <h2>Micro-Concept &amp; Step-ID Weak Spot Diagnostics</h2>
          </div>
          <span class="tracker-pool-total">${stepRows.length} ACTIVE STEP IDs</span>
        </div>
        <p class="tracker-form-note" style="margin-top:0;margin-bottom:12px">Tracks performance across granular <code>&lt;step id = T1 | T2 | T3 | TG&gt;</code> tags inside your questions to pinpoint exact algebraic or conceptual failure steps.</p>
        <div class="tracker-table-wrap">
          <table class="tracker-table">
            <thead>
              <tr>
                <th>STEP ID</th>
                <th>QUESTIONS</th>
                <th>ATTEMPTED</th>
                <th>CORRECT</th>
                <th>WRONG / SKIP</th>
                <th>FAILURE RATE</th>
                <th>AVG TIME</th>
                <th>DIAGNOSTIC STATUS</th>
                <th>PATCH / DRILL</th>
              </tr>
            </thead>
            <tbody>
              ${stepRows.map((s) => `
                <tr>
                  <th scope="row"><code>${esc(s.stepId)}</code> <small style="display:block;color:var(--muted);font-size:9px">${esc(s.title)}</small></th>
                  <td>${s.total}</td>
                  <td>${s.attempted}</td>
                  <td>${s.correct}</td>
                  <td>${s.wrong} W · ${s.skipped} S</td>
                  <td><strong>${s.failureRate == null ? '—' : `${s.failureRate.toFixed(1)}%`}</strong></td>
                  <td>${s.avgTime == null ? '—' : `${s.avgTime.toFixed(1)}s`}</td>
                  <td><span class="tracker-step-badge ${s.statusClass}">${esc(s.statusLabel)}</span></td>
                  <td>
                    <div class="tracker-inline-actions">
                      <button type="button" class="tracker-mini-action is-study" data-jump-step="${esc(s.stepId)}" data-jump-mode="study">Drill Step ↗</button>
                      <button type="button" class="tracker-mini-action is-shallow" data-jump-step="${esc(s.stepId)}" data-jump-mode="shallow">Shallow Pass ↗</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderQuestionCardsTab(ledger, chapter) {
    const allQuestions = collectStructuredQuestions(ledger);
    const concepts = Object.keys(ledger.concepts || {});
    const stepIds = [...new Set(allQuestions.map((q) => q.stepId || 'UNTAGGED'))].sort();
    const filtered = allQuestions.filter((q) => {
      if (state.cardFilterConcept !== 'ALL' && q.conceptMid !== state.cardFilterConcept) return false;
      if (state.cardFilterStepId !== 'ALL' && (q.stepId || 'UNTAGGED') !== state.cardFilterStepId) return false;
      if (state.cardFilterStatus !== 'ALL' && q.status !== state.cardFilterStatus) return false;
      return true;
    });
    const isShallow = state.cardMode === 'shallow';
    const compileInline = window.MKML ? window.MKML.compileInline : (v) => esc(v);

    return `
      <section class="tracker-panel">
        <div class="tracker-panel-head">
          <div>
            <span class="panel-index">SCOPED QUESTION CARDS · ${isShallow ? 'SHALLOW MODE (FAST EXAM PASS)' : 'STUDY MODE (DEEP DIAGNOSTIC & REVEAL)'}</span>
            <h2>${state.cardFilterConcept === 'ALL' ? `All ${esc(chapter.name)} Questions` : `Scoped Concept: ${esc(chapter.rootMid)}.${esc(state.cardFilterConcept)}`} (${filtered.length} / ${allQuestions.length})</h2>
          </div>
          <div class="tracker-inline-actions">
            ${state.fromDiagramPlaceholder ? `<button type="button" class="button button-quiet" id="tracker-back-to-diagram" style="padding:7px 11px;font-size:10px">← Back to 03 Preview Graph</button>` : ''}
            <button type="button" class="tracker-mode-switch ${!isShallow ? 'is-active' : ''}" data-set-card-mode="study">Study Mode</button>
            <button type="button" class="tracker-mode-switch ${isShallow ? 'is-active' : ''}" data-set-card-mode="shallow">Shallow Mode</button>
          </div>
        </div>

        <div class="tracker-filter-bar">
          <label>CONCEPT MID (SUBTOPIC)
            <select id="tracker-filter-concept">
              <option value="ALL" ${state.cardFilterConcept === 'ALL' ? 'selected' : ''}>All Concepts (${allQuestions.length})</option>
              ${concepts.map((c) => `<option value="${esc(c)}" ${state.cardFilterConcept === c ? 'selected' : ''}>${esc(chapter.rootMid)}.${esc(c)} (${Object.keys(ledger.concepts[c] || {}).length} Qs)</option>`).join('')}
            </select>
          </label>
          <label>STEP ID (MICRO-CONCEPT)
            <select id="tracker-filter-step">
              <option value="ALL" ${state.cardFilterStepId === 'ALL' ? 'selected' : ''}>All Step IDs</option>
              ${stepIds.map((s) => `<option value="${esc(s)}" ${state.cardFilterStepId === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
            </select>
          </label>
          <label>LATEST STATUS
            <select id="tracker-filter-status">
              <option value="ALL" ${state.cardFilterStatus === 'ALL' ? 'selected' : ''}>All States</option>
              <option value="W" ${state.cardFilterStatus === 'W' ? 'selected' : ''}>Wrong (W)</option>
              <option value="S" ${state.cardFilterStatus === 'S' ? 'selected' : ''}>Skipped (S)</option>
              <option value="NA" ${state.cardFilterStatus === 'NA' ? 'selected' : ''}>Not Asked (NA)</option>
              <option value="C" ${state.cardFilterStatus === 'C' ? 'selected' : ''}>Correct (C)</option>
            </select>
          </label>
          ${isShallow ? `
            <div class="tracker-shallow-bar">
              <span>Answered: <strong>${Object.keys(state.shallowSelections).length} / ${filtered.length}</strong></span>
              <button type="button" class="button button-primary" id="tracker-shallow-submit" style="padding:8px 12px;font-size:10px">${state.shallowSubmitted ? 'Reset Shallow Pass' : 'Submit & Grade Shallow Pass'}</button>
            </div>
          ` : ''}
        </div>
      </section>

      <div class="tracker-cards-list" id="tracker-scoped-cards-list">
        ${filtered.length === 0 ? `<div class="tracker-empty-state"><h2>No questions match this filter</h2><p>Change the Concept MID, Step ID, or Status filter above to view questions.</p></div>` : filtered.map((q, idx) => {
          const letters = Object.keys(q.optionsMap).length ? Object.keys(q.optionsMap) : ['A', 'B', 'C', 'D'];
          const shallowPick = state.shallowSelections[q.id] || '';
          const showShallowResult = isShallow && state.shallowSubmitted;
          return `
            <article class="tracker-qcard" data-qid="${esc(q.id)}" data-answer="${esc(q.answer)}">
              <div class="tracker-qcard-top">
                <div class="tracker-qcard-badges">
                  <span class="tracker-qcard-num">#${idx + 1}</span>
                  <code class="tracker-qcard-id">${esc(q.id)}</code>
                  <span class="mkml-question-mid">${esc(q.fullMid)}</span>
                  <span class="mkml-question-type">${esc(q.type)}</span>
                  ${q.stepId ? `<span class="mkml-question-step">STEP · ${esc(q.stepId)}</span>` : '<span class="mkml-question-gap">NO STEP ID</span>'}
                </div>
                <div class="tracker-qcard-meta">
                  <label class="tracker-step-assign">Step ID:
                    <select class="tracker-step-select" data-step-qid="${esc(q.id)}">
                      <option value="" ${!q.stepId ? 'selected' : ''}>Untagged</option>
                      ${['T1', 'T2', 'T3', 'TG', 'MC1', 'MC2', 'MC3'].map((code) => `<option value="${code}" ${q.stepId === code ? 'selected' : ''}>${code}</option>`).join('')}
                    </select>
                  </label>
                  <span class="tracker-qcard-status is-${q.status.toLowerCase()}">
                    ${q.status === 'NA' ? 'NOT ASKED' : `LATEST: ${q.status} (${q.seconds}s · ${q.totalMark >= 0 ? '+' : ''}${q.totalMark.toFixed(2)})`}
                  </span>
                </div>
              </div>
              <div class="tracker-qcard-prompt">${compileInline(q.text)}</div>
              <div class="tracker-qcard-options">
                ${letters.map((letter) => {
                  const optText = q.optionsMap[letter] || '';
                  if (!optText) return '';
                  let cls = 'tracker-qcard-opt';
                  if (isShallow) {
                    if (shallowPick === letter) cls += ' is-selected';
                    if (showShallowResult) {
                      if (letter === q.answer) cls += ' is-correct';
                      else if (shallowPick === letter && letter !== q.answer) cls += ' is-incorrect';
                    }
                  }
                  return `<button type="button" class="${cls}" data-qopt="${esc(letter)}" data-qid="${esc(q.id)}"><span class="option-letter">${esc(letter)}</span><span>${compileInline(optText)}</span></button>`;
                }).join('')}
              </div>
              <div class="tracker-qcard-footer">
                ${!isShallow ? `<button type="button" class="tracker-mini-action" data-reveal-q="${esc(q.id)}">Reveal Answer &amp; Explanation</button>` : ''}
                <span class="tracker-qcard-feedback" id="qfeedback-${esc(q.id)}">
                  ${showShallowResult ? (shallowPick ? (shallowPick === q.answer ? '✓ CORRECT' : `✗ WRONG (Answer: ${q.answer})`) : `SKIPPED (Answer: ${q.answer})`) : ''}
                </span>
              </div>
              <div class="tracker-qcard-explanation ${showShallowResult ? 'is-open' : ''}" id="qexp-${esc(q.id)}">
                <strong>Correct Answer: ${esc(q.answer)}</strong>
                ${q.explanation ? `<div style="margin-top:6px">${window.MKML ? window.MKML.compile(q.explanation) : compileInline(q.explanation)}</div>` : '<p style="margin:4px 0 0">No written explanation attached to this card yet.</p>'}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTestDiagnosticTab(ledger, chapter) {
    const allQuestions = collectStructuredQuestions(ledger);
    const session = state.testSession;
    const compileInline = window.MKML ? window.MKML.compileInline : (v) => esc(v);

    if (!session) {
      const stepRows = calculateStepIdDiagnostics(ledger);
      return `
        <section class="tracker-panel">
          <div class="tracker-panel-head">
            <div>
              <span class="panel-index">STEP 4 &amp; STEP 5 / TIMED TEST &amp; STEP-ID PATCH LOOP</span>
              <h2>Run Timed Diagnostic Set on ${esc(chapter.name)} (${esc(chapter.rootMid)})</h2>
            </div>
            <span class="tracker-pool-total">${allQuestions.length} POOL QUESTIONS</span>
          </div>
          <p class="tracker-form-note" style="margin-top:0;margin-bottom:14px">Run a random or concept-focused test set. Every answer records its exact duration against your chapter timing tiers, updates <code>tracker-ledger.json</code>, and diagnoses weak <code>&lt;step id&gt;</code> steps.</p>
          <div class="tracker-filter-bar">
            <label>SCOPE
              <select id="test-launch-concept">
                <option value="ALL">All Concepts (${allQuestions.length} Qs)</option>
                ${Object.keys(ledger.concepts || {}).map((c) => `<option value="${esc(c)}">${esc(chapter.rootMid)}.${esc(c)} (${Object.keys(ledger.concepts[c] || {}).length} Qs)</option>`).join('')}
              </select>
            </label>
            <label>STEP ID FOCUS
              <select id="test-launch-step">
                <option value="ALL">All Step IDs</option>
                ${stepRows.map((s) => `<option value="${esc(s.stepId)}">${esc(s.stepId)} (${s.total} Qs)</option>`).join('')}
              </select>
            </label>
            <label>SET SIZE
              <select id="test-launch-count">
                <option value="5">5 Questions (Quick Sprint)</option>
                <option value="10" selected>10 Questions (Standard Set)</option>
                <option value="25">All Available Questions</option>
              </select>
            </label>
            <div style="display:flex;align-items:flex-end">
              <button type="button" class="button button-primary" id="tracker-start-test" ${allQuestions.length ? '' : 'disabled'}>Start Timed Diagnostic Test ↗</button>
            </div>
          </div>
        </section>
      `;
    }

    if (session.submitted) {
      const total = session.questions.length;
      let correct = 0, wrong = 0, skipped = 0;
      const byStep = {};
      session.questions.forEach((q) => {
        const pick = session.answers[q.id] || '-';
        const st = pick === '-' ? 'S' : (pick === q.answer ? 'C' : 'W');
        if (st === 'C') correct++;
        else if (st === 'W') wrong++;
        else skipped++;
        const stepKey = q.stepId || 'UNTAGGED';
        byStep[stepKey] ||= { total: 0, correct: 0, wrong: 0, skipped: 0 };
        byStep[stepKey].total++;
        if (st === 'C') byStep[stepKey].correct++;
        else if (st === 'W') byStep[stepKey].wrong++;
        else byStep[stepKey].skipped++;
      });

      return `
        <section class="tracker-panel">
          <div class="tracker-panel-head">
            <div>
              <span class="panel-index">POST-TEST STEP-ID DIAGNOSTIC REPORT</span>
              <h2>Test Complete · ${correct} Correct / ${wrong} Wrong / ${skipped} Skipped</h2>
            </div>
            <button type="button" class="button button-quiet" id="tracker-reset-test">Run Another Test Set</button>
          </div>
          <div class="tracker-table-wrap" style="margin-top:12px">
            <table class="tracker-table">
              <thead>
                <tr>
                  <th>STEP ID</th>
                  <th>TESTED</th>
                  <th>CORRECT</th>
                  <th>WRONG</th>
                  <th>SKIPPED</th>
                  <th>FAILURE RATE</th>
                  <th>RECOMMENDED ACTION</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(byStep).map(([stepKey, s]) => {
                  const failPct = ((s.wrong + s.skipped) / s.total) * 100;
                  return `
                    <tr>
                      <th scope="row"><code>${esc(stepKey)}</code></th>
                      <td>${s.total}</td>
                      <td>${s.correct}</td>
                      <td>${s.wrong}</td>
                      <td>${s.skipped}</td>
                      <td><strong>${failPct.toFixed(1)}%</strong></td>
                      <td>
                        <button type="button" class="tracker-mini-action is-study" data-jump-step="${esc(stepKey)}" data-jump-mode="study">Patch ${esc(stepKey)} in Study Mode ↗</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>
      `;
    }

    const currentQ = session.questions[session.index];
    const letters = Object.keys(currentQ.optionsMap).length ? Object.keys(currentQ.optionsMap) : ['A', 'B', 'C', 'D'];
    const currentPick = session.answers[currentQ.id] || '';

    return `
      <section class="tracker-panel">
        <div class="tracker-panel-head">
          <div>
            <span class="panel-index">ACTIVE DIAGNOSTIC TEST · QUESTION ${session.index + 1} OF ${session.questions.length}</span>
            <h2>${esc(currentQ.id)} · ${esc(currentQ.fullMid)} ${currentQ.stepId ? `· STEP ${esc(currentQ.stepId)}` : ''}</h2>
          </div>
          <div class="tracker-inline-actions">
            <button type="button" class="button button-quiet" id="tracker-cancel-test" style="padding:7px 10px;font-size:10px">Cancel Test</button>
            <button type="button" class="button button-primary" id="tracker-submit-test" style="padding:7px 12px;font-size:10px">Submit &amp; Save to Ledger</button>
          </div>
        </div>
        <div class="tracker-qcard-prompt" style="font-size:15px;margin:14px 0">${compileInline(currentQ.text)}</div>
        <div class="tracker-qcard-options">
          ${letters.map((letter) => {
            const optText = currentQ.optionsMap[letter] || '';
            if (!optText) return '';
            return `<button type="button" class="tracker-qcard-opt ${currentPick === letter ? 'is-selected' : ''}" data-test-opt="${esc(letter)}"><span class="option-letter">${esc(letter)}</span><span>${compileInline(optText)}</span></button>`;
          }).join('')}
        </div>
        <div class="tracker-test-actions" style="margin-top:16px;justify-content:space-between">
          <button type="button" class="button button-quiet" id="tracker-test-prev" ${session.index === 0 ? 'disabled' : ''}>← Previous</button>
          <button type="button" class="button button-quiet" id="tracker-test-skip">Skip Question</button>
          <button type="button" class="button button-primary" id="tracker-test-next">${session.index + 1 < session.questions.length ? 'Next Question →' : 'Finish & Submit Test ✓'}</button>
        </div>
      </section>
    `;
  }

  function renderExamRegistryTab() {
    const readyChapters = state.chapters.filter((c) => c.status === 'ready');
    const rows = readyChapters.map((c) => {
      const weights = state.examWeightsByMid[c.rootMid] || { domain: 'General Competitive', cgl: 7.0, chsl: 7.0, cpo: 7.0, cds: 7.0, cat: 4.0 };
      const avgWeight = (weights.cgl + weights.chsl + weights.cpo + weights.cds + weights.cat) / 5;
      const completion = Number.isFinite(c.completionPercent) ? Math.max(0, Math.min(100, c.completionPercent)) : 0;
      const deficit = (100 - completion) / 100;
      const trp = avgWeight * deficit;
      return { ...c, weights, avgWeight, completion, trp };
    }).sort((a, b) => b.trp - a.trp);

    return `
      <section class="tracker-panel">
        <div class="tracker-panel-head">
          <div>
            <span class="panel-index">STEP 1 &amp; STEP 3 WORKFLOW / EXAM REGISTRY &amp; TRP CALCULATOR</span>
            <h2>Multi-Exam Chapter Weightages &amp; Target Readiness Priority (TRP)</h2>
          </div>
          <span class="tracker-pool-total">${rows.length} REGISTERED CHAPTERS</span>
        </div>
        <p class="tracker-form-note" style="margin-top:0;margin-bottom:12px">TRP = Average Exam Weightage × (1 − Chapter Completion). Higher TRP indicates the highest mark-yield chapter to study or patch next.</p>
        <div class="tracker-table-wrap">
          <table class="tracker-table">
            <thead>
              <tr>
                <th>CHAPTER (ROOT MID)</th>
                <th>DOMAIN</th>
                <th>POOL Qs</th>
                <th>SSC CGL %</th>
                <th>SSC CHSL %</th>
                <th>SSC CPO %</th>
                <th>CDS %</th>
                <th>COMPLETION</th>
                <th>TRP SCORE</th>
                <th>OPEN</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r) => `
                <tr>
                  <th scope="row"><code>${esc(r.rootMid)}</code> ${esc(r.name)}</th>
                  <td style="text-align:left">${esc(r.weights.domain)}</td>
                  <td>${r.questionCount ?? 0}</td>
                  <td>${r.weights.cgl.toFixed(1)}%</td>
                  <td>${r.weights.chsl.toFixed(1)}%</td>
                  <td>${r.weights.cpo.toFixed(1)}%</td>
                  <td>${r.weights.cds.toFixed(1)}%</td>
                  <td><strong>${r.completionPercent == null ? '0.00%' : `${r.completionPercent.toFixed(2)}%`}</strong></td>
                  <td><span class="tracker-step-badge ${r.trp >= 8 ? 'is-critical' : r.trp >= 5 ? 'is-warning' : 'is-strong'}">${r.trp.toFixed(2)} TRP</span></td>
                  <td><button type="button" class="tracker-mini-action is-study" data-registry-open="${esc(r.folder)}">Inspect ↗</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderDetail() {
    const record = state.record;
    if (!record) return;
    const ledger = currentLedger();
    const calculated = Engine.calculateMetrics(ledger);
    if (!calculated.ok) { renderError({ code: 'LEDGER_VALIDATION_FAILED', message: 'The ledger did not pass validation, so no totals are displayed.', details: calculated.errors }); return; }
    const { metrics, invariants } = calculated;
    const chapter = record.chapter;
    const conceptRows = Object.entries(ledger.concepts || {}).map(([concept, questions]) => `<span><b>${esc(concept)}</b> ${Object.keys(questions).length}</span>`).join('') || '<span>No concept wrappers found</span>';
    const mode = state.sandboxActive ? '<span class="tracker-mode-warning">SANDBOX DATA — NOT SAVED</span>' : '';
    const warnings = record.warnings?.length ? `<details class="tracker-pool-warnings"><summary>${record.warnings.length} question-pool notice${record.warnings.length === 1 ? '' : 's'}</summary><ul>${record.warnings.slice(0, 20).map((warning) => `<li>${esc(warning.file)} — ${esc(warning.message)}</li>`).join('')}</ul></details>` : '';

    const tabsNav = `
      <nav class="tracker-subtabs" aria-label="Tracker multi-page workflow">
        <button type="button" class="tracker-subtab ${state.activeTab === 'part1' ? 'is-active' : ''}" data-tracker-tab="part1"><span>01</span> Part 1: Topic Overview</button>
        <button type="button" class="tracker-subtab ${state.activeTab === 'part2' ? 'is-active' : ''}" data-tracker-tab="part2"><span>02</span> Part 2: Concept &amp; Step-ID Breakdown</button>
        <button type="button" class="tracker-subtab ${state.activeTab === 'cards' ? 'is-active' : ''}" data-tracker-tab="cards"><span>03</span> Question Cards (${state.cardMode === 'shallow' ? 'Shallow' : 'Study'})</button>
        <button type="button" class="tracker-subtab ${state.activeTab === 'test' ? 'is-active' : ''}" data-tracker-tab="test"><span>04</span> Test &amp; Step-ID Loop</button>
        <button type="button" class="tracker-subtab ${state.activeTab === 'registry' ? 'is-active' : ''}" data-tracker-tab="registry"><span>05</span> Exam Registry &amp; TRP</button>
      </nav>
    `;

    let tabBody = '';
    if (state.activeTab === 'part1') {
      tabBody = `
        ${warnings}
        ${timingMarkup(ledger)}
        <section class="tracker-panel tracker-concepts-panel"><div class="tracker-panel-head"><div><span class="panel-index">02 / POOL SCOPE</span><h2>Questions grouped by concept MID</h2></div><span class="tracker-pool-total">${metrics.TQ} TOTAL</span></div><div class="tracker-concept-chips">${conceptRows}</div><p class="tracker-form-note">IDs are permanent and monotonic: <code>${esc(chapter.rootMid)}-CN1-q11</code> is the generated form for Concept C1, question 11. Deleted IDs are not reassigned.</p></section>
        ${metricCards(metrics)}
        <div class="tracker-breakdown-grid">${accuracyTable(metrics)}${timeTable(metrics, ledger.timingConfig || {})}</div>
        ${synthesisCard(metrics, invariants)}
        ${testPanel()}
      `;
    } else if (state.activeTab === 'part2') {
      tabBody = renderPart2(ledger, chapter);
    } else if (state.activeTab === 'cards') {
      tabBody = renderQuestionCardsTab(ledger, chapter);
    } else if (state.activeTab === 'test') {
      tabBody = renderTestDiagnosticTab(ledger, chapter);
    } else if (state.activeTab === 'registry') {
      tabBody = renderExamRegistryTab();
    }

    $('#tracker-detail').innerHTML = `
      <div class="tracker-selected-header">
        <div>
          <p class="kicker">/ TOPIC OVERVIEW &amp; DIAGNOSTIC SUITE</p>
          <div class="tracker-selected-title"><h2>${esc(chapter.name)}</h2><span class="tracker-root-badge">${esc(chapter.rootMid)}</span>${mode}</div>
          <p>Latest evaluation: <strong>${esc(dateLabel(ledger.lastUpdated))}</strong></p>
        </div>
        <div class="tracker-header-stats"><span>${metrics.TQ} UNIQUE QUESTIONS</span><span>${Object.keys(ledger.concepts || {}).length} CONCEPT MIDs</span></div>
      </div>
      ${tabsNav}
      ${tabBody}
    `;

    if (window.MKML && typeof window.MKML.renderMath === 'function') {
      window.MKML.renderMath($('#tracker-detail'));
    }
    bindDetailEvents(chapter);
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function cleanSandboxFrom(ledger) {
    const sandbox = clone(ledger);
    for (const questions of Object.values(sandbox.concepts || {})) for (const id of Object.keys(questions || {})) questions[id] = [];
    if (sandbox.identity) sandbox.identity.retiredAttemptsByConcept = {};
    sandbox.lastUpdated = null;
    return sandbox;
  }
  function getSandbox() {
    let sandbox = state.sandboxByFolder.get(state.selectedFolder);
    if (!sandbox) {
      sandbox = clone(state.record.ledger);
      state.sandboxByFolder.set(state.selectedFolder, sandbox);
    }
    return sandbox;
  }
  function addSandboxQuestion(attempt) {
    const sandbox = getSandbox();
    const conceptMid = Object.keys(sandbox.concepts || {}).find((key) => key !== 'UN') || Object.keys(sandbox.concepts || {})[0] || 'C1';
    sandbox.concepts[conceptMid] ||= {};
    const sequence = (state.sandboxSequence.get(state.selectedFolder) || 0) + 1;
    state.sandboxSequence.set(state.selectedFolder, sequence);
    const id = `TEST-${sandbox.chapterMid}-${Engine.conceptToken(conceptMid)}-q${sequence}`;
    sandbox.concepts[conceptMid][id] = attempt ? [attempt] : [];
    sandbox.questionMeta ||= {};
    sandbox.questionMeta[id] = { conceptMid, type: 'SANDBOX TEST', text: 'Synthetic sandbox question; not part of the authored pool.', active: true, sandbox: true };
    sandbox.lastUpdated = attempt ? new Date().toISOString() : sandbox.lastUpdated;
    return id;
  }
  function testAttempt(status, tier) {
    const sandbox = getSandbox();
    const config = sandbox.timingConfig;
    if (!config?.locked) return;
    const seconds = status !== 'C' ? 1 : ({ fast: config.fastLimit, medium: config.fastLimit + 1, slow: config.mediumLimit + 1, overtime: config.slowLimit + 1 })[tier];
    const accuracy = Engine.ACCURACY[status];
    const time = Engine.expectedTimeMark(status, seconds, config);
    const selected = status === 'S' ? '-' : status === 'C' ? 'A' : 'B';
    addSandboxQuestion([status, seconds, accuracy, time, selected]);
    renderDetail();
    $('#tracker-sandbox-feedback').textContent = `${status === 'C' ? `Correct · ${tier} (${seconds}s)` : status === 'W' ? `Wrong (${seconds}s)` : 'Skipped'} added to sandbox only.`;
  }

  function bindDetailEvents(chapter) {
    $('#tracker-detail').querySelectorAll('[data-tracker-tab]').forEach((btn) => btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.trackerTab;
      renderDetail();
    }));

    $('#tracker-detail').querySelectorAll('[data-jump-concept]').forEach((btn) => btn.addEventListener('click', () => {
      state.cardFilterConcept = btn.dataset.jumpConcept || 'ALL';
      state.cardFilterStepId = 'ALL';
      state.cardFilterStatus = 'ALL';
      state.cardMode = btn.dataset.jumpMode === 'shallow' ? 'shallow' : 'study';
      state.shallowSelections = {};
      state.shallowSubmitted = false;
      state.activeTab = 'cards';
      renderDetail();
    }));

    $('#tracker-detail').querySelectorAll('[data-jump-step]').forEach((btn) => btn.addEventListener('click', () => {
      state.cardFilterConcept = 'ALL';
      state.cardFilterStepId = btn.dataset.jumpStep || 'ALL';
      state.cardFilterStatus = 'ALL';
      state.cardMode = btn.dataset.jumpMode === 'shallow' ? 'shallow' : 'study';
      state.shallowSelections = {};
      state.shallowSubmitted = false;
      state.activeTab = 'cards';
      renderDetail();
    }));

    $('#tracker-detail').querySelectorAll('[data-registry-open]').forEach((btn) => btn.addEventListener('click', () => {
      const targetFolder = btn.dataset.registryOpen;
      state.activeTab = 'part1';
      void loadChapter(targetFolder);
    }));

    $('#tracker-back-to-diagram')?.addEventListener('click', () => {
      const previewBtn = document.querySelector('.nav-item[data-page="preview"]');
      if (previewBtn) previewBtn.click();
    });

    $('#tracker-detail').querySelectorAll('[data-set-card-mode]').forEach((btn) => btn.addEventListener('click', () => {
      state.cardMode = btn.dataset.setCardMode === 'shallow' ? 'shallow' : 'study';
      state.shallowSelections = {};
      state.shallowSubmitted = false;
      state.shallowStartTime = Date.now();
      renderDetail();
    }));

    $('#tracker-filter-concept')?.addEventListener('change', (e) => {
      state.cardFilterConcept = e.currentTarget.value;
      renderDetail();
    });
    $('#tracker-filter-step')?.addEventListener('change', (e) => {
      state.cardFilterStepId = e.currentTarget.value;
      renderDetail();
    });
    $('#tracker-filter-status')?.addEventListener('change', (e) => {
      state.cardFilterStatus = e.currentTarget.value;
      renderDetail();
    });

    $('#tracker-detail').querySelectorAll('[data-step-qid]').forEach((sel) => sel.addEventListener('change', async (e) => {
      const questionId = e.currentTarget.dataset.stepQid;
      const stepId = e.currentTarget.value;
      try {
        const res = await api(`/api/tracker/${encodeURIComponent(chapter.folder)}/question-meta`, {
          method: 'PUT',
          body: JSON.stringify({ questionId, stepId })
        });
        if (state.record && res.ledger) state.record.ledger = res.ledger;
        renderDetail();
      } catch (err) {
        console.warn('Could not save stepId:', err);
      }
    }));

    $('#tracker-detail').querySelectorAll('[data-reveal-q]').forEach((btn) => btn.addEventListener('click', () => {
      const qid = btn.dataset.revealQ;
      const exp = document.getElementById(`qexp-${qid}`);
      if (exp) exp.classList.toggle('is-open');
    }));

    $('#tracker-detail').querySelectorAll('[data-qopt]').forEach((btn) => btn.addEventListener('click', async () => {
      const qid = btn.dataset.qid;
      const pick = btn.dataset.qopt;
      const card = btn.closest('.tracker-qcard');
      const answer = card?.dataset.answer || 'A';

      if (state.cardMode === 'shallow') {
        if (state.shallowSubmitted) return;
        if (!state.shallowStartTime) state.shallowStartTime = Date.now();
        state.shallowSelections[qid] = pick;
        renderDetail();
        return;
      }

      // Study Mode: immediate evaluation & reveal
      card.querySelectorAll('.tracker-qcard-opt').forEach((opt) => {
        opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
        if (opt.dataset.qopt === answer) opt.classList.add('is-correct');
        if (opt.dataset.qopt === pick) {
          opt.classList.add('is-selected');
          if (pick !== answer) opt.classList.add('is-incorrect');
        }
      });
      const exp = document.getElementById(`qexp-${qid}`);
      if (exp) exp.classList.add('is-open');
      const fb = document.getElementById(`qfeedback-${qid}`);
      const isCorrect = pick === answer;
      if (fb) fb.textContent = isCorrect ? '✓ CORRECT — Logging to permanent ledger…' : `✗ NOT QUITE — Correct Answer: ${answer} (Logging…)`;

      try {
        const res = await api(`/api/tracker/${encodeURIComponent(chapter.folder)}/attempt`, {
          method: 'POST',
          body: JSON.stringify({
            questionId: qid,
            status: isCorrect ? 'C' : 'W',
            seconds: isCorrect ? 25 : 40,
            selectedOption: pick,
            autoLockTiming: true
          })
        });
        if (state.record && res.ledger) {
          state.record.ledger = res.ledger;
          state.record.metrics = res.metrics;
        }
        if (fb) fb.textContent = isCorrect ? '✓ CORRECT — Saved to ledger.' : `✗ WRONG (Answer: ${answer}) — Saved to ledger.`;
      } catch (err) {
        if (fb) fb.textContent = isCorrect ? '✓ CORRECT' : `✗ Answer: ${answer}`;
      }
    }));

    $('#tracker-shallow-submit')?.addEventListener('click', async () => {
      if (state.shallowSubmitted) {
        state.shallowSelections = {};
        state.shallowSubmitted = false;
        state.shallowStartTime = null;
        renderDetail();
        return;
      }
      state.shallowSubmitted = true;
      const cards = [...$('#tracker-detail').querySelectorAll('.tracker-qcard')];
      const elapsedTotal = state.shallowStartTime ? Math.max(cards.length, Math.round((Date.now() - state.shallowStartTime) / 1000)) : cards.length * 20;
      const perCardSec = Math.max(1, Math.round(elapsedTotal / Math.max(1, cards.length)));
      for (const card of cards) {
        const qid = card.dataset.qid;
        const answer = card.dataset.answer || 'A';
        const pick = state.shallowSelections[qid] || '-';
        const status = pick === '-' ? 'S' : (pick === answer ? 'C' : 'W');
        try {
          const res = await api(`/api/tracker/${encodeURIComponent(chapter.folder)}/attempt`, {
            method: 'POST',
            body: JSON.stringify({
              questionId: qid,
              status,
              seconds: perCardSec,
              selectedOption: pick,
              autoLockTiming: true
            })
          });
          if (state.record && res.ledger) {
            state.record.ledger = res.ledger;
            state.record.metrics = res.metrics;
          }
        } catch (_) {}
      }
      renderDetail();
    });

    // Timed Diagnostic Test events
    $('#tracker-start-test')?.addEventListener('click', () => {
      const conceptFilter = $('#test-launch-concept')?.value || 'ALL';
      const stepFilter = $('#test-launch-step')?.value || 'ALL';
      const maxCount = Number($('#test-launch-count')?.value || 10);
      const ledger = currentLedger();
      let pool = collectStructuredQuestions(ledger);
      if (conceptFilter !== 'ALL') pool = pool.filter((q) => q.conceptMid === conceptFilter);
      if (stepFilter !== 'ALL') pool = pool.filter((q) => (q.stepId || 'UNTAGGED') === stepFilter);
      if (!pool.length) return;
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, maxCount);
      state.testSession = {
        questions: shuffled,
        index: 0,
        answers: {},
        durations: {},
        questionStartAt: Date.now(),
        submitted: false
      };
      renderDetail();
    });

    $('#tracker-detail').querySelectorAll('[data-test-opt]').forEach((btn) => btn.addEventListener('click', () => {
      const s = state.testSession;
      if (!s || s.submitted) return;
      const q = s.questions[s.index];
      s.answers[q.id] = btn.dataset.testOpt;
      renderDetail();
    }));

    const recordCurrentTestQuestionTime = () => {
      const s = state.testSession;
      if (!s) return;
      const q = s.questions[s.index];
      const delta = Math.max(1, Math.round((Date.now() - (s.questionStartAt || Date.now())) / 1000));
      s.durations[q.id] = (s.durations[q.id] || 0) + delta;
      s.questionStartAt = Date.now();
    };

    $('#tracker-test-prev')?.addEventListener('click', () => {
      const s = state.testSession;
      if (!s || s.index <= 0) return;
      recordCurrentTestQuestionTime();
      s.index -= 1;
      renderDetail();
    });

    $('#tracker-test-skip')?.addEventListener('click', () => {
      const s = state.testSession;
      if (!s) return;
      recordCurrentTestQuestionTime();
      const q = s.questions[s.index];
      s.answers[q.id] = '-';
      if (s.index + 1 < s.questions.length) {
        s.index += 1;
        renderDetail();
      } else {
        $('#tracker-submit-test')?.click();
      }
    });

    $('#tracker-test-next')?.addEventListener('click', () => {
      const s = state.testSession;
      if (!s) return;
      recordCurrentTestQuestionTime();
      if (s.index + 1 < s.questions.length) {
        s.index += 1;
        renderDetail();
      } else {
        $('#tracker-submit-test')?.click();
      }
    });

    $('#tracker-cancel-test')?.addEventListener('click', () => {
      state.testSession = null;
      renderDetail();
    });

    $('#tracker-reset-test')?.addEventListener('click', () => {
      state.testSession = null;
      renderDetail();
    });

    $('#tracker-submit-test')?.addEventListener('click', async () => {
      const s = state.testSession;
      if (!s || s.submitted) return;
      recordCurrentTestQuestionTime();
      s.submitted = true;
      for (const q of s.questions) {
        const pick = s.answers[q.id] || '-';
        const status = pick === '-' ? 'S' : (pick === q.answer ? 'C' : 'W');
        const seconds = Math.max(1, s.durations[q.id] || 20);
        try {
          const res = await api(`/api/tracker/${encodeURIComponent(chapter.folder)}/attempt`, {
            method: 'POST',
            body: JSON.stringify({
              questionId: q.id,
              status,
              seconds,
              selectedOption: pick,
              autoLockTiming: true
            })
          });
          if (state.record && res.ledger) {
            state.record.ledger = res.ledger;
            state.record.metrics = res.metrics;
          }
        } catch (_) {}
      }
      renderDetail();
    });

    $('#tracker-timing-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const timingConfig = Object.fromEntries(['fastLimit', 'mediumLimit', 'slowLimit'].map((key) => [key, Number(form.get(key))]));
      const validation = Engine.timingConfigErrors({ locked: true, ...timingConfig });
      if (validation.length) { $('#tracker-timing-feedback').textContent = validation.map((item) => item.message).join(' '); return; }
      try {
        $('#tracker-timing-feedback').textContent = 'Saving and locking timing limits…';
        await api(`/api/tracker/${encodeURIComponent(chapter.folder)}/timing`, { method: 'PUT', body: JSON.stringify(timingConfig) });
        state.sandboxByFolder.delete(chapter.folder); state.sandboxActive = false;
        await refreshTracker(chapter.folder);
      } catch (error) { $('#tracker-timing-feedback').textContent = error.message; }
    });
    $('#tracker-reset-records')?.addEventListener('click', async () => {
      const questionCount = countQuestions(state.record.ledger);
      const accepted = window.confirm(`Delete previous attempts and unlock timing for ${chapter.name} (${chapter.rootMid})? The ${questionCount} question IDs and pool will be preserved. This cannot be undone.`);
      if (!accepted) return;
      try {
        await api(`/api/tracker/${encodeURIComponent(chapter.folder)}/reset`, { method: 'POST', body: JSON.stringify({ confirm: true }) });
        state.sandboxByFolder.delete(chapter.folder); state.sandboxActive = false;
        await refreshTracker(chapter.folder);
      } catch (error) { renderError(error); }
    });
    $('#tracker-sandbox-open')?.addEventListener('click', () => { getSandbox(); state.sandboxActive = true; renderDetail(); });
    $('#tracker-sandbox-exit')?.addEventListener('click', () => { state.sandboxActive = false; renderDetail(); });
    $('#tracker-sandbox-reset')?.addEventListener('click', () => {
      state.sandboxByFolder.set(chapter.folder, cleanSandboxFrom(state.record.ledger));
      state.sandboxSequence.set(chapter.folder, 0);
      renderDetail();
      const feedback = $('#tracker-sandbox-feedback'); if (feedback) feedback.textContent = 'Sandbox reset to the current question pool with empty attempts. Permanent data was not changed.';
    });
    $('#tracker-detail').querySelectorAll('[data-sim]').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.sim === 'unasked') {
        const id = addSandboxQuestion(null);
        renderDetail();
        const feedback = $('#tracker-sandbox-feedback'); if (feedback) feedback.textContent = `${id} added as Not Asked in this sandbox only.`;
      } else {
        const status = button.dataset.sim === 'correct' ? 'C' : button.dataset.sim === 'wrong' ? 'W' : 'S';
        testAttempt(status, $('#tracker-test-tier')?.value || 'fast');
      }
    }));
    $('#tracker-json-open')?.addEventListener('click', openJsonInspector);
  }

  async function loadChapter(folder) {
    if (state.busy) return;
    const requestId = ++state.selectionRequest;
    state.selectedFolder = folder; state.record = null; state.sandboxActive = false; renderChapterList();
    $('#tracker-detail').innerHTML = '<div class="tracker-empty-state"><span class="placeholder-number">…</span><h2>Syncing question pool</h2><p>Checking local notes and permanent question IDs.</p></div>';
    try {
      const record = await api(`/api/tracker/${encodeURIComponent(folder)}`);
      if (requestId !== state.selectionRequest) return;
      state.record = record;
      if (state.sandboxByFolder.has(folder)) state.sandboxActive = false;
      renderChapterList(); renderDetail();
    } catch (error) { if (requestId === state.selectionRequest) renderError(error); }
  }

  async function refreshTracker(preferredFolder = state.selectedFolder) {
    if (state.busy) return;
    state.busy = true;
    const requestId = ++state.selectionRequest;
    $('#tracker-chapter-list').innerHTML = '<p class="tracker-empty">Scanning folders and syncing question IDs…</p>';
    try {
      const result = await api('/api/tracker');
      state.chapters = result.chapters || [];
      const available = state.chapters.filter((chapter) => chapter.status === 'ready');
      const preferred = available.find((chapter) => chapter.folder === preferredFolder);
      const trigDefault = available.find((chapter) => chapter.rootMid === 'TRG');
      const next = preferred || trigDefault || available[0];
      state.selectedFolder = next?.folder || '';
      renderChapterList();
      if (next) {
        const record = await api(`/api/tracker/${encodeURIComponent(next.folder)}`);
        if (requestId !== state.selectionRequest) return;
        state.record = record;
        renderChapterList(); renderDetail();
      } else {
        if (requestId !== state.selectionRequest) return;
        state.record = null;
        $('#tracker-detail').innerHTML = `<div class="tracker-empty-state"><span class="placeholder-number">01</span><h2>No safe chapter tracker available</h2><p>Folders with missing, conflicting, or duplicated root MIDs are shown at left. Resolve those MIDs in the chapter files before a collision-free question ledger can be created.</p></div>`;
      }
    } catch (error) { if (requestId === state.selectionRequest) { $('#tracker-chapter-list').innerHTML = `<p class="tracker-empty tracker-load-error">${esc(error.message)}</p>`; renderError(error); } }
    finally { state.busy = false; }
  }

  window.openTrackerScopedQuestions = async ({ folder, conceptMid, mode }) => {
    state.activeTab = 'cards';
    state.cardFilterConcept = conceptMid && conceptMid !== 'ALL' ? conceptMid : 'ALL';
    state.cardFilterStepId = 'ALL';
    state.cardFilterStatus = 'ALL';
    state.cardMode = mode === 'shallow' ? 'shallow' : 'study';
    state.fromDiagramPlaceholder = true;
    state.shallowSelections = {};
    state.shallowSubmitted = false;
    state.shallowStartTime = Date.now();
    await refreshTracker(folder);
  };

  function openJsonInspector() {
    const ledger = currentLedger();
    if (!ledger) return;
    $('#tracker-json-text').value = JSON.stringify(ledger, null, 2);
    $('#tracker-json-status').textContent = state.sandboxActive ? 'Sandbox JSON · memory only' : 'Read-only view of the saved local ledger.';
    const dialog = $('#tracker-json-dialog');
    if (!dialog.open) dialog.showModal();
  }
  $('#tracker-refresh').addEventListener('click', () => void refreshTracker());
  $('#tracker-json-close').addEventListener('click', () => $('#tracker-json-dialog').close());
  $('#tracker-json-copy').addEventListener('click', async () => {
    const text = $('#tracker-json-text').value;
    try { await navigator.clipboard.writeText(text); $('#tracker-json-status').textContent = 'Copied to clipboard.'; }
    catch (_) { $('#tracker-json-text').focus(); $('#tracker-json-text').select(); $('#tracker-json-status').textContent = 'Select the JSON above and copy it manually.'; }
  });
  window.refreshTracker = refreshTracker;
  if (window.location.hash === '#tracker') void refreshTracker();
})();
