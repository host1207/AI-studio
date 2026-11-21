(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let indexData = null;
  let selectedFolder = '';
  let selectedType = 'ALL TYPES';
  let selectedTypeFolder = 'ALL';
  const expandedTypeFolders = new Set();
  let previewValid = false;

  async function api(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body;
  }

  function status(text) {
    const el = $('#qi-status');
    if (el) el.textContent = text;
  }

  async function refreshQuestionIndex() {
    status('Scanning live chapter files & Micro Concept Registry…');
    try {
      indexData = await api('/api/question-index');
      render();
      status('Step-ID Index refreshed from disk.');
    } catch (error) {
      status(error.message);
    }
  }
  window.refreshQuestionIndex = refreshQuestionIndex;

  function resolveRegistryInfo(token) {
    const upper = String(token || '').trim().toUpperCase();
    if (upper === 'TU') return { baseId: 'Tu', label: 'Unmapped Step (Missing MC)', statusLabel: 'Tu Gap', isTu: true, isTg: false };
    if (upper === 'TG') return { baseId: 'TG', label: 'Global General Knowledge', statusLabel: 'Covered (TG)', isTu: false, isTg: true };
    const mcs = indexData?.microConcepts || [];
    const match = mcs.find((mc) => mc.baseId.toUpperCase() === upper);
    if (match) {
      return { baseId: match.baseId, label: match.name || match.baseId, statusLabel: 'Covered', isTu: false, isTg: false };
    }
    return { baseId: token, label: 'Not in MC Registry (use Full Base ID, TG, or Tu)', statusLabel: 'Unknown ID', isTu: false, isTg: false };
  }

  function renderBatchSummary(batch) {
    const el = $('#qi-batch-completion');
    if (!el) return;
    if (!batch.total) {
      el.innerHTML = 'PYQ STEP COVERAGE · no questions yet';
      return;
    }
    const untaggedNote = batch.untaggedQuestions ? ` · ${batch.untaggedQuestions} untagged` : '';
    el.innerHTML = `<strong>${batch.completion.toFixed(1)}%</strong><span>PYQ STEP COVERAGE</span><small>${batch.total} questions · ${batch.completed} covered · ${batch.tuQuestions} with Tu${untaggedNote}</small>`;
  }

  function renderBatchResults(batch) {
    const tbody = $('#qi-batch-results');
    const gapsEl = $('#qi-batch-gaps');
    if (!batch.total) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="qi-report-empty">Paste a PYQ batch to calculate Step-ID coverage.</td></tr>';
      if (gapsEl) gapsEl.innerHTML = '<p class="qi-empty">No Tu gaps in current paste.</p>';
      return;
    }

    const entries = Object.values(batch.byStepId || {}).sort((a, b) => {
      if (a.isTu !== b.isTu) return a.isTu ? -1 : 1;
      return b.questionCount - a.questionCount || a.stepId.localeCompare(b.stepId, undefined, { numeric: true });
    });

    if (tbody) {
      tbody.innerHTML = entries.length
        ? entries.map((item) => {
            const info = resolveRegistryInfo(item.stepId);
            return `<tr class="${info.isTu ? 'qi-report-global' : ''}"><th scope="row"><strong>${esc(info.baseId)}</strong></th><td><small>${esc(info.label)}</small></td><td>${item.questionCount}</td><td>${item.stepCount}</td><td class="qi-report-pct">${esc(info.statusLabel)}</td></tr>`;
          }).join('')
        : '<tr><td colspan="5" class="qi-report-empty">No &lt;step N - BaseID&gt; tags found yet. Add step tags inside &lt;explanation&gt;…&lt;/explanation&gt;.</td></tr>';
    }

    if (gapsEl) {
      gapsEl.innerHTML = batch.tuGaps && batch.tuGaps.length
        ? batch.tuGaps.map((g) => `<div class="gap-row"><span>${esc(g.label)}</span><strong>${g.count}</strong></div>`).join('')
        : '<p class="qi-empty">0 Tu steps — 100% of tagged steps fit existing Micro Concepts.</p>';
    }
  }

  function render() {
    if (!indexData) return;
    const chapters = indexData.chapters || [];
    const batch = window.AnglesQuestionBatch.calculatePastedBatchCompletion($('#qi-input')?.value || '');
    renderBatchSummary(batch);
    renderBatchResults(batch);

    const sorted = [...chapters].sort((a, b) => b.totalQuestions - a.totalQuestions || a.name.localeCompare(b.name));
    const listEl = $('#qi-chapter-list');
    if (listEl) {
      listEl.innerHTML = sorted.length
        ? sorted.map((c) => `<button class="qi-bar-row qi-chapter-row" data-folder="${esc(c.folder)}"><span class="qi-bar-label"><strong>${esc(c.chapterId)}</strong><small>${esc(c.name)}</small></span><span class="qi-bar-track"><i style="width:${c.totalQuestions ? Math.max(2, c.totalShare) : 0}%"></i></span><span class="qi-bar-value">${c.totalQuestions}<small>${c.totalShare.toFixed(1)}% share</small></span><span class="qi-completion-value">${esc(c.coverage.label)}<small>${c.coveredCount} covered · ${c.tuCount} Tu</small></span></button>`).join('')
        : '<p class="qi-empty">No chapters scanned yet.</p>';
    }

    const select = $('#qi-chapter-select');
    if (select) {
      select.innerHTML = chapters.map((c) => `<option value="${esc(c.folder)}">${esc(c.chapterId)} · ${esc(c.name)}</option>`).join('');
      if (chapters.some((c) => c.folder === selectedFolder)) select.value = selectedFolder;
      selectedFolder = select.value || '';
    }

    const chapter = chapters.find((c) => c.folder === selectedFolder);
    const covPct = chapter?.totalQuestions ? (chapter.coveredCount / chapter.totalQuestions) * 100 : null;
    const tuPct = chapter?.totalQuestions ? (chapter.tuCount / chapter.totalQuestions) * 100 : null;
    const readinessEl = $('#qi-readiness');
    if (readinessEl) {
      readinessEl.innerHTML = chapter
        ? `<div class="readiness-number">${esc(chapter.coverage.label)}</div><div class="readiness-copy"><strong>${esc(chapter.name)} Step-ID Coverage</strong><span>${chapter.totalQuestions ? `${covPct.toFixed(1)}% covered · ${tuPct.toFixed(1)}% Tu gap · ${chapter.coveredCount} covered / ${chapter.tuCount} Tu` : 'No questions stored yet'}</span></div><div class="readiness-track"><i style="width:${covPct == null ? 0 : covPct}%"></i></div>`
        : '<p class="qi-empty">No chapter selected.</p>';
    }

    const stepList = chapter?.stepCounts || [];
    const maxSteps = Math.max(1, ...stepList.map((s) => s.questionCount));
    const conceptEl = $('#qi-concept-list');
    if (conceptEl) {
      conceptEl.innerHTML = stepList.length
        ? stepList.map((s) => `<div class="qi-bar-row"><span class="qi-bar-label"><strong>${esc(s.baseId)}</strong><small>${esc(s.name || s.baseId)}</small></span><span class="qi-bar-track"><i style="width:${(s.questionCount / maxSteps) * 100}%"></i></span><span class="qi-bar-value">${s.questionCount}<small>${s.stepCount} steps</small></span></div>`).join('')
        : '<p class="qi-empty">No tagged steps in this chapter yet.</p>';
    }

    const gapListEl = $('#qi-gap-list');
    if (gapListEl) {
      gapListEl.innerHTML = chapter?.gaps?.length
        ? chapter.gaps.map((g) => `<div class="gap-row"><span>${esc(g.label)}</span><strong>${g.count}</strong></div>`).join('')
        : '<p class="qi-empty">No Tu gaps in this chapter.</p>';
    }

    document.querySelectorAll('#qi-chapter-list [data-folder]').forEach((button) =>
      button.addEventListener('click', () => {
        selectedFolder = button.dataset.folder;
        render();
      })
    );
    renderTypeBreakdown();
  }

  function renderTypeBreakdown() {
    const breakdown = indexData?.typeBreakdown;
    if (!breakdown) return;
    const types = breakdown.types || [];
    if (selectedType !== 'ALL TYPES' && !types.includes(selectedType)) selectedType = 'ALL TYPES';
    const pillsEl = $('#qi-type-pills');
    if (pillsEl) {
      pillsEl.innerHTML = ['ALL TYPES', ...types]
        .map((type) => `<button type="button" class="qi-type-pill ${selectedType === type ? 'is-active' : ''}" data-type="${esc(type)}">${esc(type)}</button>`)
        .join('');
    }
    const filter = $('#qi-type-folder-filter');
    if (filter) {
      filter.innerHTML = `<option value="ALL">All chapters</option>${breakdown.folders.map((folder) => `<option value="${esc(folder.folder)}">${esc(folder.name)} (${esc(folder.chapterId)})</option>`).join('')}`;
      if (selectedTypeFolder !== 'ALL' && !breakdown.folders.some((f) => f.folder === selectedTypeFolder)) selectedTypeFolder = 'ALL';
      filter.value = selectedTypeFolder;
    }
    const folders = breakdown.folders.filter((f) => selectedTypeFolder === 'ALL' || f.folder === selectedTypeFolder);
    const countOf = (folder) => (selectedType === 'ALL TYPES' ? folder.uniqueCount : folder.counts[selectedType] || 0);
    const total = folders.reduce((sum, f) => sum + countOf(f), 0);
    const sorted = [...folders].sort((a, b) => countOf(b) - countOf(a) || a.name.localeCompare(b.name));
    const rankEl = $('#qi-type-folder-ranking');
    if (rankEl) {
      rankEl.innerHTML = sorted.length
        ? sorted.map((folder) => {
            const count = countOf(folder);
            const share = total ? (count / total) * 100 : 0;
            const expanded = expandedTypeFolders.has(folder.folder);
            const concepts = (folder.concepts || [])
              .map((c) => ({ ...c, count: selectedType === 'ALL TYPES' ? c.uniqueCount : c.counts[selectedType] || 0 }))
              .filter((c) => c.count > 0)
              .sort((a, b) => b.count - a.count || a.conceptId.localeCompare(b.conceptId));
            const max = Math.max(1, ...concepts.map((c) => c.count));
            return `<article class="qi-type-folder ${expanded ? 'is-expanded' : ''}"><button type="button" class="qi-type-folder-row" aria-expanded="${expanded}" data-folder="${esc(folder.folder)}"><span class="qi-type-folder-name"><span class="qi-type-chevron">${expanded ? '▾' : '▸'}</span><strong>${esc(folder.name)}</strong><small>${esc(folder.chapterId)}</small></span><span class="qi-type-count"><b>${count}</b><i><em style="width:${count ? Math.max(2, share) : 0}%"></em></i></span><span class="qi-type-share">${share.toFixed(1)}%</span></button>${expanded ? `<div class="qi-type-concepts">${concepts.length ? concepts.map((c) => `<div class="qi-type-concept"><span><strong>${esc(c.conceptId)}</strong><small>${esc(c.title)}</small></span><i><em style="width:${(c.count / max) * 100}%"></em></i><b>${c.count}</b></div>`).join('') : '<p class="qi-empty">No concept questions for this type.</p>'}</div>` : ''}</article>`;
          }).join('')
        : '<p class="qi-empty">No chapters indexed yet.</p>';
    }
    document.querySelectorAll('.qi-type-pill').forEach((btn) =>
      btn.addEventListener('click', () => { selectedType = btn.dataset.type; renderTypeBreakdown(); })
    );
    document.querySelectorAll('.qi-type-folder-row').forEach((btn) =>
      btn.addEventListener('click', () => {
        const folder = btn.dataset.folder;
        if (expandedTypeFolders.has(folder)) expandedTypeFolders.delete(folder);
        else expandedTypeFolders.add(folder);
        renderTypeBreakdown();
      })
    );
  }

  let isCommitting = false;

  function emitRoutingStatus(nextStatus, detail, extra = {}) {
    const payload = {
      status: nextStatus,
      detail: String(detail || ''),
      targetPath: extra.targetPath || '',
      addedIds: Array.isArray(extra.addedIds) ? extra.addedIds : [],
      questionCount: typeof extra.questionCount === 'number' ? extra.questionCount : undefined,
      source: 'question-index',
      updatedAt: new Date().toISOString()
    };
    window.__anglesRoutingStatus = payload;
    window.dispatchEvent(new CustomEvent('angles:routing-status', { detail: payload }));
  }

  function showDryRun(data) {
    previewValid = data.valid;
    const commitBtn = $('#qi-commit');
    if (commitBtn) {
      commitBtn.disabled = !data.valid;
      commitBtn.textContent = 'Ship batch to questions.html';
    }
    const routes = data.routes.map((q) => {
      const stepBadges = (q.resolvedSteps || [])
        .map((s) => `Step ${s.stepNumber}: ${s.tokens.map((t) => `${t.baseId}${t.name && t.name !== t.baseId ? ` (${t.name})` : ''}`).join(', ')}`)
        .join('<br>');
      const targetInfo = q.target?.targetPath ? `${q.target.folder}/${q.target.file} · target ${q.target.targetPath}` : `${q.target?.folder || ''}/${q.target?.file || ''}`;
      return `<article class="qi-route ${q.issues.length ? 'has-issue' : ''}"><div class="qi-route-top"><strong>Q${q.index}</strong><span>${q.hasTu ? 'UNCOVERED · Tu GAP' : 'COVERED'} · ${esc(q.stepIds.join(' · ') || 'No steps')}</span></div><p>${esc(q.text || '(Question text missing)')}</p><div class="qi-route-destination">${stepBadges || 'No steps parsed'}<br>Destination: ${esc(targetInfo)}</div>${q.issues.length ? `<div class="qi-route-errors">${q.issues.map(esc).join(' · ')}</div>` : ''}${q.gap ? `<span class="gap-chip">GAP · ${esc(q.gap)}</span>` : ''}</article>`;
    }).join('');
    const pctText = data.coveragePercent == null ? 'N/A' : `${data.coveragePercent.toFixed(1)}%`;
    $('#qi-preview').innerHTML = `<div class="qi-summary"><strong>${data.routes.length} questions · ${pctText} covered</strong> · ${data.covered} covered · ${data.tuCount} with Tu${data.valid ? ' · ready to ship' : ' · fix validation issues before saving'}</div>${routes}`;

    const targets = [...new Set(data.routes.map((r) => r.target?.targetPath || (r.target?.folder ? `${r.target.folder}/${r.target.file}` : '')).filter(Boolean))];
    if (data.valid) {
      emitRoutingStatus(
        'Pending',
        `Validated ${data.routes.length} question(s) — ready to ship to disk.`,
        { targetPath: targets.join(', '), questionCount: data.routes.length }
      );
    } else {
      const issueCount = data.routes.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
      emitRoutingStatus(
        'Sync Error',
        `Dry-run found ${issueCount} validation issue(s) — fix before shipping.`,
        { targetPath: targets.join(', '), questionCount: data.routes.length }
      );
    }
  }

  async function dryRun() {
    emitRoutingStatus('Pending', 'Validating PYQ batch routes...');
    try {
      showDryRun(await api('/api/question-index/dry-run', { method: 'POST', body: JSON.stringify({ source: $('#qi-input').value }) }));
    } catch (error) {
      previewValid = false;
      if ($('#qi-commit')) $('#qi-commit').disabled = true;
      $('#qi-preview').innerHTML = `<p class="qi-route-errors">${esc(error.message)}</p>`;
      emitRoutingStatus('Sync Error', error.message || 'Dry-run validation failed.');
    }
  }

  async function commit() {
    const commitBtn = $('#qi-commit');
    if (isCommitting || !previewValid || commitBtn?.disabled) return;
    isCommitting = true;
    const originalLabel = commitBtn?.textContent || 'Ship batch to questions.html';
    if (commitBtn) {
      commitBtn.disabled = true;
      commitBtn.textContent = 'Shipping to disk…';
    }
    status('Shipping validated PYQ batch to local chapter HTML files…');
    emitRoutingStatus('Pending', 'Shipping validated PYQ batch to disk…');

    try {
      const result = await api('/api/question-index/commit', {
        method: 'POST',
        body: JSON.stringify({ source: $('#qi-input').value })
      });
      previewValid = false;
      if (commitBtn) {
        commitBtn.disabled = true;
        commitBtn.textContent = originalLabel;
      }
      const added = Array.isArray(result.added) ? result.added : [];
      const duplicates = Array.isArray(result.duplicates) ? result.duplicates : [];
      const addedIds = added.map((item) => item.id).filter(Boolean);
      const destinations = [...new Set([...added, ...duplicates].map((item) => item.targetPath || `${item.folder}/${item.file}`).filter(Boolean))];
      const summaryText = `${added.length} question(s) saved · ${duplicates.length} duplicate(s) skipped`;
      status(summaryText);

      const previewEl = $('#qi-preview');
      if (previewEl) {
        const addedRows = added
          .map((item) => `<div class="qi-route-destination">Saved <strong>${esc(item.id || 'question')}</strong> → ${esc(item.folder)}/${esc(item.file)}${item.targetPath ? ` · target ${esc(item.targetPath)}` : ''}</div>`)
          .join('');
        const dupRows = duplicates
          .map((item) => `<div class="qi-route-destination">Skipped duplicate in ${esc(item.folder)}/${esc(item.file)}${item.targetPath ? ` · target ${esc(item.targetPath)}` : ''}: ${esc(item.text || '')}</div>`)
          .join('');
        previewEl.innerHTML = `<div class="qi-summary"><strong>Batch shipped to disk</strong> · ${esc(summaryText)}</div>${addedRows}${dupRows}`;
      }

      if (result.index) {
        indexData = result.index;
        render();
      } else {
        await refreshQuestionIndex();
      }

      const verifiedDetail = added.length > 0
        ? `Saved ${added.length} question(s) to disk${duplicates.length ? ` (${duplicates.length} duplicate skipped)` : ''}.`
        : `All ${duplicates.length} question(s) already verified on disk (duplicates skipped).`;
      emitRoutingStatus('Verified', verifiedDetail, {
        targetPath: destinations.join(', '),
        addedIds,
        questionCount: added.length
      });

      window.dispatchEvent(new CustomEvent('angles:storage-updated', {
        detail: { source: 'question-index', added, duplicates }
      }));
      window.dispatchEvent(new CustomEvent('angles:chapters-updated', {
        detail: { source: 'question-index', added }
      }));
    } catch (error) {
      if (commitBtn) {
        commitBtn.disabled = !previewValid;
        commitBtn.textContent = originalLabel;
      }
      const message = error?.message || 'Failed to ship batch to disk.';
      status(message);
      if ($('#qi-preview')) {
        $('#qi-preview').innerHTML = `<p class="qi-route-errors">${esc(message)}</p>`;
      }
      emitRoutingStatus('Sync Error', message);
    } finally {
      isCommitting = false;
    }
  }

  $('#qi-refresh')?.addEventListener('click', refreshQuestionIndex);
  $('#qi-dry-run')?.addEventListener('click', dryRun);
  $('#qi-commit')?.addEventListener('click', commit);
  $('#qi-chapter-select')?.addEventListener('change', (event) => { selectedFolder = event.target.value; render(); });
  $('#qi-type-folder-filter')?.addEventListener('change', (event) => { selectedTypeFolder = event.target.value; renderTypeBreakdown(); });
  $('#qi-input')?.addEventListener('input', () => {
    previewValid = false;
    if ($('#qi-commit')) {
      $('#qi-commit').disabled = true;
      $('#qi-commit').textContent = 'Ship batch to questions.html';
    }
    const raw = $('#qi-input').value;
    const batch = window.AnglesQuestionBatch.calculatePastedBatchCompletion(raw);
    renderBatchSummary(batch);
    renderBatchResults(batch);
    if (raw.trim()) {
      emitRoutingStatus('Pending', `Unsaved draft (${batch.total} question(s)) in Question Index — validate & ship to verify.`, {
        questionCount: batch.total
      });
    }
  });

  if (window.location.hash === '#question-index') void refreshQuestionIndex();
})();
