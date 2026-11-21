(function (root) {
  'use strict';

  function splitStepIdTokens(rawIds) {
    const cleaned = String(rawIds || '').replace(/\/\/[\s\S]*$/, '').trim();
    if (!cleaned) return [];
    const seen = new Set();
    const out = [];
    for (const part of cleaned.split(/[,/]+/)) {
      const upper = part.trim().toUpperCase();
      if (!upper) continue;
      const normalized = upper === 'TU' ? 'Tu' : upper;
      if (!seen.has(upper)) {
        seen.add(upper);
        out.push(normalized);
      }
    }
    return out;
  }

  function extractStepsFromQn(body) {
    const raw = String(body || '');
    const expMatch = /<explanation\s*>([\s\S]*?)<\/explanation\s*>/i.exec(raw);
    const searchArea = expMatch ? expMatch[1] : raw;
    const stepRegex = /<step\s+(\d+)\s*-\s*([^>]+)>([\s\S]*?)<\/step(?:\s+\1)?\s*>/gi;
    const steps = [];
    let match;
    while ((match = stepRegex.exec(searchArea)) !== null) {
      const stepIds = splitStepIdTokens(match[2]);
      steps.push({
        stepNumber: Number(match[1]),
        stepIds,
        stepId: stepIds.join(', '),
        body: match[3].trim(),
        hasTu: stepIds.some((id) => id.toUpperCase() === 'TU')
      });
    }
    return steps;
  }

  function stripMarkupSnippet(text) {
    return String(text || '')
      .replace(/<math\s*==\s*([^>]+)>/gi, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 110);
  }

  /**
   * Calculates PYQ batch Step-ID coverage without MID.
   * Rule:
   * - Each <Qn>...</Qn> is evaluated by its <step N - ID> tags.
   * - If ANY step in a question is labelled `Tu` (unmapped Micro Concept), the entire question
   *   counts once as uncovered (e.g., 5 questions with at least one `Tu` out of 100 => 95% coverage).
   * - `TG` (general basic knowledge) and all valid Micro Concept Step IDs (`T1`, `T2`, ..., or Base IDs)
   *   count as covered.
   */
  function calculatePastedBatchCompletion(source) {
    const text = String(source || '');
    const blocks = [...text.matchAll(/<Qn\b[^>]*>([\s\S]*?)<\/Qn\s*>/gi)];
    const total = blocks.length;
    let tuQuestions = 0;
    let untaggedQuestions = 0;
    let coveredQuestions = 0;
    const byStepId = {};
    const tuSteps = [];
    const gapCounts = new Map();

    blocks.forEach((match, idx) => {
      const body = match[1];
      const qIndex = idx + 1;
      const gapMatch = /<gap\s*={1,2}\s*([^>]+)>/i.exec(body);
      const explicitGap = gapMatch ? gapMatch[1].trim() : '';
      const steps = extractStepsFromQn(body);
      const uniqueIdsInQ = new Set();
      let hasTu = false;

      if (steps.length === 0) {
        untaggedQuestions++;
        return;
      }

      steps.forEach((step) => {
        step.stepIds.forEach((id) => {
          const key = id.toUpperCase() === 'TU' ? 'Tu' : id;
          if (!byStepId[key]) {
            byStepId[key] = {
              stepId: key,
              questionCount: 0,
              stepCount: 0,
              isTu: key === 'Tu',
              isTg: key === 'TG'
            };
          }
          byStepId[key].stepCount++;
          uniqueIdsInQ.add(key);
        });

        if (step.hasTu) {
          hasTu = true;
          const snippet = stripMarkupSnippet(step.body);
          const label = explicitGap || snippet || 'Unmapped Step (Tu)';
          tuSteps.push({
            questionIndex: qIndex,
            stepNumber: step.stepNumber,
            gapLabel: label,
            snippet
          });
          gapCounts.set(label, (gapCounts.get(label) || 0) + 1);
        }
      });

      uniqueIdsInQ.forEach((key) => {
        byStepId[key].questionCount++;
      });

      if (hasTu) {
        tuQuestions++;
      } else {
        coveredQuestions++;
      }
    });

    const unmapped = tuQuestions + untaggedQuestions;
    const completed = coveredQuestions;
    const completion = total ? (completed / total) * 100 : null;
    const tuGaps = [...gapCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return {
      total,
      unmapped,
      tuQuestions,
      untaggedQuestions,
      completed,
      completion,
      byStepId,
      tuSteps,
      tuGaps
    };
  }

  const api = { splitStepIdTokens, extractStepsFromQn, calculatePastedBatchCompletion };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AnglesQuestionBatch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
