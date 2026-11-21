const state = { page: 'folders', chapters: [], selectedFolder: null, files: [], activeFile: null, activeContent: '', activeHtmlFile: null, activeHtmlContent: '', isDirty: false, saveTimer: null, gridOn: true, creationType: null, previewRevision: 0, previewZoom: 1, previewRows: 70, previewCols: 75, previewCellWidth: 0, flowBoxObserver: null, canvasPan: false, panPointer: null, diagramQuestionGroups: [], diagramReturnScroll: null, questionIndex: null, questionRoot: '', dryRun: null };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const formatName = (value) => value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2400); }
function renderTrackerBundleFallback(reason) {
  const root = $('#tracker-root');
  if (!root || window.__ANGLES_TRACKER_MOUNTED__) return;
  const detail = escapeHtml(reason || window.__ANGLES_TRACKER_ERROR__ || 'The Pages 08-10 bundle (/tracker-suite.js) did not finish loading.');
  root.innerHTML = `<div style="max-width:740px;margin:28px auto;padding:24px;background:#fff;border:1px solid #fecaca;border-radius:10px;color:#171817;font-family:var(--sans)">
    <div style="font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.08em;color:#dc2626;margin-bottom:8px">PAGES 08–10 BUNDLE NOT LOADED</div>
    <h2 style="margin:0 0 8px;font-size:21px;letter-spacing:-.02em">Tracker, Exam Info &amp; Registry could not start</h2>
    <p style="margin:0 0 12px;font-size:13px;color:#57534e;line-height:1.6">${detail}</p>
    <p style="margin:0 0 16px;font-size:12px;color:#57534e;line-height:1.6">On Windows, close the terminal window and re-run <code>Angles-ultimate\\start-windows.bat</code> (it now verifies and builds <code>public\\tracker-suite.js</code> automatically), or run <code>npm run build:tracker</code> in the repo root and refresh.</p>
    <button type="button" class="button button-primary" onclick="window.location.reload()">Retry / Reload</button>
  </div>`;
}
window.__anglesTrackerLoadFailed = (reason) => {
  window.__ANGLES_TRACKER_ERROR__ = reason || 'Failed to load /tracker-suite.js';
  renderTrackerBundleFallback(window.__ANGLES_TRACKER_ERROR__);
};

function setPage(page) {
  const previousPage = state.page;
  if (previousPage === 'coding' && page !== 'coding' && state.isDirty) void flushSave();
  state.page = page;
  const routeTarget = (page === 'exam-info' || page === 'registry') ? 'tracker' : page;
  $$('.page').forEach((section) => section.classList.toggle('is-visible', section.dataset.route === routeTarget));
  $$('.nav-item').forEach((button) => button.classList.toggle('is-active', button.dataset.page === page));
  const diskDetails = $('#tracker-disk-ledger-details');
  if (diskDetails) diskDetails.classList.toggle('is-hidden', page !== 'tracker');
  if (page === 'folders' && previousPage !== 'folders') void loadChapters();
  if (page === 'preview' && previousPage !== 'diagram-questions') renderPreview();
  if (page === 'settings') renderSettingsStorage();
  if (page === 'question-index' && window.refreshQuestionIndex) void window.refreshQuestionIndex();
  if (routeTarget === 'tracker' && window.refreshTracker) void window.refreshTracker(state.selectedFolder);
  if (page === 'tracker' && window.openTrackerSection && !state._openingScopedCards) window.openTrackerSection('part-1');
  if (page === 'exam-info' && window.openTrackerSection) window.openTrackerSection('exam-page-1');
  if (page === 'registry' && window.openTrackerSection) window.openTrackerSection('registry');
  if (routeTarget === 'tracker' && !window.__ANGLES_TRACKER_MOUNTED__) {
    setTimeout(() => {
      if (!window.__ANGLES_TRACKER_MOUNTED__) renderTrackerBundleFallback(window.__ANGLES_TRACKER_ERROR__);
    }, 350);
  }
  window.history.replaceState({}, '', page === 'folders' ? '/' : `/#${page}`);
}

function renderFolders() {
  const grid = $('#chapter-grid'); $('#folder-empty').classList.toggle('is-hidden', state.chapters.length > 0);
  $('#chapter-total').textContent = state.chapters.length; $('#note-total').textContent = state.chapters.reduce((total, chapter) => total + chapter.htmlCount, 0);
  grid.innerHTML = state.chapters.map((chapter, index) => `<article class="chapter-card" data-folder="${escapeHtml(chapter.folder)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(chapter.name)} chapter"><div class="chapter-card-top"><span class="chapter-number">${String(index + 1).padStart(2, '0')}</span><span class="chapter-arrow">↗</span></div><div><h2 class="chapter-name">${escapeHtml(chapter.name)}</h2><span class="chapter-slug">/${escapeHtml(chapter.folder)}/</span></div><div class="chapter-meta"><strong>${chapter.htmlCount}</strong> ${chapter.htmlCount === 1 ? 'HTML note' : 'HTML notes'}<span>·</span><span>${chapter.cssCount || 0} CSS</span></div></article>`).join('');
  $$('.chapter-card').forEach((card) => { const open = () => openChapter(card.dataset.folder); card.addEventListener('click', open); card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } }); });
}
async function loadChapters() {
  try {
    state.chapters = (await api('/api/chapters')).chapters;
    renderFolders();
    if (!state.selectedFolder && state.chapters.length > 0) {
      const preferred = state.chapters.find((c) => /trig/i.test(c.folder)) || state.chapters[0];
      if (preferred) {
        state.selectedFolder = preferred.folder;
        await loadFiles(preferred.folder);
        const firstHtml = state.files.find((f) => f.type === 'html' && !/unmapped/i.test(f.name)) || state.files.find((f) => f.type === 'html');
        if (firstHtml) {
          await openFile(firstHtml.name);
          if (state.page === 'preview') renderPreview();
        }
      }
    }
  } catch (error) { showToast(error.message); }
}
function setSaveStatus(text, mode = '') { const status = $('#save-status'); status.className = `save-status ${mode ? `is-${mode}` : ''}`; status.innerHTML = `<span class="status-dot"></span> ${text}`; }
function updateEditorMeta() { $('#editor-chapter-breadcrumb').textContent = state.selectedFolder ? formatName(state.selectedFolder) : 'Chapter'; $('#editor-file-name').textContent = state.activeFile || 'Select a file'; $('#char-count').textContent = `${state.activeContent.length.toLocaleString()} characters`; $('#line-numbers').textContent = Array.from({ length: Math.max(1, state.activeContent.split('\n').length) }, (_, index) => index + 1).join('\n'); }

function renderFileList() {
  $('#file-list').innerHTML = state.files.map((file) => {
    const isArmed = armedDeleteFile === file.name;
    return `<div class="file-item ${file.name === state.activeFile ? 'is-active' : ''} ${file.type === 'css' ? 'is-css' : ''}" data-file="${escapeHtml(file.name)}"><span class="file-icon">${file.type === 'css' ? '◈' : '◇'}</span><button class="file-open" type="button">${escapeHtml(file.name)}</button><span class="file-actions"><button class="file-action file-rename" type="button" title="Rename">✎</button><button class="file-action file-delete ${isArmed ? 'is-armed' : ''}" type="button" title="${isArmed ? 'Click again to confirm permanent delete' : 'Delete file + its questions & marks'}" style="${isArmed ? 'background:#DC2626;color:#fff;padding:0 6px;border-radius:4px;font-size:10px;font-weight:700;' : ''}">${isArmed ? 'Sure?' : '×'}</button></span></div>`;
  }).join('');
  $$('.file-open').forEach((button) => button.addEventListener('click', () => openFile(button.closest('.file-item').dataset.file)));
  $$('.file-rename').forEach((button) => button.addEventListener('click', () => renameFile(button.closest('.file-item').dataset.file)));
  $$('.file-delete').forEach((button) => button.addEventListener('click', () => deleteFile(button.closest('.file-item').dataset.file)));
}
async function loadFiles(folder) { const result = await api(`/api/chapters/${encodeURIComponent(folder)}/files`); state.files = result.files; $('#sidebar-chapter-name').textContent = formatName(folder); renderFileList(); }
async function openChapter(folder) { await flushSave(); state.selectedFolder = folder; state.activeFile = null; state.activeHtmlFile = null; state.activeHtmlContent = ''; await loadFiles(folder); const firstFile = state.files.find((file) => file.type === 'html') || state.files[0]; if (firstFile) await openFile(firstFile.name); setPage('coding'); }
const STUDIO_NOTE_DRAFTS_KEY = 'angles_note_drafts_v1';
const STUDIO_STORAGE_ENABLED_KEY = 'angles_local_storage_enabled_v1';

function isLocalDraftsEnabled() {
  try {
    const raw = window.localStorage.getItem(STUDIO_STORAGE_ENABLED_KEY);
    return raw === null ? true : raw !== 'false';
  } catch { return false; }
}
function readNoteDrafts() {
  try {
    const raw = window.localStorage.getItem(STUDIO_NOTE_DRAFTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function writeNoteDraft(folder, file, content) {
  if (!isLocalDraftsEnabled() || !folder || !file) return;
  try {
    const drafts = readNoteDrafts();
    drafts[`${folder}/${file}`] = { content, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(STUDIO_NOTE_DRAFTS_KEY, JSON.stringify(drafts));
    window.dispatchEvent(new CustomEvent('angles:storage-updated'));
  } catch { /* ignore quota errors */ }
}
function removeNoteDraft(key) {
  try {
    const drafts = readNoteDrafts();
    delete drafts[key];
    window.localStorage.setItem(STUDIO_NOTE_DRAFTS_KEY, JSON.stringify(drafts));
    window.dispatchEvent(new CustomEvent('angles:storage-updated'));
  } catch { /* ignore */ }
}
function renderSettingsStorage() {
  const toggle = $('#ls-autosave-toggle');
  const pill = $('#ls-status-pill');
  const enabled = window.anglesStorage ? window.anglesStorage.isEnabled() : isLocalDraftsEnabled();
  if (toggle) toggle.checked = enabled;
  if (pill) pill.textContent = enabled ? 'AUTO-SAVE ON' : 'AUTO-SAVE OFF';
  const summary = window.anglesStorage ? window.anglesStorage.getSummary() : {
    enabled, savedAt: null, trackerBytes: 0, draftBytes: 0, chapterCount: 0, attemptCount: 0, examCount: 0, draftCount: 0, draftKeys: []
  };
  if ($('#ls-stat-chapters')) $('#ls-stat-chapters').textContent = String(summary.chapterCount);
  if ($('#ls-stat-attempts')) $('#ls-stat-attempts').textContent = String(summary.attemptCount);
  if ($('#ls-stat-exams')) $('#ls-stat-exams').textContent = String(summary.examCount);
  if ($('#ls-stat-drafts')) $('#ls-stat-drafts').textContent = String(summary.draftCount);
  const totalKb = ((summary.trackerBytes + summary.draftBytes) / 1024).toFixed(1);
  if ($('#ls-stat-size')) $('#ls-stat-size').textContent = `${totalKb} KB`;
  if ($('#ls-stat-saved')) {
    $('#ls-stat-saved').textContent = summary.savedAt
      ? new Date(summary.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'Not saved yet';
  }
  const list = $('#ls-draft-list');
  if (!list) return;
  const drafts = readNoteDrafts();
  const keys = Object.keys(drafts);
  if (!keys.length) {
    list.innerHTML = '<p class="settings-empty">No local note drafts cached yet.</p>';
    return;
  }
  list.innerHTML = keys.map((key) => {
    const item = drafts[key] || {};
    const chars = String(item.content || '').length.toLocaleString();
    const when = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '';
    return `<div class="settings-draft-row" data-draft-key="${escapeHtml(key)}"><div><strong>${escapeHtml(key)}</strong><small>${chars} chars · ${escapeHtml(when)}</small></div><div class="settings-draft-btns"><button type="button" class="mini-button ls-open-draft">Open</button><button type="button" class="mini-button ls-drop-draft">Discard</button></div></div>`;
  }).join('');
  list.querySelectorAll('.ls-open-draft').forEach((btn) => btn.addEventListener('click', async () => {
    const key = btn.closest('.settings-draft-row')?.dataset.draftKey || '';
    const [folder, ...rest] = key.split('/');
    const file = rest.join('/');
    if (!folder || !file) return;
    await openChapter(folder);
    await openFile(file);
    showToast(`Opened local draft ${file}`);
  }));
  list.querySelectorAll('.ls-drop-draft').forEach((btn) => btn.addEventListener('click', () => {
    const key = btn.closest('.settings-draft-row')?.dataset.draftKey || '';
    if (!key) return;
    removeNoteDraft(key);
    renderSettingsStorage();
    showToast(`Discarded local draft for ${key}`);
  }));
}

async function openFile(file) {
  if (!state.selectedFolder) return;
  await flushSave();
  try {
    setSaveStatus('Opening…', 'saving');
    const result = await api(`/api/chapters/${encodeURIComponent(state.selectedFolder)}/files/${encodeURIComponent(file)}`);
    const draftKey = `${state.selectedFolder}/${file}`;
    const localDraft = isLocalDraftsEnabled() ? readNoteDrafts()[draftKey] : null;
    const draftTs = localDraft?.updatedAt ? Date.parse(localDraft.updatedAt) : 0;
    const diskTs = result.updatedAt ? Date.parse(result.updatedAt) : 0;
    const useLocalDraft = Boolean(
      localDraft &&
      typeof localDraft.content === 'string' &&
      localDraft.content !== result.content &&
      draftTs > diskTs
    );
    if (localDraft && !useLocalDraft) removeNoteDraft(draftKey);
    const finalContent = useLocalDraft ? localDraft.content : result.content;
    state.activeFile = file;
    state.activeContent = finalContent;
    state.isDirty = useLocalDraft;
    if (file.endsWith('.html')) {
      state.activeHtmlFile = file;
      state.activeHtmlContent = finalContent;
    }
    $('#code-editor').value = finalContent;
    updateEditorMeta();
    await loadFiles(state.selectedFolder);
    setSaveStatus(useLocalDraft ? 'Restored unsaved local draft' : 'Saved to disk');
  } catch (error) {
    showToast(error.message);
    setSaveStatus('Could not open', 'dirty');
  }
}
async function saveCurrentFile(useKeepalive = false) {
  if (!state.selectedFolder || !state.activeFile) return;
  const folder = state.selectedFolder;
  const file = state.activeFile;
  const content = $('#code-editor').value;
  state.activeContent = content;
  if (file.endsWith('.html')) {
    state.activeHtmlFile = file;
    state.activeHtmlContent = content;
  }
  setSaveStatus('Saving…', 'saving');
  try {
    await api(`/api/chapters/${encodeURIComponent(folder)}/files/${encodeURIComponent(file)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
      keepalive: useKeepalive
    });
    state.isDirty = false;
    removeNoteDraft(`${folder}/${file}`);
    setSaveStatus('Saved to disk');
    window.dispatchEvent(new CustomEvent('angles:storage-updated', { detail: { source: 'coding', folder, file } }));
    if (file.endsWith('.html') && window.refreshQuestionIndex) void window.refreshQuestionIndex();
  } catch (error) {
    writeNoteDraft(folder, file, content);
    setSaveStatus(isLocalDraftsEnabled() ? 'Saved to browser LocalStorage (disk offline)' : 'Save failed', isLocalDraftsEnabled() ? '' : 'dirty');
    showToast(isLocalDraftsEnabled() ? 'Disk unavailable — saved in browser LocalStorage' : error.message);
  }
  updateEditorMeta();
}
function queueSave() {
  const val = $('#code-editor').value;
  state.activeContent = val;
  state.isDirty = true;
  if (state.activeFile?.endsWith('.html')) {
    state.activeHtmlFile = state.activeFile;
    state.activeHtmlContent = val;
  }
  updateEditorMeta();
  setSaveStatus('Unsaved changes', 'dirty');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => void saveCurrentFile(false), 500);
}
async function flushSave(useKeepalive = false) {
  clearTimeout(state.saveTimer);
  if (state.selectedFolder && state.activeFile && state.isDirty) {
    await saveCurrentFile(useKeepalive);
  }
}

function openCreator(type) { state.creationType = type; $('#inline-file-label').textContent = type === 'css' ? 'New Style.css' : 'New Topic.html'; $('#inline-file-input').value = ''; $('#inline-file-creator').classList.remove('is-hidden'); $('#inline-file-input').focus(); }
function closeCreator() { state.creationType = null; $('#inline-file-creator').classList.add('is-hidden'); }
async function submitCreator() { const input = $('#inline-file-input'); const name = input.value.trim(); if (!name || !state.selectedFolder) return; try { const result = await api(`/api/chapters/${encodeURIComponent(state.selectedFolder)}/files`, { method: 'POST', body: JSON.stringify({ name, type: state.creationType }) }); closeCreator(); await loadFiles(state.selectedFolder); await openFile(result.file); showToast(`${result.file} created on disk`); } catch (error) { showToast(error.message); } }
async function renameFile(file) { const base = file.replace(/\.(html|css)$/i, ''); const name = window.prompt(`Rename ${file}:`, base); if (!name || name === base) return; try { const result = await api(`/api/chapters/${encodeURIComponent(state.selectedFolder)}/files/${encodeURIComponent(file)}`, { method: 'PATCH', body: JSON.stringify({ name }) }); if (state.activeFile === file) state.activeFile = result.file; if (state.activeHtmlFile === file) state.activeHtmlFile = result.file; await loadFiles(state.selectedFolder); updateEditorMeta(); showToast(`${result.file} renamed`); } catch (error) { showToast(error.message); } }
let armedDeleteFile = '';
let armedDeleteTimer = null;

async function deleteFile(file) {
  if (armedDeleteFile !== file) {
    armedDeleteFile = file;
    clearTimeout(armedDeleteTimer);
    renderFileList();
    showToast(`Click × again within 4s to delete ${file} (also removes its questions & attempt history)`);
    armedDeleteTimer = setTimeout(() => {
      armedDeleteFile = '';
      renderFileList();
    }, 4000);
    return;
  }
  armedDeleteFile = '';
  clearTimeout(armedDeleteTimer);
  try {
    await flushSave();
    const folder = state.selectedFolder;
    const result = await api(`/api/chapters/${encodeURIComponent(folder)}/files/${encodeURIComponent(file)}`, { method: 'DELETE' });
    removeNoteDraft(`${folder}/${file}`);
    if (state.activeFile === file) { state.activeFile = null; state.activeContent = ''; state.isDirty = false; $('#code-editor').value = ''; }
    if (state.activeHtmlFile === file) { state.activeHtmlFile = null; state.activeHtmlContent = ''; }
    await loadFiles(folder);
    const next = state.files.find((item) => item.type === 'html') || state.files[0];
    if (next) await openFile(next.name); else updateEditorMeta();
    const purgedQs = Array.isArray(result.removedQuestionIds) ? result.removedQuestionIds.length : 0;
    showToast(purgedQs > 0 ? `${file} deleted · purged ${purgedQs} question(s) & marks` : `${file} deleted from disk`);
    if (window.refreshQuestionIndex) void window.refreshQuestionIndex();
    window.dispatchEvent(new CustomEvent('angles:file-deleted', {
      detail: {
        folder,
        file,
        removedQuestionIds: result.removedQuestionIds || [],
        removedConceptIds: result.removedConceptIds || [],
        ledgerRemoved: Boolean(result.ledgerRemoved)
      }
    }));
    window.dispatchEvent(new CustomEvent('angles:storage-updated', { detail: { source: 'file-delete', folder, file } }));
  } catch (error) { showToast(error.message); }
}

function insertSnippet(kind) {
  const snippets = {
    math: '<math == sin^2 theta + cos^2 theta = 1>',
    boxw: '<box w points = (4,4),(14,4),(14,8),(4,8)>Text sits centered on 25% bottom-parallel baseline</box w>',
    enclave: '<enclave points = (1,1),(14,1),(14,6),(1,6) background-color = #FFFFFF color = #CBD5E1></enclave>',
    lined: '<line d line-color = #2457FF text-color = #171817 floating = 2mm>(4,10),(14,10) Label 2mm above line</line d>',
    arc: '<arc m points = (4,12),(10,12) depth = 1 color = #D97706 floating = 2mm>θ</arc m>',
    table: '<table r = 2 c = 3>\n  <c11 = S.No> <c12 = Rule> <c13 = Example>\n  <c21 = 1> <c22 = Your rule> <c23 = Write an example.>\n</table>',
    question: '<Qn>\n  <target == QA-TRG-BS-FR>\n  <type = Quantitative Aptitude>\n  <text = Write the question here.>\n  <Options>\n    <A = Option one>\n    <B = Option two>\n  </Options>\n  <answer = B>\n  <explanation>\n    <step 1 - QA-TRG-BS-FR-MC1>\n      Apply the core micro-concept here.\n    </step 1>\n    <step 2 - TG>\n      Simplify to the final answer.\n    </step 2>\n  </explanation>\n</Qn>',
    tags: '<x = incorrect> <ok = corrected> <hide == reveal me>\n<rule == Add a grammar rule.>\n<trap == Add an exam trap.>\n<chain == Step one -> Step two -> Step three>',
    grid: '<grid id="spatial-note" class="spatial-card">\n  <h2>Spatial note</h2>\n  <p>Place this box on the graph sheet.</p>\n</grid>'
  };
  const editor = $('#code-editor'); const start = editor.selectionStart; const end = editor.selectionEnd;
  editor.setRangeText((start > 0 && editor.value[start - 1] !== '\n' ? '\n' : '') + (snippets[kind] || '') + '\n', start, end, 'end');
  editor.focus(); queueSave();
}
function compileAngles(source) { return window.MKML.compile(source); }

function setQuestionRlVisibility(card, visible) {
  card.querySelectorAll('.mkml-rl-target').forEach((item) => item.classList.toggle('is-rl-hidden', !visible));
}
function stopQuizTimer(group, clear = false) {
  if (group._quizTimerId) window.clearInterval(group._quizTimerId);
  group._quizTimerId = null;
  if (clear) {
    group._quizTimerStarted = null;
    const timer = group.querySelector('.quiz-group-timer');
    if (timer) { timer.textContent = ''; timer.hidden = true; }
  }
}
function startQuizTimer(group) {
  if (group._quizTimerStarted != null) return;
  group._quizTimerStarted = performance.now();
  const timer = group.querySelector('.quiz-group-timer');
  if (!timer) return;
  timer.hidden = false;
  const update = () => { timer.textContent = `Time: ${((performance.now() - group._quizTimerStarted) / 1000).toFixed(1)} s`; };
  update();
  group._quizTimerId = window.setInterval(update, 100);
}
function updateQuizProgress(group, submittedScore = null) {
  const cards = [...group.querySelectorAll('.question-card')];
  const answered = cards.filter((card) => Boolean(card.dataset.selected)).length;
  const progress = group.querySelector('.quiz-progress');
  if (!progress) return;
  progress.textContent = submittedScore == null
    ? `Answered ${answered} / ${cards.length}`
    : `Answered ${answered} / ${cards.length} · Score ${submittedScore} / ${cards.length}`;
}
function revealQuizCard(card) {
  const answer = card.dataset.answer;
  const selected = card.dataset.selected || '';
  const options = [...card.querySelectorAll('.answer-option')];
  options.forEach((option) => {
    option.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    option.disabled = true;
    if (option.dataset.answer === answer) option.classList.add('is-correct');
    if (selected && option.dataset.answer === selected) {
      option.classList.add('is-selected');
      if (selected !== answer) option.classList.add('is-incorrect');
    }
  });
  card.classList.add('is-revealed');
  card.dataset.locked = 'true';
  setQuestionRlVisibility(card, true);
  const explanation = card.querySelector('.explanation');
  if (explanation) explanation.hidden = false;
  const explainButton = card.querySelector('.quiz-explanation');
  if (explainButton) explainButton.hidden = true;
  const result = card.querySelector('.question-result');
  if (result) {
    result.textContent = selected
      ? (selected === answer ? 'CORRECT — KEEP THE RULE.' : `NOT QUITE — ANSWER: ${answer.toUpperCase()}`)
      : `ANSWER: ${answer.toUpperCase()}`;
  }
  return Boolean(selected && selected === answer);
}
function resetQuizGroup(group, mode) {
  stopQuizTimer(group, true);
  group.dataset.mode = mode;
  delete group.dataset.submitted;
  const toggle = group.querySelector('.quiz-mode-toggle');
  if (toggle) { toggle.textContent = `Mode: ${mode === 'exam' ? 'Exam' : 'Normal'}`; toggle.setAttribute('aria-pressed', String(mode === 'exam')); }
  const submit = group.querySelector('.quiz-group-submit');
  if (submit) { submit.hidden = mode !== 'exam'; submit.disabled = false; submit.textContent = 'Submit'; }
  group.querySelectorAll('.question-card').forEach((card) => {
    card.dataset.mode = mode;
    delete card.dataset.selected;
    delete card.dataset.locked;
    card.classList.remove('is-revealed', 'has-selection');
    card.querySelectorAll('.answer-option').forEach((option) => { option.disabled = false; option.classList.remove('is-selected', 'is-correct', 'is-incorrect'); });
    const explanation = card.querySelector('.explanation');
    if (explanation) explanation.hidden = true;
    const explainButton = card.querySelector('.quiz-explanation');
    if (explainButton) explainButton.hidden = mode !== 'exam';
    const result = card.querySelector('.question-result');
    if (result) result.textContent = '';
    setQuestionRlVisibility(card, false);
  });
  updateQuizProgress(group);
}
function bindQuizGroups(root) {
  root.querySelectorAll('.quiz-group').forEach((group) => {
    const initialMode = group.dataset.mode === 'exam' ? 'exam' : 'normal';
    resetQuizGroup(group, initialMode);
    group.querySelector('.quiz-mode-toggle')?.addEventListener('click', () => resetQuizGroup(group, group.dataset.mode === 'exam' ? 'normal' : 'exam'));
    group.querySelector('.quiz-group-submit')?.addEventListener('click', () => {
      if (group.dataset.mode !== 'exam' || group.dataset.submitted) return;
      const cards = [...group.querySelectorAll('.question-card')];
      const score = cards.reduce((total, card) => total + Number(revealQuizCard(card)), 0);
      group.dataset.submitted = 'true';
      stopQuizTimer(group);
      const submit = group.querySelector('.quiz-group-submit');
      if (submit) { submit.disabled = true; submit.textContent = 'Submitted'; }
      updateQuizProgress(group, score);
    });
    group.querySelectorAll('.quiz-explanation').forEach((button) => button.addEventListener('click', () => {
      const card = button.closest('.question-card');
      if (group.dataset.mode !== 'exam' || !card || card.dataset.locked) return;
      revealQuizCard(card);
    }));
    group.querySelectorAll('.answer-option').forEach((button) => button.addEventListener('click', () => {
      const card = button.closest('.question-card');
      if (!card || card.dataset.locked || group.dataset.submitted) return;
      card.dataset.selected = button.dataset.answer;
      card.querySelectorAll('.answer-option').forEach((option) => option.classList.toggle('is-selected', option === button));
      if (group.dataset.mode === 'normal') revealQuizCard(card);
      else startQuizTimer(group);
      updateQuizProgress(group);
    }));
  });
}
function buildScopedPlaceholderNode(scopedLabel, initialCount, index) {
  const thumbnail = document.createElement('div');
  thumbnail.className = 'mkml-qn-thumbnail mkml-qn-scoped-placeholder';
  thumbnail.setAttribute('role', 'group');
  thumbnail.setAttribute('aria-label', `${scopedLabel} question placeholder (${initialCount} ${initialCount === 1 ? 'question' : 'questions'})`);

  const topRow = document.createElement('div');
  topRow.className = 'mkml-qn-placeholder-head';
  const badge = document.createElement('span');
  badge.className = 'mkml-qn-concept-badge';
  badge.textContent = scopedLabel;
  const countWrap = document.createElement('span');
  countWrap.className = 'mkml-qn-count-wrap';
  const countText = document.createElement('strong');
  countText.textContent = String(initialCount);
  const label = document.createElement('span');
  label.textContent = ` ${initialCount === 1 ? 'question' : 'questions'}`;
  countWrap.append(countText, label);
  topRow.append(badge, countWrap);

  const actionsRow = document.createElement('div');
  actionsRow.className = 'mkml-qn-placeholder-actions';

  const studyBtn = document.createElement('button');
  studyBtn.type = 'button';
  studyBtn.className = 'mkml-qn-mode-btn is-study';
  studyBtn.textContent = 'Study Mode ↗';
  studyBtn.title = `Open ${scopedLabel} in Study Mode`;
  studyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    redirectToScopedQuestions(index, 'study');
  });

  const shallowBtn = document.createElement('button');
  shallowBtn.type = 'button';
  shallowBtn.className = 'mkml-qn-mode-btn is-shallow';
  shallowBtn.textContent = 'Shallow Mode ↗';
  shallowBtn.title = `Open ${scopedLabel} in Shallow Mode`;
  shallowBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    redirectToScopedQuestions(index, 'shallow');
  });

  actionsRow.append(studyBtn, shallowBtn);
  thumbnail.append(topRow, actionsRow);
  thumbnail.addEventListener('click', () => redirectToScopedQuestions(index, 'study'));
  return { thumbnail, countText, label };
}

function prepareDiagramQuestionThumbnails(root, revision = state.previewRevision) {
  state.diagramQuestionGroups = [];
  const previewSource = state.activeFile?.endsWith('.html') ? state.activeContent : state.activeHtmlContent;
  const chapterMatch = /<Chapter\s*==\s*([^,>]+)/i.exec(previewSource || '');
  const chapterParts = chapterMatch ? chapterMatch[1].trim().toUpperCase().split('-') : [];
  const chapterShortCode = chapterParts.length >= 2 ? chapterParts[1] : (chapterParts[0] || '');

  root.querySelectorAll('.mkml-flow-box').forEach((box) => {
    // 1. Modern 1-line portal box: <box points = ... path = QA-TRG-BS-FR></box>
    const pathHost = box.querySelector(':scope > .mkml-flow-box-content > .mkml-qn-path-host');
    if (pathHost) {
      const targetPath = (pathHost.dataset.questionPath || box.dataset.questionPath || '').trim();
      const parts = targetPath.split('-').filter(Boolean);
      const rootCode = parts.length >= 2 ? parts[1].toUpperCase() : chapterShortCode;
      const entry = {
        group: null,
        count: 0,
        rootMid: rootCode,
        conceptMid: targetPath || 'ALL',
        scopedLabel: targetPath || 'QUESTIONS',
        path: targetPath
      };
      const index = state.diagramQuestionGroups.push(entry) - 1;
      const { thumbnail, countText, label } = buildScopedPlaceholderNode(entry.scopedLabel, 0, index);
      pathHost.replaceWith(thumbnail);
      if (state.selectedFolder && targetPath) {
        api(`/api/chapters/${encodeURIComponent(state.selectedFolder)}/questions?path=${encodeURIComponent(targetPath)}`)
          .then((res) => {
            if (revision !== state.previewRevision) return;
            const cnt = Number(res.count) || 0;
            entry.count = cnt;
            countText.textContent = String(cnt);
            label.textContent = ` ${cnt === 1 ? 'question' : 'questions'}`;
            thumbnail.setAttribute('aria-label', `${entry.scopedLabel} question placeholder (${cnt} ${cnt === 1 ? 'question' : 'questions'})`);
            if (cnt > 0 && Array.isArray(res.questions)) {
              const temp = document.createElement('div');
              temp.innerHTML = compileAngles(`<qn all mode = normal>\n${res.questions.map((q) => q.block).join('\n')}\n</qn all>`);
              entry.group = temp.querySelector('.quiz-group');
            }
            fitFlowBoxes();
          })
          .catch(() => { /* keep 0 count if offline */ });
      }
      return;
    }

    // 2. Legacy inline <box><qn all>...</qn all></box>
    const groups = [...box.querySelectorAll('.mkml-flow-box-content .quiz-group')]
      .filter((group) => group.closest('.mkml-flow-box') === box);
    groups.forEach((group) => {
      const count = Number(group.dataset.questionCount) || group.querySelectorAll('.question-card').length;
      const conceptPath = (box.dataset.questionPath || box.dataset.conceptMid || '').trim();
      const scopedLabel = conceptPath || chapterShortCode || 'CONCEPT';
      const index = state.diagramQuestionGroups.push({
        group: group.cloneNode(true),
        count,
        rootMid: chapterShortCode,
        conceptMid: conceptPath || 'ALL',
        scopedLabel
      }) - 1;
      const { thumbnail } = buildScopedPlaceholderNode(scopedLabel, count, index);
      group.replaceWith(thumbnail);
    });
  });
}
function redirectToScopedQuestions(index, mode = 'study') {
  const entry = state.diagramQuestionGroups[index];
  if (!entry) return;
  const viewport = $('#preview-viewport');
  state.diagramReturnScroll = { left: viewport.scrollLeft, top: viewport.scrollTop };
  if ((typeof window.openTrackerScopedCards === 'function' || typeof window.openTrackerScopedQuestions === 'function') && state.selectedFolder) {
    state._openingScopedCards = true;
    setPage('tracker');
    state._openingScopedCards = false;
    if (typeof window.openTrackerScopedCards === 'function') {
      void window.openTrackerScopedCards({
        folder: state.selectedFolder,
        rootMid: entry.rootMid || '',
        conceptMid: entry.conceptMid || 'C1',
        mode: mode === 'shallow' ? 'shallow' : 'study'
      });
    }
    if (typeof window.openTrackerScopedQuestions === 'function') {
      void window.openTrackerScopedQuestions({
        folder: state.selectedFolder,
        conceptMid: entry.conceptMid || 'ALL',
        scopedLabel: entry.scopedLabel || '',
        mode: mode === 'shallow' ? 'shallow' : 'study'
      });
    }
    showToast(`Opened ${entry.scopedLabel} in ${mode === 'shallow' ? 'Shallow Mode' : 'Study Mode'}`);
    return;
  }
  openDiagramQuestionPage(index);
}
function openDiagramQuestionPage(index) {
  const entry = state.diagramQuestionGroups[index];
  if (!entry) return;
  const viewport = $('#preview-viewport');
  state.diagramReturnScroll = { left: viewport.scrollLeft, top: viewport.scrollTop };
  $('#diagram-question-title').textContent = `Question set ${index + 1}`;
  $('#diagram-question-count').textContent = `${entry.count} ${entry.count === 1 ? 'question' : 'questions'} in this diagram node.`;
  const list = $('#diagram-question-list');
  list.replaceChildren();
  if (entry.count === 0) {
    const empty = document.createElement('div');
    empty.className = 'diagram-question-empty';
    empty.textContent = 'This question placeholder is empty. Add <Qn>…</Qn> cards inside its <qn all> container in the note source.';
    list.append(empty);
  } else {
    const group = entry.group.cloneNode(true);
    list.append(group);
    window.MKML.renderMath(list);
    bindQuizGroups(list);
  }
  setPage('diagram-questions');
}
function returnToDiagram() {
  setPage('preview');
  const viewport = $('#preview-viewport');
  const position = state.diagramReturnScroll;
  requestAnimationFrame(() => {
    if (position) { viewport.scrollLeft = position.left; viewport.scrollTop = position.top; }
    renderVisibleGridLabels();
  });
}

async function loadChapterStyles(source, revision = state.previewRevision) {
  const cssFiles = state.files.filter((file) => file.type === 'css').map((file) => file.name);
  const linked = [...source.matchAll(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi)].map((match) => match[1].split('/').pop());
  const names = [...new Set([...cssFiles, ...linked].filter((name) => state.files.some((file) => file.type === 'css' && file.name === name)))];
  const contents = await Promise.all(names.map(async (name) => { try { return (await api(`/api/chapters/${encodeURIComponent(state.selectedFolder)}/files/${encodeURIComponent(name)}`)).content; } catch { return ''; } }));
  if (revision !== state.previewRevision) return;
  const requestedCssIds = [...new Set([...source.matchAll(/<link-css-id\s*:\s*([\w.-]+)\s*>|<link\s*=\s*([\w.-]+)\s*>/gi)].map((match) => match[1] || match[2]))];
  const availableCssIds = new Set(contents.flatMap((css) => [...String(css || '').matchAll(/<css-id\s*:\s*([\w.-]+)\s*>/gi)].map((match) => match[1])));
  const missingCssIds = requestedCssIds.filter((id) => !availableCssIds.has(id));
  if (missingCssIds.length) missingCssIds.forEach((id) => console.warn(`Warning: CSS ID ${id} not found. Rendering with default styles.`));
  else if (requestedCssIds.length) console.info(`[Angles] Linked CSS IDs: ${requestedCssIds.join(', ')}`);
  let linkedCssContent = '';
  try { linkedCssContent = window.MKML.linkedCss(contents, source); }
  catch (error) { console.warn('Warning: CSS ID resolution failed. Rendering with default styles.', error); }
  if (/<(?:qn\s+all|Qn\s*>|math\s*==|table\s+r\s*=|grid\s+)/i.test(linkedCssContent.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    showToast('Linked CSS contains MKML/HTML. Move that quiz or note markup into the HTML file; CSS IDs are matched.');
  }
  let compiledCss = '';
  try { compiledCss = window.MKML.compileCss(window.MKML.cleanCss(linkedCssContent)); }
  catch (error) { console.warn('Warning: Chapter CSS could not be compiled. Rendering with default styles.', error); }
  if (revision !== state.previewRevision) return;
  const old = document.getElementById('chapter-styles'); if (old) old.remove();
  let style = null;
  if (compiledCss.trim()) { style = document.createElement('style'); style.id = 'chapter-styles'; style.textContent = compiledCss; document.head.appendChild(style); }
  if (requestedCssIds.length) requestAnimationFrame(() => {
    const target = document.getElementById('lmk');
    let rules = [];
    try { rules = style?.sheet ? [...style.sheet.cssRules].filter((rule) => rule.selectorText?.split(',').some((selector) => selector.trim() === '#lmk')) : []; } catch (error) { console.warn('[Angles] CSS diagnostic could not inspect stylesheet rules.', error); }
    console.info('[Angles] CSS link verification', { ids: requestedCssIds, parsedLmkRules: rules.length, targetFound: Boolean(target), computedColor: target ? getComputedStyle(target).color : '(no #lmk element)' });
  });
  const requiredRows = [...compiledCss.matchAll(/--grid-required-row\s*:\s*(\d+)/g)].reduce((max, match) => Math.max(max, Number(match[1])), 35);
  const requiredCols = [...compiledCss.matchAll(/--grid-required-col\s*:\s*(\d+)/g)].reduce((max, match) => Math.max(max, Number(match[1])), 25);
  const gridBoxes = [...$('#preview-canvas').querySelectorAll('.grid-box')];
  const htmlRows = gridBoxes.reduce((max, node) => Math.max(max, Number(node.style.getPropertyValue('--grid-row') || 1) + Number(node.style.getPropertyValue('--grid-row-span') || 1) - 1), 35);
  const htmlCols = gridBoxes.reduce((max, node) => Math.max(max, Number(node.style.getPropertyValue('--grid-col') || 1) + Number(node.style.getPropertyValue('--grid-col-span') || 1) - 1), 25);
  const flowNodes = [...$('#preview-flow-lines-layer').querySelectorAll('[data-max-col], [data-max-row]'), ...$('#preview-flow-boxes-layer').querySelectorAll('[data-max-col], [data-max-row]'), ...$('#preview-flow-lines-m-layer').querySelectorAll('[data-max-col], [data-max-row]')];
  const flowRows = flowNodes.reduce((max, node) => Math.max(max, Number(node.dataset.maxRow) || 1), 35);
  const flowCols = flowNodes.reduce((max, node) => Math.max(max, Number(node.dataset.maxCol) || 1), 25);
  const rows = Math.max(requiredRows, htmlRows, flowRows);
  const cols = Math.max(requiredCols, htmlCols, flowCols, 25);
  const previewContent = $('#preview-content');
  previewContent.style.minHeight = `${rows * 32}px`;
  const contentRows = Math.max(rows, Math.ceil(previewContent.scrollHeight / 32));
  previewContent.style.minHeight = `${contentRows * 32}px`;
  updateGridExtent(contentRows, cols);
  requestAnimationFrame(fitFlowBoxes);
}
function renderPreview() {
  const revision = ++state.previewRevision;
  const previewFile = state.activeFile?.endsWith('.html') ? state.activeFile : state.activeHtmlFile;
  const previewSource = state.activeFile?.endsWith('.html') ? state.activeContent : state.activeHtmlContent;
  $('#preview-file-name').textContent = previewFile || 'your active file';
  $('#preview-chapter-name').textContent = state.selectedFolder ? formatName(state.selectedFolder) : 'no chapter';
  const content = $('#preview-content');
  state.flowBoxObserver?.disconnect();
  state.flowBoxObserver = null;
  $('#preview-canvas').querySelectorAll('.quiz-group').forEach((group) => stopQuizTimer(group, true));
  content.replaceChildren();
  $('#preview-flow-lines-layer').replaceChildren();
  $('#preview-flow-boxes-layer').replaceChildren();
  $('#preview-flow-lines-m-layer').replaceChildren();
  content.style.minHeight = '';
  updateGridExtent(35, 25);
  document.getElementById('chapter-styles')?.remove();
  if (!previewFile || !previewSource) {
    content.innerHTML = '<div class="preview-blank"><span class="preview-blank-mark">∠</span><p>Open an HTML note to see its compiled sheet.</p></div>';
    return;
  }
  try { content.innerHTML = compileAngles(previewSource); }
  catch (error) {
    console.error('Preview compilation failed; showing source as plain text.', error);
    const fallback = document.createElement('pre');
    fallback.className = 'preview-error-fallback';
    fallback.textContent = previewSource;
    content.replaceChildren(fallback);
    return;
  }
  window.MKML.renderMath(content);
  const flowLines = [...content.children].filter((node) => node.matches('.mkml-flow-lines'));
  $('#preview-flow-lines-layer').replaceChildren(...flowLines);
  const overFlowLines = [...content.children].filter((node) => node.matches('.mkml-flow-lines-m, .mkml-line-d-label, .mkml-arc-label'));
  $('#preview-flow-lines-m-layer').replaceChildren(...overFlowLines);
  window.MKML.renderMath($('#preview-flow-lines-m-layer'));
  const flowBoxes = [...content.querySelectorAll('.mkml-flow-box')];
  $('#preview-flow-boxes-layer').replaceChildren(...flowBoxes);
  window.MKML.renderMath($('#preview-flow-boxes-layer'));
  prepareDiagramQuestionThumbnails($('#preview-flow-boxes-layer'), revision);
  observeFlowBoxes($('#preview-flow-boxes-layer'));
  $$('.mkml-spoiler').forEach((item) => {
    const reveal = () => item.classList.toggle('revealed');
    item.addEventListener('click', reveal);
    item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reveal(); } });
  });
  void loadChapterStyles(previewSource, revision).catch((error) => console.warn('Warning: Chapter CSS could not be loaded. Rendering with default styles.', error));
  bindQuizGroups($('#preview-canvas'));
}

function setupGridLabels() { renderVisibleGridLabels(); }
function renderVisibleGridLabels() {
  const viewport = $('#preview-viewport');
  const columnLabels = $('#column-labels');
  const rowLabels = $('#row-labels');
  if (!viewport || !columnLabels || !rowLabels) return;
  const zoom = state.previewZoom || 1;
  const cell = state.previewCellWidth || (viewport.clientWidth ? viewport.clientWidth / 25 : 1);
  const visibleCols = Math.ceil((viewport.clientWidth || cell * 25) / (cell * zoom)) + 2;
  const firstCol = Math.max(1, Math.floor(viewport.scrollLeft / (cell * zoom)) + 1);
  const colCount = Math.max(0, Math.min(state.previewCols - firstCol + 1, visibleCols));
  columnLabels.style.left = `${(firstCol - 1) * cell}px`;
  columnLabels.style.top = `${viewport.scrollTop / zoom + 9}px`;
  columnLabels.style.right = 'auto';
  columnLabels.style.width = `${colCount * cell}px`;
  columnLabels.style.gridTemplateColumns = `repeat(${colCount}, ${cell}px)`;
  columnLabels.innerHTML = Array.from({ length: colCount }, (_item, index) => `<span>${firstCol + index}</span>`).join('');
  const visibleRows = Math.ceil((viewport.clientHeight || window.innerHeight) / (32 * zoom)) + 2;
  const firstRow = Math.max(1, Math.floor((viewport.scrollTop / zoom - 47) / 32) + 1);
  const rowCount = Math.max(0, Math.min(state.previewRows - firstRow + 1, visibleRows));
  rowLabels.style.top = `${47 + (firstRow - 1) * 32}px`;
  rowLabels.style.left = `${viewport.scrollLeft / zoom + 11}px`;
  rowLabels.style.gridTemplateRows = `repeat(${rowCount}, 32px)`;
  rowLabels.innerHTML = Array.from({ length: rowCount }, (_item, index) => `<span>${firstRow + index}</span>`).join('');
}
function updateGridExtent(rows = 70, cols = 75) {
  state.previewRows = Math.max(70, Number.isSafeInteger(Number(rows)) ? Number(rows) : 70);
  state.previewCols = Math.max(75, Number.isSafeInteger(Number(cols)) ? Number(cols) : 75);
  $('#preview-canvas')?.querySelectorAll('.mkml-flow-lines, .mkml-flow-lines-m').forEach((svg) => {
    const width = state.previewCols * 100;
    const height = state.previewRows * 32;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', String(height));
  });
  setupGridLabels();
  applyPreviewCanvasSize(false);
}
function extendGraphAtViewportEdge() {
  const viewport = $('#preview-viewport');
  if (!viewport || !viewport.clientWidth) return;
  const zoom = state.previewZoom || 1;
  const marginX = Math.max(4 * state.previewCellWidth * zoom, viewport.clientWidth * 0.15);
  const marginY = Math.max(4 * 32 * zoom, viewport.clientHeight * 0.15);
  let rows = state.previewRows;
  let cols = state.previewCols;
  if (viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - marginX) cols += 25;
  if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - marginY) rows += 35;
  if (rows !== state.previewRows || cols !== state.previewCols) updateGridExtent(rows, cols);
}
function applyPreviewCanvasSize(fitBoxes = true) {
  const viewport = $('#preview-viewport');
  const canvas = $('#preview-canvas');
  if (!viewport || !canvas || viewport.clientWidth <= 0) return;
  let availableWidth = viewport.clientWidth;
  let cell = availableWidth / 25;
  canvas.style.setProperty('--grid-column-count', String(state.previewCols));
  canvas.style.minHeight = `${Math.max(window.innerHeight - 204, state.previewRows * 32 + 69)}px`;
  canvas.style.zoom = String(state.previewZoom);
  availableWidth = viewport.clientWidth;
  cell = availableWidth / 25;
  state.previewCellWidth = cell;
  canvas.style.setProperty('--grid-cell-width', `${cell}px`);
  canvas.style.width = `${Math.max(availableWidth, cell * state.previewCols)}px`;
  renderVisibleGridLabels();
  if (fitBoxes) fitFlowBoxes();
}
function fitFlowBoxes() {
  const cell = state.previewCellWidth;
  const layer = $('#preview-flow-boxes-layer');
  if (!cell || !layer) return;
  let neededCols = state.previewCols;
  let neededRows = state.previewRows;
  layer.querySelectorAll('.mkml-flow-box').forEach((box) => {
    const content = box.querySelector(':scope > .mkml-flow-box-content');
    if (!content) return;
    const authoredWidth = (Number(box.dataset.gridWidth) || 1) * cell;
    const authoredHeight = (Number(box.dataset.gridHeight) || 1) * 32;
    const isBoxW = box.dataset.boxW === 'true';
    const isPortalBox = Boolean(box.dataset.questionPath);
    const width = isBoxW || isPortalBox ? authoredWidth : Math.max(authoredWidth, content.scrollWidth);
    const height = isBoxW || isPortalBox ? authoredHeight : Math.max(authoredHeight, content.scrollHeight);
    box.style.width = `${Math.ceil(width)}px`;
    box.style.height = `${Math.ceil(height)}px`;
    const minCol = Number(box.dataset.minCol) || 1;
    const minRow = Number(box.dataset.minRow) || 1;
    neededCols = Math.max(neededCols, Math.ceil(minCol - 1 + width / cell) + 1);
    neededRows = Math.max(neededRows, minRow - 1 + Math.ceil(height / 32) + 1);
  });
  if (neededCols > state.previewCols || neededRows > state.previewRows) updateGridExtent(neededRows, neededCols);
}
function observeFlowBoxes(root) {
  state.flowBoxObserver?.disconnect();
  state.flowBoxObserver = window.ResizeObserver ? new ResizeObserver(() => fitFlowBoxes()) : null;
  root.querySelectorAll('.mkml-flow-box-content').forEach((content) => state.flowBoxObserver?.observe(content));
  requestAnimationFrame(fitFlowBoxes);
}
function setPreviewZoom(value) {
  const viewport = $('#preview-viewport');
  const oldZoom = state.previewZoom;
  const scrollLeft = viewport.scrollLeft / oldZoom;
  const scrollTop = viewport.scrollTop / oldZoom;
  state.previewZoom = Math.max(0.05, Math.min(3, Math.round(Number(value) * 100) / 100));
  $('#preview-canvas').style.zoom = String(state.previewZoom);
  requestAnimationFrame(() => {
    viewport.scrollLeft = scrollLeft * state.previewZoom;
    viewport.scrollTop = scrollTop * state.previewZoom;
    renderVisibleGridLabels();
  });
}
function changePreviewZoom(direction) {
  const step = state.previewZoom <= 0.5 ? 0.05 : 0.25;
  setPreviewZoom(state.previewZoom + direction * step);
}
function updateGridState() { state.gridOn = !state.gridOn; $('#preview-canvas').classList.toggle('is-grid-off', !state.gridOn); }
async function toggleImmersiveMode() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  if (document.documentElement.requestFullscreen) {
    try { await document.documentElement.requestFullscreen(); }
    catch (error) { console.warn('Browser fullscreen was unavailable; using in-page immersive view.', error); document.body.classList.toggle('study-mode'); }
  } else document.body.classList.toggle('study-mode');
}
function syncImmersiveMode() { document.body.classList.toggle('study-mode', Boolean(document.fullscreenElement)); }
function beginCanvasPan(event) {
  if (event.button !== 1) return;
  const viewport = $('#preview-viewport');
  state.panPointer = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
  viewport.classList.add('is-panning');
  viewport.setPointerCapture(event.pointerId);
  event.preventDefault();
}
function moveCanvasPan(event) {
  if (!state.panPointer || state.panPointer.id !== event.pointerId) return;
  const viewport = $('#preview-viewport');
  viewport.scrollLeft = state.panPointer.left - (event.clientX - state.panPointer.x);
  viewport.scrollTop = state.panPointer.top - (event.clientY - state.panPointer.y);
  event.preventDefault();
}
function endCanvasPan(event) {
  if (!state.panPointer || state.panPointer.id !== event.pointerId) return;
  state.panPointer = null;
  $('#preview-viewport').classList.remove('is-panning');
}
function setupEvents() {
  $$('.nav-item, [data-page="folders"], [data-page="coding"], [data-page="registry"]').forEach((button) => button.addEventListener('click', () => setPage(button.dataset.page)));
  window.addEventListener('angles:sync-nav', (event) => {
    const syncedPage = event?.detail?.page;
    if (!['tracker', 'exam-info', 'registry'].includes(syncedPage)) return;
    if (!['tracker', 'exam-info', 'registry'].includes(state.page)) return;
    state.page = syncedPage;
    $$('.nav-item').forEach((button) => button.classList.toggle('is-active', button.dataset.page === syncedPage));
    const diskDetails = $('#tracker-disk-ledger-details');
    if (diskDetails) diskDetails.classList.toggle('is-hidden', syncedPage !== 'tracker');
    window.history.replaceState({}, '', `/#${syncedPage}`);
  });
  window.addEventListener('angles:storage-updated', () => {
    if (state.page === 'settings') renderSettingsStorage();
  });
  window.addEventListener('angles:chapters-updated', () => {
    void loadChapters();
  });
  $('#settings-refresh')?.addEventListener('click', () => { renderSettingsStorage(); showToast('Storage stats refreshed'); });
  $('#ls-autosave-toggle')?.addEventListener('change', (event) => {
    const enabled = Boolean(event.target.checked);
    if (window.anglesStorage) window.anglesStorage.setEnabled(enabled);
    else { try { window.localStorage.setItem(STUDIO_STORAGE_ENABLED_KEY, enabled ? 'true' : 'false'); } catch {} }
    renderSettingsStorage();
    const fb = $('#ls-feedback');
    if (fb) fb.textContent = enabled ? 'Browser LocalStorage auto-save is enabled.' : 'Auto-save paused (existing backups remain untouched).';
    showToast(enabled ? 'LocalStorage auto-save ON' : 'LocalStorage auto-save OFF');
  });
  $('#ls-export-btn')?.addEventListener('click', () => {
    const json = window.anglesStorage ? window.anglesStorage.exportBackup() : JSON.stringify({ noteDrafts: readNoteDrafts() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `angles-local-backup-${stamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const fb = $('#ls-feedback');
    if (fb) fb.textContent = `Exported angles-local-backup-${stamp}.json`;
    showToast('Backup JSON downloaded');
  });
  $('#ls-import-btn')?.addEventListener('click', () => $('#ls-import-file')?.click());
  $('#ls-import-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = window.anglesStorage ? window.anglesStorage.importBackup(text) : { ok: false, message: 'Storage bridge unavailable' };
    event.target.value = '';
    renderSettingsStorage();
    const fb = $('#ls-feedback');
    if (fb) fb.textContent = res.message;
    showToast(res.ok ? 'Backup restored to LocalStorage' : res.message);
  });
  const bindTwoStepReset = (selector, defaultLabel, confirmLabel, onConfirm) => {
    const btn = $(selector);
    if (!btn) return;
    let timer = null;
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('is-armed')) {
        btn.classList.add('is-armed');
        btn.textContent = confirmLabel;
        clearTimeout(timer);
        timer = setTimeout(() => { btn.classList.remove('is-armed'); btn.textContent = defaultLabel; }, 4000);
        return;
      }
      clearTimeout(timer);
      btn.classList.remove('is-armed');
      btn.textContent = defaultLabel;
      onConfirm();
    });
  };
  bindTwoStepReset('#ls-reset-tracker-btn', 'Reset Tracker to Code Defaults', 'Click again to confirm Tracker reset', () => {
    window.anglesStorage?.resetTrackerDefaults();
    renderSettingsStorage();
    const fb = $('#ls-feedback');
    if (fb) fb.textContent = 'Tracker, Exam Info, and Registry reset to code defaults.';
    showToast('Tracker reset to defaults');
  });
  bindTwoStepReset('#ls-clear-drafts-btn', 'Clear Cached Note Drafts', 'Click again to clear all note drafts', () => {
    window.anglesStorage?.clearNoteDrafts();
    renderSettingsStorage();
    const fb = $('#ls-feedback');
    if (fb) fb.textContent = 'Cleared all cached browser note drafts.';
    showToast('Local note drafts cleared');
  });
  $('#refresh-button').addEventListener('click', async () => { await loadChapters(); showToast('Disk refreshed'); });
  $('#new-html-button').addEventListener('click', () => openCreator('html')); $('#new-css-button').addEventListener('click', () => openCreator('css')); $('#inline-file-input').addEventListener('keydown', (event) => { if (event.key === 'Enter') submitCreator(); if (event.key === 'Escape') closeCreator(); }); $('#inline-file-cancel').addEventListener('click', closeCreator);
  $('#sidebar-collapse').addEventListener('click', () => $('#chapter-sidebar').classList.toggle('is-collapsed')); $('#open-preview-button').addEventListener('click', async () => { await flushSave(); setPage('preview'); }); $$('.quick-toolbar [data-insert]').forEach((button) => button.addEventListener('click', () => insertSnippet(button.dataset.insert))); $('#code-editor').addEventListener('input', queueSave); $('#code-editor').addEventListener('scroll', () => { $('#line-numbers').scrollTop = $('#code-editor').scrollTop; });
  $('#diagram-question-back').addEventListener('click', returnToDiagram);
  const viewport = $('#preview-viewport');
  viewport.addEventListener('pointerdown', beginCanvasPan);
  viewport.addEventListener('pointermove', moveCanvasPan);
  viewport.addEventListener('pointerup', endCanvasPan);
  viewport.addEventListener('pointercancel', endCanvasPan);
  document.addEventListener('fullscreenchange', syncImmersiveMode);
  viewport.addEventListener('scroll', () => { renderVisibleGridLabels(); extendGraphAtViewportEdge(); }, { passive: true });
  window.addEventListener('resize', () => applyPreviewCanvasSize());
  $('#preview-canvas').addEventListener('mousemove', (event) => { const canvas = $('#preview-canvas'); const rect = canvas.getBoundingClientRect(); const zoom = state.previewZoom; const column = Math.max(1, Math.floor((event.clientX - rect.left) / (rect.width / state.previewCols)) + 1); const row = Math.max(1, Math.floor((event.clientY - rect.top - 47 * zoom) / (32 * zoom)) + 1); const tooltip = $('#coordinate-tooltip'); tooltip.textContent = `Col ${column}, Row ${row}`; tooltip.style.left = `${event.clientX + 14}px`; tooltip.style.top = `${event.clientY + 14}px`; tooltip.classList.add('is-visible'); }); $('#preview-canvas').addEventListener('mouseleave', () => $('#coordinate-tooltip').classList.remove('is-visible'));
  document.addEventListener('keydown', async (event) => {
    const key = event.key.toLowerCase();
    const inPreview = state.page === 'preview';
    if (inPreview && event.altKey && (event.code === 'Equal' || key === '+' || key === '=')) { event.preventDefault(); changePreviewZoom(1); return; }
    if (inPreview && event.altKey && (event.code === 'Minus' || key === '-' || key === '_')) { event.preventDefault(); changePreviewZoom(-1); return; }
    if (inPreview && event.altKey && key === 'g') { event.preventDefault(); updateGridState(); return; }
    if (event.altKey && key === 't') { event.preventDefault(); insertSnippet('table'); }
    if (event.altKey && key === 'q') { event.preventDefault(); insertSnippet('question'); }
    if (event.altKey && key === 'g' && !inPreview) { event.preventDefault(); insertSnippet('grid'); }
    if (event.altKey && key === 'p') { event.preventDefault(); await flushSave(); setPage('preview'); }
    if ((event.ctrlKey || event.metaKey) && key === 's' && state.page === 'coding') { event.preventDefault(); await flushSave(); showToast('Saved to disk'); }
    if (event.ctrlKey && key === 'b') { event.preventDefault(); $('#chapter-sidebar').classList.toggle('is-collapsed'); }
    if (event.key === 'F11' && inPreview) { event.preventDefault(); await toggleImmersiveMode(); }
  });
  window.addEventListener('pagehide', () => { if (state.isDirty) void flushSave(true); });
  window.addEventListener('beforeunload', () => { if (state.isDirty) void flushSave(true); });
  window.addEventListener('angles:chapters-updated', async (event) => {
    const deletedFolder = event?.detail?.deletedFolder;
    await loadChapters();
    if (deletedFolder) {
      const drafts = readNoteDrafts();
      Object.keys(drafts).forEach((key) => {
        if (key.startsWith(`${deletedFolder}/`)) removeNoteDraft(key);
      });
      if (state.selectedFolder === deletedFolder) {
        state.selectedFolder = null;
        state.activeFile = null;
        state.activeContent = '';
        state.activeHtmlFile = null;
        state.activeHtmlContent = '';
        state.isDirty = false;
        $('#code-editor').value = '';
        $('#file-list').innerHTML = '';
        updateEditorMeta();
      }
    }
  });
}
window.openQuestionFile = async (folder, file) => { await openChapter(folder); await openFile(file); setPage('coding'); };
function updateClock() { $('#topbar-clock').textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
setupGridLabels(); setupEvents(); setPreviewZoom(state.previewZoom); updateClock(); setInterval(updateClock, 30000); loadChapters(); const initialPage = window.location.hash.slice(1); if (['coding', 'preview', 'graph', 'shortcuts', 'settings', 'question-index', 'tracker', 'exam-info', 'registry'].includes(initialPage)) setPage(initialPage);
