'use strict';
const assert = require('node:assert/strict');
const engine = require('../question-engine');
const MKML = require('../public/mkml.js');

// 1. Step-ID parsing & normalization (Permanent Full Base IDs, TG, Tu)
assert.deepEqual(engine.splitStepIdTokens('QA-TRG-BS-FR-MC1, tu / tg'), ['QA-TRG-BS-FR-MC1', 'Tu', 'TG']);
assert.deepEqual(engine.splitStepIdTokens('QA-TRG-BS-FR-MC2'), ['QA-TRG-BS-FR-MC2']);
assert.equal(engine.inferConceptTargetFromStepIds(['TG', 'QA-TRG-BS-FR-MC1']), 'QA-TRG-BS-FR');
assert.equal(engine.inferConceptTargetFromStepIds(['Tu', 'TG']), '');

// 2. Parsing <Qn> blocks with <target == ...> and permanent Full Base IDs
const sampleBatch = `
<Qn>
  <id == QA-TRG-BS-FR-1>
  <target == QA-TRG-BS-FR>
  <type = Quantitative Aptitude>
  <text = If tan A = 4/3, find sin A.>
  <Options><A = 4/5><B = 3/5></Options>
  <answer = A>
  <explanation>
    <step 1 - QA-TRG-BS-FR-MC1>From <math == tan A = 4/3>, oppo = 4, adj = 3.</step 1>
    <step 2 - QA-TRG-BS-FR-MC2>Triplet (3, 4, 5) gives hypo = 5.</step 2>
    <step 3 - TG>sin A = 4/5.</step 3>
  </explanation>
</Qn>
<Qn>
  <type = Quantitative Aptitude>
  <gap = Sec-Tan Identity>
  <text = Solve sec^2 A - tan^2 A + 2.>
  <Options><A = 3><B = 2></Options>
  <answer = A>
  <explanation>
    <step 1 - QA-TRG-BS-FR-MC1>Identify trig terms.</step 1>
    <step 2 - Tu>Apply sec^2 A - tan^2 A = 1 identity.</step 2>
  </explanation>
</Qn>`;

const parsed = engine.parseQuestionBlocks(sampleBatch);
assert.equal(parsed.length, 2);
assert.equal(parsed[0].target, 'QA-TRG-BS-FR');
assert.equal(parsed[0].inferredTarget, 'QA-TRG-BS-FR');
assert.equal(parsed[0].hasTu, false);
assert.equal(parsed[0].isCovered, true);
assert.deepEqual(parsed[0].stepIds, ['QA-TRG-BS-FR-MC1', 'QA-TRG-BS-FR-MC2', 'TG']);
assert.deepEqual(engine.validateQuestion(parsed[0]), []);

assert.equal(parsed[1].target, '');
assert.equal(parsed[1].inferredTarget, 'QA-TRG-BS-FR');
assert.equal(parsed[1].hasTu, true);
assert.equal(parsed[1].isCovered, false);
assert.deepEqual(parsed[1].stepIds, ['QA-TRG-BS-FR-MC1', 'Tu']);
assert.equal(parsed[1].gap, 'Sec-Tan Identity');
assert.deepEqual(engine.validateQuestion(parsed[1]), []);

// Missing steps fails validation
const untagged = engine.parseQuestionBlocks('<Qn><text = No steps><Options><A = 1><B = 2></Options><answer = A></Qn>')[0];
assert.ok(engine.validateQuestion(untagged).some((m) => m.includes('step')));

// 3. Exact 100-PYQ coverage rule: 5 questions with even 1 `Tu` step => 95% coverage!
const hundredPyqParts = [];
for (let i = 1; i <= 95; i++) {
  hundredPyqParts.push(
    `<Qn><target == QA-TRG-BS-FR><text = Q${i}><Options><A = 1><B = 2></Options><answer = A><explanation><step 1 - QA-TRG-BS-FR-MC1>Ratio</step 1><step 2 - TG>Simplify</step 2></explanation></Qn>`
  );
}
for (let i = 96; i <= 100; i++) {
  hundredPyqParts.push(
    `<Qn><target == QA-TRG-BS-FR><gap = Missing Identity><text = Q${i}><Options><A = 1><B = 2></Options><answer = A><explanation><step 1 - QA-TRG-BS-FR-MC1>Known part</step 1><step 2 - Tu>Unknown step</step 2></explanation></Qn>`
  );
}
const batch100 = engine.calculatePastedBatchCompletion(hundredPyqParts.join('\n'));
assert.equal(batch100.total, 100);
assert.equal(batch100.completed, 95);
assert.equal(batch100.tuQuestions, 5);
assert.equal(batch100.unmapped, 5);
assert.equal(batch100.completion, 95);
assert.equal(batch100.byStepId.Tu.questionCount, 5);
assert.equal(batch100.byStepId['QA-TRG-BS-FR-MC1'].questionCount, 100);
assert.equal(batch100.tuGaps[0].label, 'Missing Identity');
assert.equal(batch100.tuGaps[0].count, 5);

// 4. Coverage helper & Tu gap aggregation
assert.deepEqual(engine.calculateStepCoverage(0, 0), { label: 'N/A (0 Questions)', percent: null, covered: 0, uncovered: 0, total: 0 });
assert.deepEqual(engine.calculateStepCoverage(95, 5), { label: '95%', percent: 95, covered: 95, uncovered: 5, total: 100 });
assert.deepEqual(engine.tuGapsByFrequency(parsed), [{ label: 'Sec-Tan Identity', count: 1 }]);

// 5. 5-tier hierarchy scanner (no MID required)
const hierarchyNote = `
<Domain == QA, name = Quantitative Aptitude>
<Chapter == QA-TRG, name = Trigonometry>
<Subtopic == QA-TRG-BS, name = Basics>
  <Concept == QA-TRG-BS-FR, name = Fundamental Ratios>
    <MC == QA-TRG-BS-FR-MC1, name = Right-Triangle Ratios></MC>
    <MC == QA-TRG-BS-FR-MC2, name = Triplets></MC>
  </Concept>
</Subtopic>`;
const scanned = engine.scanHierarchyBlocks(hierarchyNote);
assert.equal(scanned.domain.id, 'QA');
assert.equal(scanned.chapter.id, 'QA-TRG');
assert.equal(scanned.subtopics.length, 1);
assert.equal(scanned.concepts.length, 1);
assert.equal(scanned.microConcepts.length, 2);

// 6. MKML compilation of Tu steps + full MKML inside steps
const compiledTu = MKML.compile(`<qn all>${sampleBatch}</qn all>`);
assert.match(compiledTu, /mkml-exp-step-id is-tu/);
assert.match(compiledTu, /mkml-math/);
assert.match(compiledTu, /QA-TRG-BS-FR-MC1/);
assert.doesNotMatch(compiledTu, /mkml-question-mid/);

// 7. Question Index client must never use iframe-blocked window.confirm/alert and must emit routing status
const fs = require('node:fs');
const path = require('node:path');
const qiClientSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'question-index.js'), 'utf8');
assert.doesNotMatch(qiClientSource, /window\.(confirm|alert|prompt)\s*\(/);
assert.match(qiClientSource, /angles:routing-status/);
assert.match(qiClientSource, /angles:storage-updated/);

console.log('Question Index (Permanent Base IDs, <target == ...> & Tu) tests passed.');
