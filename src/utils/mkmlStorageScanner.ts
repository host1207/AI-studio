import type {
  AttemptTuple,
  AttemptStatus,
  ChapterLedger,
  ChapterTimingConfig,
} from '../components/TrackerPageOne';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from '../components/ExamRegistryDashboard';

// ============================================================================
// 1. DATA STRUCTURES FOR SCANNED MKML STORAGE & UNIQUE QUESTION IDs
// ============================================================================

export interface ScannedQuestionItem {
  /** Chained Unique ID: <DomainCode-ChapterCode-SubtopicCode-ConceptCode-x_n> e.g. QA-TD-BWR-V1-1 */
  uniqueId: string;
  questionIndex: number;
  domainCode: string;
  chapterCode: string;
  subtopicId: string; // e.g. QA-TD-BWR
  subtopicShortCode: string; // e.g. BWR
  conceptId: string; // e.g. QA-TD-BWR-V1
  conceptShortCode: string; // e.g. V1
  microConceptIds: string[]; // e.g. ['QA-TRG-ANG-ASTC-MC1']
  rawQnBody: string;
  attempts: AttemptTuple[];
}

export interface ScannedConceptNode {
  /** Full Concept tag ID e.g. QA-TD-BWR-V1 */
  conceptId: string;
  /** Short Concept code e.g. V1 or ASTC */
  conceptCode: string;
  /** Human-readable name from Concept Registry */
  conceptName: string;
  subtopicId: string;
  microConceptIds: string[];
  questions: ScannedQuestionItem[];
}

export interface ScannedSubtopicNode {
  /** Full Subtopic tag ID e.g. QA-TD-BWR */
  subtopicId: string;
  /** Short Subtopic code e.g. BWR or ANG */
  subtopicCode: string;
  /** Human-readable name from Subtopic Registry e.g. Basic Work Rates */
  subtopicName: string;
  concepts: ScannedConceptNode[];
  questions: ScannedQuestionItem[];
}

export interface ScannedChapterTree {
  domainCode: string;
  domainName: string;
  chapterId: string; // e.g. QA-TD
  chapterCode: string; // e.g. TD
  chapterName: string;
  subtopics: ScannedSubtopicNode[];
  allQuestions: ScannedQuestionItem[];
}

// ============================================================================
// 2. SAMPLE MKML NOTES WITH EMBEDDED 5-TIER IDENTIFICATION TAGS
// ============================================================================

export const CHAPTER_MKML_STORAGE: Record<string, string> = {
  TD: `<Domain == QA>
<Chapter == QA-TD>
<link-css-id: qa-td>

<!-- Root Node for Time and Distance -->
<box points = (40,1),(60,1),(60,4),(40,4) background-color = #0F172A color = #FFFFFF>
  TIME AND DISTANCE (QA-TD)
</box>

<!-- SUBTOPIC 1: BASIC WORK RATES (QA-TD-BWR) -->
<Subtopic == QA-TD-BWR>
  <box points = (5,6),(45,6),(45,40),(5,40) background-color = #0F172A color = #38BDF8>
    1) Basic Work Rates (QA-TD-BWR)
  </box>

  <!-- CONCEPT / VARIANT 1.1: V1 (2 Questions) -->
  <Concept == QA-TD-BWR-V1>
    <MC == QA-TD-BWR-V1-MC1>
      Step T1: Speed = Distance / Time (Direct Ratio Conversion)
    </MC>
    <qn all>
      <Qn>
        <id == QA-TD-BWR-V1-1>
        <text = A train covers 180 km in 3 hours. Find its speed in m/s.>
        <Options>
          <A = 16.67 m/s>
          <B = 15 m/s>
          <C = 20 m/s>
          <D = 18 m/s>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TD-BWR-V1-2>
        <text = Walking at 3/4 of his usual speed, a man is 15 minutes late. Find his usual time.>
        <Options>
          <A = 30 min>
          <B = 45 min>
          <C = 60 min>
          <D = 75 min>
        </Options>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>

  <!-- CONCEPT / VARIANT 1.2: V2 (1 Question) -->
  <Concept == QA-TD-BWR-V2>
    <MC == QA-TD-BWR-V2-MC1>
      Step T2: Average Speed Harmonic Mean = 2xy / (x + y)
    </MC>
    <qn all>
      <Qn>
        <id == QA-TD-BWR-V2-1>
        <text = A car travels from A to B at 40 km/h and returns at 60 km/h. Find average speed.>
        <Options>
          <A = 50 km/h>
          <B = 48 km/h>
          <C = 45 km/h>
          <D = 52 km/h>
        </Options>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>

<!-- SUBTOPIC 2: RELATIVE SPEED & TRAINS (QA-TD-RST) -->
<Subtopic == QA-TD-RST>
  <box points = (50,6),(90,6),(90,40),(50,40) background-color = #0F172A color = #38BDF8>
    2) Relative Speed & Trains (QA-TD-RST)
  </box>

  <!-- CONCEPT / VARIANT 2.1: V1 (3 Questions) -->
  <Concept == QA-TD-RST-V1>
    <MC == QA-TD-RST-V1-MC1>
      Step T3: Opposite Direction Relative Speed = (S1 + S2)
    </MC>
    <qn all>
      <Qn>
        <id == QA-TD-RST-V1-1>
        <text = Two trains 120m and 180m long run in opposite directions at 50 km/h and 40 km/h. Time to cross?>
        <Options>
          <A = 10 s>
          <B = 12 s>
          <C = 15 s>
          <D = 18 s>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TD-RST-V1-2>
        <text = A train crosses a pole in 15s and a 100m platform in 25s. Find the length of the train.>
        <Options>
          <A = 120 m>
          <B = 150 m>
          <C = 180 m>
          <D = 200 m>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TD-RST-V1-3>
        <text = Two trains start at the same time from A and B towards each other and after crossing take 4h and 9h. Ratio of speeds?>
        <Options>
          <A = 2 : 3>
          <B = 3 : 2>
          <C = 4 : 9>
          <D = 9 : 4>
        </Options>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>`,

  TRG: `<Domain == QA>
<Chapter == QA-TRG>
<link-css-id: qa-trg>

<line m color = #38BDF8>(13,4),(13,7)</line m>
<line m color = #38BDF8>(13,10),(13,11),(6,11),(6,12)</line m>
<line m color = #38BDF8>(13,11),(20,11),(20,12)</line m>
<line m color = #0D9488>(6,25),(6,28)</line m>
<line m color = #2563EB>(20,25),(20,28)</line m>

<box points = (7,1),(19,1),(19,4),(7,4) background-color = #1E3A8A color = #FFFFFF>
  <h2>TRIGONOMETRY (QA-TRG)</h2>
</box>

<Subtopic == QA-TRG-BS>
  <box points = (5,7),(21,7),(21,10),(5,10) background-color = #0D9488 color = #FFFFFF>
    <h3>Subtopic 1: Basics (QA-TRG-BS)</h3>
  </box>

  <Concept == QA-TRG-BS-FR>
    <MC == QA-TRG-BS-FR-MC1>
      <box points = (2,12),(10,12),(10,25),(2,25) background-color = #F1F5F9 color = #0F172A>
        <h3>MC1 (T1): Fundamental Right-Triangle Ratios</h3>
        <p><math == sin theta = oppo / hypo> | <math == cos theta = Adj / hypo></p>
        <p><math == tan theta = sin theta / cos theta = oppo / Adj></p>
        <p><math == cosec theta = 1 / sin theta = hypo / oppo></p>
        <p><math == sec theta = 1 / cos theta = hypo / Adj></p>
        <p><math == cot theta = 1 / tan theta = Adj / oppo></p>
        <rule == Warm-up (3-4-5 tri): (i) <math == sin alpha + cos beta = 3/5 + 3/5 = 6/5> (ii) <math == tan^2 alpha + cot^2 beta = 9/16 + 9/16 = 9/8>>
      </box>
    </MC>

    <line d line-color = #1D4ED8 text-color = #1E3A8A>(11,13),(11,20) oppo (O = 3)</line d>
    <line d line-color = #15803D text-color = #14532D>(11,20),(15,20) Adj (M = 4)</line d>
    <line d line-color = #E11D48 text-color = #991B1B>(11,13),(15,20) hypo (H = 5)</line d>

    <box w points = (10,22),(16,22),(16,25),(10,25) text-color = #0F172A>
      Right ΔABC (∠B = 90°, α at A, β at C)
    </box w>

    <MC == QA-TRG-BS-FR-MC2>
      <box points = (16,12),(24,12),(24,25),(16,25) background-color = #FFF4CC color = #78350F>
        <h3>MC2 (T2): Pythagorean Triplets Generator</h3>
        <p>Odd n: <math == n -> n^2 -> n^2 / 2 => (5, 12, 13)></p>
        <p>Even y: <math == y -> y^2 / 2 = A -> 2x + 2 = A => (6, 8, 10)></p>
      </box>
    </MC>

    <MC == QA-TRG-BS-FR-MC3>
      <box points = (2,28),(12,28),(12,37),(2,37) background-color = #DCFCE7 color = #14532D>
        <h3>MC3 (T3): Dual-Vertex / Complementary Angle Switch</h3>
        <p>In right <math == tri ABC> (<math == ang B = 90 deg>): <math == sin A = cos C> | <math == cos A = sin C></p>
      </box>
    </MC>

    <MC == QA-TRG-BS-FR-TG>
      <box points = (14,28),(24,28),(24,37),(14,37) background-color = #F1F5F9 color = #0F172A>
        <h3>TG: Target Algebraic Substitution &amp; Simplification</h3>
        <p>Homogeneous <math == sin theta / cos theta> substitution &amp; fraction reduction.</p>
      </box>
    </MC>

    <qn all>
      <Qn>
        <id == QA-TRG-BS-FR-1>
        <text = 1) If tan A = 4/3, 0° ≤ A ≤ 90°, then find the value of sin A.>
        <Options>
          <A = 4/5>
          <B = 3/5>
          <C = 3/4>
          <D = 5/4>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-2>
        <text = 2) If sin θ = 9/41, 0° < θ < 90°, then find cot θ. [SSC CGL Mains 2022]>
        <Options>
          <A = 9/40>
          <B = 40/9>
          <C = 41/40>
          <D = 40/41>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-3>
        <text = 3) If tan A = 2/5, find sec²A / cosec²A ? [SSC CPO]>
        <Options>
          <A = 2/5>
          <B = 4/25>
          <C = 25/4>
          <D = 4/29>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-4>
        <text = 4) If sin β = 1/3, find (sec β - tan β)³ = ?>
        <Options>
          <A = 1 / √8>
          <B = 1 / 8>
          <C = √8 / 3>
          <D = 2 / √8>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-5>
        <text = 5) If cos θ = √3 / 2, find tan²θ × cos²θ = ? [SSC CGL 2023]>
        <Options>
          <A = 1/2>
          <B = 1/3>
          <C = 1/4>
          <D = 3/4>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-6>
        <text = 6) If 5 sin θ - 4 cos θ = 0, 0° < θ < 90°, then find (5 sin θ + 2 cos θ) / (5 sin θ + 3 cos θ) = ? [SSC CGL 2023]>
        <Options>
          <A = 5/7>
          <B = 6/7>
          <C = 4/7>
          <D = 3/7>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-7>
        <text = 7) If tan θ = 3/4, then find (1 + sin θ) / (1 - sin θ) = ?>
        <Options>
          <A = 2>
          <B = 3>
          <C = 4>
          <D = 5>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-8>
        <text = 8) If 5 cot θ = 3, then find (6 sin θ - 3 cos θ) / (7 sin θ + 3 cos θ) = ? [SSC CGL Prelims 2023]>
        <Options>
          <A = 21/44>
          <B = 39/44>
          <C = 21/35>
          <D = 19/44>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-9>
        <text = 9) If sin A = 2/5, find the value of (5 sin A + 2 cosec A) / (√21 sec A) = ? [SSC CHSL 2023]>
        <Options>
          <A = 5/7>
          <B = 7/5>
          <C = 2/5>
          <D = 7/21>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-10>
        <text = 10) If sec A = 17/8, find the value of (34 sin A + 15 cot A) / (68 cos A - 16 tan A) = ?>
        <Options>
          <A = 17>
          <B = 19>
          <C = 21>
          <D = 38>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-11>
        <text = 11) If (3 sin θ - cos θ) / (cos θ + sin θ) = 1, then find cot θ = ?>
        <Options>
          <A = 0>
          <B = 1>
          <C = 1/2>
          <D = 2>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-12>
        <text = 12) If (sin θ - cos θ) / (sin θ + cos θ) = 4/5, find cosec²θ / (2 - cosec²θ) = ? [SSC CHSL]>
        <Options>
          <A = 40/41>
          <B = 41/40>
          <C = 82/81>
          <D = 81/80>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-13>
        <text = 13) If sec θ = a/b, then find (1 - tan²θ) / (2 - sin²θ) = ? [SSC CGL Mains]>
        <Options>
          <A = a²(2b² - a²) / [b²(a² + b²)]>
          <B = b²(2a² - b²) / [a²(a² + b²)]>
          <C = a²(a² - 2b²) / [b²(a² + b²)]>
          <D = (2b² - a²) / (a² + b²)>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-14>
        <text = 14) If sin²θ / (tan²θ - sin²θ) = 5, find (24 sin²θ - 15 sec²θ) / (6 cosec²θ - 7 cot²θ) = ?>
        <Options>
          <A = 14>
          <B = -14>
          <C = -12>
          <D = 12>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-15>
        <text = 15) If (sec θ - tan θ) / (sec θ + tan θ) = 1/7, find (cosec θ + cot²θ) / (cosec θ - cot²θ) = ?>
        <Options>
          <A = 19/5>
          <B = 5/19>
          <C = 17/5>
          <D = 19/9>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-16>
        <text = 15b) In ΔABC right-angled at B, if tan A = 1 / √3, find sin A cos C + cos A sin C = ?>
        <Options>
          <A = 0>
          <B = 1/2>
          <C = 1>
          <D = √3 / 2>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-17>
        <text = 16) In ΔABC right-angled at B, if tan A = 1/2, then find [sin A (cos C + cos A)] / [cos C (sin C - sin A)] = ?>
        <Options>
          <A = 1>
          <B = 2>
          <C = 3>
          <D = 5>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-18>
        <text = 17) In ΔABC, ∠B = 90° and AB : BC = 1 : 2. What is the value of cos A + tan C ?>
        <Options>
          <A = (2 + √5) / (2√5)>
          <B = (1 + √5) / (2√5)>
          <C = 3 / √5>
          <D = √5 / 2>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-19>
        <text = 18) If sin A = 5/13 and 7 cot B = 24, find (sec A cos B)(cosec B tan A) = ?>
        <Options>
          <A = 65/42>
          <B = 42/65>
          <C = 13/14>
          <D = 25/12>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-20>
        <text = 19) If sin 23° = a/b, find sec 23° - sin 67° = ?>
        <Options>
          <A = a² / [b √(b² - a²)]>
          <B = b² / [a √(b² - a²)]>
          <C = a / √(b² - a²)>
          <D = √(b² - a²) / b>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-21>
        <text = 20) If sec 31° = x, find sin² 59° + (1 / sec² 31°) - [1 / (sin² 59° cosec² 59°)] = ?>
        <Options>
          <A = (2 - x²) / x²>
          <B = (x² - 2) / x²>
          <C = 2 / x²>
          <D = 1 / x²>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-22>
        <text = 21) If tan B = 5/3, find (cosec B + sin B) / (cos B - sec B) = ?>
        <Options>
          <A = -177 / 125>
          <B = 177 / 125>
          <C = -59 / 25>
          <D = 59 / 125>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-23>
        <text = 22) If cos θ = 12/13, find [sin θ (1 - tan θ)] / [tan θ (1 + cosec θ)] = ?>
        <Options>
          <A = 35 / 234>
          <B = 25 / 234>
          <C = 35 / 156>
          <D = 7 / 18>
        </Options>
        <answer = A>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>`,

  PN: `<Domain == Eng>
<Chapter == Eng-PN>
<Subtopic == Eng-PN-PER>
  <Concept == Eng-PN-PER-C1>
    <MC == Eng-PN-PER-C1-MC1>Trap 1: Prepositions (between, let, like, but, except) force objective case</MC>
    <qn all>
      <Qn>
        <id == Eng-PN-PER-C1-1>
        <text = Between you and I, the secretary is not going to resign.>
        <answer = A>
      </Qn>
      <Qn>
        <id == Eng-PN-PER-C1-2>
        <text = Let he and I complete the assignment first.>
        <answer = A>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>
<Subtopic == Eng-PN-REL>
  <Concept == Eng-PN-REL-C1>
    <MC == Eng-PN-REL-C1-MC1>Who vs Whom: Count Finite Verbs (F.V) vs Subjects</MC>
    <qn all>
      <Qn>
        <id == Eng-PN-REL-C1-1>
        <text = The candidate whom you said was selected has arrived.>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>`,
};

// ============================================================================
// 3. 4-STEP MKML SCANNER PIPELINE (PAGES 1 TO 6 OF NOTEBOOK)
// ============================================================================

export function scanChapterStorageAndMarks(
  chapterCode: string,
  ledger: ChapterLedger,
  domains: DomainItem[],
  chapters: ChapterItem[],
  subtopics: SubtopicItem[],
  concepts: ConceptItem[],
  _microConcepts: MicroConceptItem[],
  customMkml?: string
): ScannedChapterTree {
  // STEP 1: Look up Chapter in Registry to identify its Domain
  const chMeta = chapters.find((c) => c.code.toUpperCase() === chapterCode.toUpperCase());
  const domainCode = chMeta ? chMeta.domainCode : chapterCode === 'PN' ? 'Eng' : 'QA';
  const domMeta = domains.find((d) => d.code.toUpperCase() === domainCode.toUpperCase());
  const domainName = domMeta ? domMeta.name : domainCode;
  const chapterName = chMeta ? chMeta.name : ledger.chapterName || chapterCode;
  const chapterId = `${domainCode}-${chapterCode}`;

  const rawMkml = customMkml || CHAPTER_MKML_STORAGE[chapterCode] || '';

  // Flatten all attempts stored in ledger by question ID or positional index so marks.tex stays synced
  const attemptsByUniqueId: Record<string, AttemptTuple[]> = {};
  const orderedLedgerAttempts: AttemptTuple[][] = [];

  Object.entries(ledger.concepts).forEach(([_cKey, qMap]) => {
    Object.entries(qMap).forEach(([qKey, history]) => {
      attemptsByUniqueId[qKey] = history;
      orderedLedgerAttempts.push(history);
    });
  });

  const scannedSubtopics: ScannedSubtopicNode[] = [];
  const allQuestions: ScannedQuestionItem[] = [];

  // STEP 2: Scan for all <Subtopic == ...> ... </Subtopic> blocks first
  const subtopicRegex = /<Subtopic\s*==\s*([^>]+)>([\s\S]*?)<\/Subtopic>/gi;
  let stMatch: RegExpExecArray | null;
  let globalQCursor = 0;

  while ((stMatch = subtopicRegex.exec(rawMkml)) !== null) {
    const rawSubtopicId = stMatch[1].trim(); // e.g. QA-TD-BWR
    const stBody = stMatch[2];

    const stParts = rawSubtopicId.split('-');
    const subtopicShortCode = stParts[stParts.length - 1] || rawSubtopicId;

    // Fetch Subtopic Name from Subtopic Registry
    const regSubtopic = subtopics.find(
      (s) =>
        s.code.toUpperCase() === rawSubtopicId.toUpperCase() ||
        s.code.toUpperCase() === subtopicShortCode.toUpperCase() ||
        (s.chapterCode.toUpperCase() === chapterCode.toUpperCase() &&
          s.code.toUpperCase().includes(subtopicShortCode.toUpperCase()))
    );

    const fallbackStNames: Record<string, string> = {
      BS: 'Basics',
      BWR: 'Basic Work Rates',
      RST: 'Relative Speed & Trains',
      ANG: 'Degree (Allied Angles)',
      PER: 'Personal Pronouns',
      REL: 'Relative Pronouns',
    };

    const subtopicName = regSubtopic
      ? regSubtopic.code
      : fallbackStNames[subtopicShortCode.toUpperCase()] || subtopicShortCode;

    const scannedConcepts: ScannedConceptNode[] = [];
    const subtopicQuestions: ScannedQuestionItem[] = [];

    // STEP 3: Inside each <Subtopic>, scan for <Concept == ...> ... </Concept>
    const conceptRegex = /<Concept\s*==\s*([^>]+)>([\s\S]*?)<\/Concept>/gi;
    let conMatch: RegExpExecArray | null;

    while ((conMatch = conceptRegex.exec(stBody)) !== null) {
      const rawConceptId = conMatch[1].trim(); // e.g. QA-TD-BWR-V1
      const conBody = conMatch[2];

      const conParts = rawConceptId.split('-');
      const conceptShortCode = conParts[conParts.length - 1] || rawConceptId;

      // Scan <MC == ...> step tags inside this Concept
      const mcIds: string[] = [];
      const mcRegex = /<MC\s*==\s*([^>]+)>/gi;
      let mcMatch: RegExpExecArray | null;
      while ((mcMatch = mcRegex.exec(conBody)) !== null) {
        mcIds.push(mcMatch[1].trim());
      }

      // Fetch Concept Name from Concept Registry
      const regConcept = concepts.find(
        (c) =>
          c.code.toUpperCase() === rawConceptId.toUpperCase() ||
          c.code.toUpperCase() === conceptShortCode.toUpperCase()
      );
      const conceptName = regConcept ? regConcept.code : conceptShortCode;

      // STEP 4: Scan all <Qn> ... </Qn> inside <Concept == ...>
      const qnRegex = /<Qn>([\s\S]*?)<\/Qn>/gi;
      let qnMatch: RegExpExecArray | null;
      let qIdxInConcept = 0;
      const conceptQuestions: ScannedQuestionItem[] = [];

      while ((qnMatch = qnRegex.exec(conBody)) !== null) {
        qIdxInConcept++;
        const qnBody = qnMatch[1];

        // Construct or extract Chained Unique Question ID:
        // <DomainCode-ChapterCode-SubtopicCode-ConceptCode-x_n>
        const explicitIdMatch = qnBody.match(/<id\s*==\s*([^>]+)>/i);
        const chainedUniqueId = explicitIdMatch
          ? explicitIdMatch[1].trim()
          : `${domainCode}-${chapterCode}-${subtopicShortCode}-${conceptShortCode}-${qIdxInConcept}`;

        const attempts =
          attemptsByUniqueId[chainedUniqueId] ||
          orderedLedgerAttempts[globalQCursor] ||
          [];
        globalQCursor++;

        const qItem: ScannedQuestionItem = {
          uniqueId: chainedUniqueId,
          questionIndex: qIdxInConcept,
          domainCode,
          chapterCode,
          subtopicId: rawSubtopicId,
          subtopicShortCode,
          conceptId: rawConceptId,
          conceptShortCode,
          microConceptIds: mcIds,
          rawQnBody: qnBody.trim(),
          attempts,
        };

        conceptQuestions.push(qItem);
        subtopicQuestions.push(qItem);
        allQuestions.push(qItem);
      }

      scannedConcepts.push({
        conceptId: rawConceptId,
        conceptCode: conceptShortCode,
        conceptName,
        subtopicId: rawSubtopicId,
        microConceptIds: mcIds,
        questions: conceptQuestions,
      });
    }

    scannedSubtopics.push({
      subtopicId: rawSubtopicId,
      subtopicCode: subtopicShortCode,
      subtopicName,
      concepts: scannedConcepts,
      questions: subtopicQuestions,
    });
  }

  // Fallback if a chapter does not yet have raw MKML <Subtopic == ...> tags:
  // Derive <Subtopic> and <Concept> nodes directly from its Ledger concepts + Registry
  if (scannedSubtopics.length === 0) {
    const chSubtopics = subtopics.filter(
      (s) => s.chapterCode.toUpperCase() === chapterCode.toUpperCase()
    );
    const defaultSubtopicCode = chSubtopics[0]?.code || 'ST1';
    const defaultSubtopicId = `${domainCode}-${chapterCode}-${defaultSubtopicCode.replace(/\s+/g, '')}`;

    const conceptNodes: ScannedConceptNode[] = [];
    const stQuestions: ScannedQuestionItem[] = [];

    Object.entries(ledger.concepts).forEach(([cMid, qMap]) => {
      const cId = `${defaultSubtopicId}-${cMid}`;
      const cQuestions: ScannedQuestionItem[] = [];
      let idx = 0;

      Object.entries(qMap).forEach(([_oldQid, history]) => {
        idx++;
        const uniqueId = `${domainCode}-${chapterCode}-${defaultSubtopicCode.replace(/\s+/g, '')}-${cMid}-${idx}`;
        const item: ScannedQuestionItem = {
          uniqueId,
          questionIndex: idx,
          domainCode,
          chapterCode,
          subtopicId: defaultSubtopicId,
          subtopicShortCode: defaultSubtopicCode,
          conceptId: cId,
          conceptShortCode: cMid,
          microConceptIds: [],
          rawQnBody: `<id == ${uniqueId}>`,
          attempts: history,
        };
        cQuestions.push(item);
        stQuestions.push(item);
        allQuestions.push(item);
      });

      conceptNodes.push({
        conceptId: cId,
        conceptCode: cMid,
        conceptName: cMid,
        subtopicId: defaultSubtopicId,
        microConceptIds: [],
        questions: cQuestions,
      });
    });

    scannedSubtopics.push({
      subtopicId: defaultSubtopicId,
      subtopicCode: defaultSubtopicCode,
      subtopicName: defaultSubtopicCode,
      concepts: conceptNodes,
      questions: stQuestions,
    });
  }

  return {
    domainCode,
    domainName,
    chapterId,
    chapterCode,
    chapterName,
    subtopics: scannedSubtopics,
    allQuestions,
  };
}

// ============================================================================
// 4. FORMATTER FOR SEPARATE marks.tex STORAGE FILE (PAGE 6 OF NOTEBOOK)
// ============================================================================

export function formatMarksTexFile(tree: ScannedChapterTree, timing: ChapterTimingConfig): string {
  const lines: string[] = [
    `# marks.tex — Separate Marks & Attempt Storage for <Chapter == ${tree.chapterId}>`,
    `# Pace Thresholds: Fast <= ${timing.fastLimit}s (+2) | Med <= ${timing.mediumLimit}s (+1) | Slow <= ${timing.slowLimit}s (+0.5)`,
    '',
  ];

  tree.allQuestions.forEach((q) => {
    lines.push('{');
    lines.push(`  unique ID : <${q.uniqueId}>`);
    if (q.attempts.length === 0) {
      lines.push('  # Status: Not Asked Yet (Pending)');
    } else {
      q.attempts.forEach((att, idx) => {
        const [status, seconds, accMark, timeMark] = att;
        const isCorrectStr =
          status === 'C'
            ? `Yes - +${accMark}`
            : status === 'W'
              ? `Wrong - ${accMark}`
              : `Skipped - ${accMark}`;
        const timeStr =
          status === 'C' ? `${seconds}s - +${timeMark}` : `Nil (${seconds}s) - 0`;
        lines.push('  {');
        lines.push(`    A${idx + 1} :`);
        lines.push(`      Is correct - ${isCorrectStr}`);
        lines.push(`      Time       - ${timeStr}`);
        lines.push('  }');
      });
    }
    lines.push('}');
    lines.push('');
  });

  return lines.join('\n');
}

// ============================================================================
// 5. SCOPE METRICS CALCULATOR (DRIVES BOTH TRACKER PAGE 1 & TRACKER PAGE 2)
// ============================================================================

export interface ScopeMetricsResult {
  scopeQuestionsCount: number;
  MMS: number; // Max Marks in Scope = Scope Qs * 3
  LTMS: number; // Lifetime Marks in Scope = ARMNT + NTMS
  availableMarks: number; // MMS - LTMS
  completionPct: number; // Completion % = (LTMS / MMS) * 100
  sharedEffectiveContributionPct: number; // (LTMS / Topic LTM) * 100
  topicWeightagePct: number; // (Scope Qs / Topic Qs) * 100
  NQC: number;
  NQW: number;
  NQS: number;
  NQNA: number;
  attemptedCount: number;
  accuracyPct: number;
  correctMarks: number;
  wrongPenalty: number;
  skipPenalty: number;
  ARMNT: number;
  nFast: number;
  nMed: number;
  nSlow: number;
  nZeroTime: number;
  fastMarks: number;
  medMarks: number;
  slowMarks: number;
  NTMS: number;
}

export function computeScopeMetrics(
  questions: ScannedQuestionItem[],
  timing: ChapterTimingConfig,
  topicTotalQs: number,
  topicTotalLTM: number
): ScopeMetricsResult {
  const scopeQuestionsCount = questions.length;
  let NQC = 0;
  let NQW = 0;
  let NQS = 0;
  let NQNA = 0;

  let nFast = 0;
  let nMed = 0;
  let nSlow = 0;
  let nOverTimeCorrect = 0;

  questions.forEach((q) => {
    if (!q.attempts || q.attempts.length === 0) {
      NQNA++;
      return;
    }
    const latest = q.attempts[q.attempts.length - 1];
    const [status, seconds] = latest;
    if (status === 'C') {
      NQC++;
      if (seconds <= timing.fastLimit) nFast++;
      else if (seconds <= timing.mediumLimit) nMed++;
      else if (seconds <= timing.slowLimit) nSlow++;
      else nOverTimeCorrect++;
    } else if (status === 'W') {
      NQW++;
    } else if (status === 'S') {
      NQS++;
    }
  });

  const attemptedCount = NQC + NQW + NQS;
  const MMS = scopeQuestionsCount * 3;

  const correctMarks = NQC * 1.0;
  const wrongPenalty = NQW * 0.5;
  const skipPenalty = NQS * 0.2;
  const ARMNT = Number((correctMarks - wrongPenalty - skipPenalty).toFixed(2));

  const fastMarks = nFast * 2.0;
  const medMarks = nMed * 1.0;
  const slowMarks = nSlow * 0.5;
  const NTMS = Number((fastMarks + medMarks + slowMarks).toFixed(2));

  const LTMS = Number((ARMNT + NTMS).toFixed(2));
  const availableMarks = Number((MMS - LTMS).toFixed(2));

  const completionPct = MMS > 0 ? (LTMS / MMS) * 100 : 0;
  const sharedEffectiveContributionPct =
    topicTotalLTM > 0 ? (LTMS / topicTotalLTM) * 100 : 0;
  const topicWeightagePct =
    topicTotalQs > 0 ? (scopeQuestionsCount / topicTotalQs) * 100 : 0;

  const accuracyDenominator = attemptedCount > 0 ? attemptedCount : scopeQuestionsCount;
  const accuracyPct = accuracyDenominator > 0 ? (NQC / accuracyDenominator) * 100 : 0;

  // Questions with 0 time marks: skipped + wrong + >slowLimit
  const nZeroTime = NQW + NQS + nOverTimeCorrect;

  return {
    scopeQuestionsCount,
    MMS,
    LTMS,
    availableMarks,
    completionPct,
    sharedEffectiveContributionPct,
    topicWeightagePct,
    NQC,
    NQW,
    NQS,
    NQNA,
    attemptedCount,
    accuracyPct,
    correctMarks,
    wrongPenalty,
    skipPenalty,
    ARMNT,
    nFast,
    nMed,
    nSlow,
    nZeroTime,
    fastMarks,
    medMarks,
    slowMarks,
    NTMS,
  };
}

// ============================================================================
// 6. MICRO CONCEPT / STEP-ID (T1, T2, T3) DIAGNOSTIC & ACCURACY ROLLUP ENGINE
// ============================================================================

export interface ExplanationStepItem {
  stepNumber: number;
  text: string;
  stepId: string; // e.g. T1, T2, T3
}

export const DEFAULT_STEPS_BY_UNIQUE_ID: Record<string, ExplanationStepItem[]> = {
  'QA-TD-BWR-V1-1': [
    {
      stepNumber: 1,
      text: 'Compute speed in km/h using Speed = Distance / Time = 180 / 3 = 60 km/h.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Convert km/h to m/s by multiplying by 5/18: 60 × (5/18) = 16.67 m/s.',
      stepId: 'T2',
    },
  ],
  'QA-TD-BWR-V1-2': [
    {
      stepNumber: 1,
      text: 'At 3/4 of usual speed, time ratio becomes 4/3 of usual time (extra time = 1/3 T).',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Equate extra time (1/3) T = 15 min => Usual Time T = 15 × 3 = 45 min.',
      stepId: 'T3',
    },
  ],
  'QA-TD-BWR-V2-1': [
    {
      stepNumber: 1,
      text: 'Identify equal distance traveled in both directions (x = 40 km/h, y = 60 km/h).',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Apply Harmonic Mean formula: Average Speed = 2xy / (x + y) = (2 × 40 × 60) / 100 = 48 km/h.',
      stepId: 'T2',
    },
  ],
  'QA-TD-RST-V1-1': [
    {
      stepNumber: 1,
      text: 'Total crossing distance = Sum of train lengths = 120 m + 180 m = 300 m.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Opposite direction Relative Speed = (50 + 40) = 90 km/h = 90 × (5/18) = 25 m/s.',
      stepId: 'T2',
    },
    {
      stepNumber: 3,
      text: 'Crossing Time = Total Distance / Relative Speed = 300 / 25 = 12 s.',
      stepId: 'T3',
    },
  ],
  'QA-TD-RST-V1-2': [
    {
      stepNumber: 1,
      text: 'Extra time (25s - 15s = 10s) covers the 100m platform => Train Speed = 100 / 10 = 10 m/s.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Length of train = Speed × Pole crossing time = 10 m/s × 15 s = 150 m.',
      stepId: 'T2',
    },
  ],
  'QA-TD-RST-V1-3': [
    {
      stepNumber: 1,
      text: 'After meeting, time taken to reach destinations is t1 = 4h and t2 = 9h.',
      stepId: 'T2',
    },
    {
      stepNumber: 2,
      text: 'Apply Meet-Time Speed Ratio formula: S1 / S2 = sqrt(t2 / t1) = sqrt(9 / 4) = 3 : 2.',
      stepId: 'T3',
    },
  ],
  // ==========================================================================
  // TRIGONOMETRY (QA-TRG-BS-FR-1 .. 23) FROM 18-PAGE NOTEBOOK PDF
  // ==========================================================================
  'QA-TRG-BS-FR-1': [
    {
      stepNumber: 1,
      text: 'tan A = 4/3 => oppo = 4, Adj = 3.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: '3 is odd: 3² / 2 = 9/2 = 4.5 -> 4 (oppo) and 5 (hypo) match triplet (3, 4, 5).',
      stepId: 'T2',
    },
    {
      stepNumber: 3,
      text: 'sin A = oppo / hypo = 4 / 5.',
      stepId: 'T1',
    },
  ],
  'QA-TRG-BS-FR-2': [
    {
      stepNumber: 1,
      text: 'sin θ = 9/41 => 9 (oppo) is odd: 9² = 81 -> 81/2 = 40.5 -> 40 (adj), 41 (hypo).',
      stepId: 'T2',
    },
    {
      stepNumber: 2,
      text: 'cot θ = adj / oppo = 40 / 9.',
      stepId: 'T1',
    },
  ],
  'QA-TRG-BS-FR-3': [
    {
      stepNumber: 1,
      text: 'tan A = 2/5 => oppo = 2, Adj = 5.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'hypo = √(2² + 5²) = √29.',
      stepId: 'TG',
    },
    {
      stepNumber: 3,
      text: 'sec²A = (hypo / Adj)² = 29 / 25.',
      stepId: 'T1',
    },
    {
      stepNumber: 4,
      text: 'cosec²A = (hypo / oppo)² = 29 / 4.',
      stepId: 'T1',
    },
    {
      stepNumber: 5,
      text: 'sec²A / cosec²A = (29 / 25) × (4 / 29) = 4 / 25.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-4': [
    {
      stepNumber: 1,
      text: 'sin β = 1/3 => oppo = 1, hypo = 3.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Adj = √(3² - 1²) = √8.',
      stepId: 'T2',
    },
    {
      stepNumber: 3,
      text: '(sec β - tan β)³ = (3/√8 - 1/√8)³ = (2/√8)³ = 8 / (8√8) = 1 / √8.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-5': [
    {
      stepNumber: 1,
      text: 'cos θ = √3 / 2 => adj = √3, hypo = 2 => oppo = 1.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'tan²θ × cos²θ = (1/√3)² × (√3/2)² = (1/3) × (3/4) = 1/4.',
      stepId: 'T1',
    },
  ],
  'QA-TRG-BS-FR-6': [
    {
      stepNumber: 1,
      text: '5 sin θ - 4 cos θ = 0 => sin θ / cos θ = 4 / 5 (take sin θ = 4, cos θ = 5).',
      stepId: 'TG',
    },
    {
      stepNumber: 2,
      text: '[5(4) + 2(5)] / [5(4) + 3(5)] = 30 / 35 = 6 / 7.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-7': [
    {
      stepNumber: 1,
      text: 'tan θ = 3/4 => oppo = 3, adj = 4, hypo = 5.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: '(1 + sin θ) / (1 - sin θ) = (1 + 3/5) / (1 - 3/5) = (8/5) × (5/2) = 8/2 = 4.',
      stepId: 'T1',
    },
  ],
  'QA-TRG-BS-FR-8': [
    {
      stepNumber: 1,
      text: '5 cot θ = 3 => 5(cos θ / sin θ) = 3 => cos θ = 3, sin θ = 5.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: '[6(5) - 3(3)] / [7(5) + 3(3)] = (30 - 9) / (35 + 9) = 21 / 44.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-9': [
    {
      stepNumber: 1,
      text: 'sin A = 2/5 => oppo = 2, hypo = 5 => adj = √21.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'cos A = √21 / 5 => sec A = 5 / √21, cosec A = 5 / 2.',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: '[5(2/5) + 2(5/2)] / [√21 × (5/√21)] = (2 + 5) / 5 = 7 / 5.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-10': [
    {
      stepNumber: 1,
      text: 'sec A = 17/8 => cos A = 8/17, sin A = 15/17 (8-15-17 triplet).',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'tan A = 15/8, cot A = 8/15.',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: '[34(15/17) + 15(8/15)] / [68(8/17) - 16(15/8)] = (30 + 8) / (32 - 30) = 38 / 2 = 19.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-11': [
    {
      stepNumber: 1,
      text: '(3 sin θ - cos θ) / (cos θ + sin θ) = 1 => 3 sin θ - cos θ = cos θ + sin θ => sin θ = 1, cos θ = 1 => tan θ = 1.',
      stepId: 'TG',
    },
    {
      stepNumber: 2,
      text: 'cot θ = 1 / tan θ = 1.',
      stepId: 'T1',
    },
  ],
  'QA-TRG-BS-FR-12': [
    {
      stepNumber: 1,
      text: '(sin θ - cos θ) / (sin θ + cos θ) = 4/5 => sin θ = 9, cos θ = 1 => tan θ = 9.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'hypo = √(9² + 1²) = √82 => cosec²θ = 82 / 81.',
      stepId: 'T2',
    },
    {
      stepNumber: 3,
      text: '(82/81) / (2 - 82/81) = (82/81) × (81/80) = 41 / 40.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-13': [
    {
      stepNumber: 1,
      text: 'sec θ = a/b => hypo = a, adj = b.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'oppo = √(a² - b²).',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: 'Substitute tan²θ = (a² - b²)/b² and sin²θ = (a² - b²)/a² into [1 - (a² - b²)/b²] / [2 - (a² - b²)/a²].',
      stepId: 'T1',
    },
    {
      stepNumber: 4,
      text: 'Simplify numerator and denominator: [(2b² - a²) / b²] × [a² / (a² + b²)].',
      stepId: 'TG',
    },
    {
      stepNumber: 5,
      text: 'Final expression = a²(2b² - a²) / [b²(a² + b²)].',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-14': [
    {
      stepNumber: 1,
      text: 'sin²θ / (tan²θ - sin²θ) = 5 => 6 sin²θ = 5(sin²θ / cos²θ) => cos²θ = 5/6.',
      stepId: 'TG',
    },
    {
      stepNumber: 2,
      text: 'cos θ = √5 / √6 => adj = √5, hypo = √6, oppo = 1.',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: '[24(1/6) - 15(6/5)] / [6(6/1) - 7(5/1)] = (4 - 18) / (36 - 35).',
      stepId: 'TG',
    },
    {
      stepNumber: 4,
      text: '-14 / 1 = -14.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-15': [
    {
      stepNumber: 1,
      text: '(sec θ - tan θ) / (sec θ + tan θ) = 1/7 => 6 sec θ = 8 tan θ => 3(1/cos θ) = 4(sin θ / cos θ).',
      stepId: 'TG',
    },
    {
      stepNumber: 2,
      text: 'sin θ = 3/4 => oppo = 3, hypo = 4.',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: 'Adj = √(4² - 3²) = √7 => cosec θ = 4/3, cot²θ = 7/9.',
      stepId: 'T1',
    },
    {
      stepNumber: 4,
      text: '(4/3 + 7/9) / (4/3 - 7/9) = (19/9) × (9/5).',
      stepId: 'TG',
    },
    {
      stepNumber: 5,
      text: 'Final value = 19 / 5.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-16': [
    {
      stepNumber: 1,
      text: 'tan A = 1 / √3 => oppo = 1, Adj = √3, hypo = 2.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'sin A = 1/2, cos A = √3/2; from vertex C: cos C = 1/2, sin C = √3/2.',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: 'sin A cos C + cos A sin C = (1/2)(1/2) + (√3/2)(√3/2) = 1/4 + 3/4 = 1.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-17': [
    {
      stepNumber: 1,
      text: 'tan A = 1/2 => oppo = 1, adj = 2 => hypo = √5.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'sin A = 1/√5, cos A = 2/√5; switching to vertex C: sin C = 2/√5, cos C = 1/√5.',
      stepId: 'T3',
    },
    {
      stepNumber: 3,
      text: '[(1/√5)(1/√5 + 2/√5)] / [(1/√5)(2/√5 - 1/√5)] = (3/5) × (5/1) = 3.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-18': [
    {
      stepNumber: 1,
      text: 'In ΔABC (∠B = 90°), AB = 1, BC = 2 => hypo AC = √5 => cos A = 1/√5.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'From vertex C, opposite = AB = 1, adjacent = BC = 2 => tan C = 1/2.',
      stepId: 'T3',
    },
    {
      stepNumber: 3,
      text: 'cos A + tan C = 1/√5 + 1/2 = (2 + √5) / (2√5).',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-19': [
    {
      stepNumber: 1,
      text: 'sin A = 5/13 => oppo = 5, hypo = 13, Adj = 12; 7 cot B = 24 => cot B = 24/7 (7-24-25 triangle).',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Extract ratios for distinct angles A and B: sec A = 13/12, cos B = 24/25, cosec B = 25/7, tan A = 5/12.',
      stepId: 'T3',
    },
    {
      stepNumber: 3,
      text: '(13/12 × 24/25) × (25/7 × 5/12) = (13/6) × (5/7) = 65 / 42.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-20': [
    {
      stepNumber: 1,
      text: 'sin 23° = a/b => oppo = a, hypo = b, adj = √(b² - a²) => sec 23° = b / √(b² - a²).',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'From complementary angle 67° (= 90° - 23°), sin 67° = √(b² - a²) / b.',
      stepId: 'T3',
    },
    {
      stepNumber: 3,
      text: 'sec 23° - sin 67° = [b² - (b² - a²)] / [b √(b² - a²)] = a² / [b √(b² - a²)].',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-21': [
    {
      stepNumber: 1,
      text: 'sec 31° = x => hypo = x, adj = 1, oppo = √(x² - 1) in right triangle with angles 31° and 59°.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'From complementary vertex 59°, sin 59° = 1 / x.',
      stepId: 'T3',
    },
    {
      stepNumber: 3,
      text: 'sin² 59° = 1 / x².',
      stepId: 'T1',
    },
    {
      stepNumber: 4,
      text: '1 / sec² 31° = cos² 31° = 1 / x².',
      stepId: 'T1',
    },
    {
      stepNumber: 5,
      text: '1 / (sin² 59° cosec² 59°) = cosec² 59° / cosec² 59° = 1.',
      stepId: 'T1',
    },
    {
      stepNumber: 6,
      text: '1/x² + 1/x² - 1 = 2/x² - 1 = (2 - x²) / x².',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-22': [
    {
      stepNumber: 1,
      text: 'tan B = 5/3 => oppo = 5, Adj = 3 => hypo = √34.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Substitute ratios: (√34/5 + 5/√34) / (3/√34 - √34/3).',
      stepId: 'TG',
    },
    {
      stepNumber: 3,
      text: '[59 / (5√34)] × [3√34 / (-25)] = -177 / 125.',
      stepId: 'TG',
    },
  ],
  'QA-TRG-BS-FR-23': [
    {
      stepNumber: 1,
      text: 'cos θ = 12/13 => Adj = 12, hypo = 13, oppo = 5.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'sin θ = 5/13, tan θ = 5/12, cosec θ = 13/5.',
      stepId: 'T1',
    },
    {
      stepNumber: 3,
      text: '[(5/13)(1 - 5/12)] / [(5/12)(1 + 13/5)] = [(5/13)(7/12)] / [(5/12)(18/5)] = (5/13) × (7/12) × (12/18) = 35 / 234.',
      stepId: 'TG',
    },
  ],
};

export function getQuestionExplanationSteps(
  uniqueId: string,
  customStepsByQid?: Record<string, ExplanationStepItem[]>
): ExplanationStepItem[] {
  if (customStepsByQid && customStepsByQid[uniqueId] && customStepsByQid[uniqueId].length > 0) {
    return customStepsByQid[uniqueId];
  }
  if (DEFAULT_STEPS_BY_UNIQUE_ID[uniqueId]) {
    return DEFAULT_STEPS_BY_UNIQUE_ID[uniqueId];
  }
  return [
    {
      stepNumber: 1,
      text: 'Apply primary domain relation to isolate target variable.',
      stepId: 'T1',
    },
    {
      stepNumber: 2,
      text: 'Substitute given values and simplify to final answer.',
      stepId: 'T2',
    },
  ];
}

export function getStructuralQuestionIdFromSteps(
  stepsOrUniqueId: ExplanationStepItem[] | string,
  customStepsByQid?: Record<string, ExplanationStepItem[]>
): string {
  const steps = Array.isArray(stepsOrUniqueId)
    ? stepsOrUniqueId
    : getQuestionExplanationSteps(stepsOrUniqueId, customStepsByQid);
  const ids = steps.map((s) => s.stepId.trim()).filter(Boolean);
  return ids.length > 0 ? ids.join('-') : 'T1';
}

export interface MicroConceptInvolvedQuestion {
  uniqueId: string;
  subtopicCode: string;
  conceptCode: string;
  status: 'C' | 'W' | 'S' | 'NA';
  totalMark: number;
  stepChainId: string;
}

export interface MicroConceptDiagnosticRow {
  microConceptId: string; // e.g. QA-TD-T1
  stepCode: string; // e.g. T1, T2, T3
  stepName: string; // From Micro Concept Registry Page 5
  involvedQuestions: MicroConceptInvolvedQuestion[];
  involvedQuestionsCount: number;
  attemptedQuestionsCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  unattemptedCount: number;
  correctToWrongRatioLabel: string;
  rawAccuracyPct: number; // (C / Attempted) * 100
  wrongRatePct: number; // (W / Attempted) * 100
  netAccuracyMarks: number; // C*1.0 - W*0.5 - S*0.2
  netAccuracyValuationPct: number; // (netAccuracyMarks / Attempted) * 100
  diagnosticStatus: 'WEAK STEP' | 'MODERATE' | 'STRONG' | 'UNATTEMPTED';
}

export function computeMicroConceptDiagnostics(
  questions: ScannedQuestionItem[],
  microConcepts: MicroConceptItem[],
  chapterCode: string,
  customStepsByQid?: Record<string, ExplanationStepItem[]>,
  attemptSelector: 'latest' | 'first' = 'latest'
): MicroConceptDiagnosticRow[] {
  const stepMap = new Map<string, MicroConceptInvolvedQuestion[]>();

  questions.forEach((q) => {
    const steps = getQuestionExplanationSteps(q.uniqueId, customStepsByQid);
    const stepChainId = getStructuralQuestionIdFromSteps(steps);

    // Deduplicate stepIds within the same question so a question is counted once per stepId it uses
    const uniqueStepIdsInQuestion = Array.from(
      new Set(steps.map((s) => s.stepId.trim().toUpperCase()).filter(Boolean))
    );

    let status: 'C' | 'W' | 'S' | 'NA' = 'NA';
    let totalMark = 0;
    if (q.attempts && q.attempts.length > 0) {
      const tuple =
        attemptSelector === 'first' ? q.attempts[0] : q.attempts[q.attempts.length - 1];
      status = tuple[0];
      totalMark = Number(((tuple[2] || 0) + (tuple[3] || 0)).toFixed(2));
    }

    uniqueStepIdsInQuestion.forEach((stepCode) => {
      const list = stepMap.get(stepCode) || [];
      list.push({
        uniqueId: q.uniqueId,
        subtopicCode: q.subtopicShortCode,
        conceptCode: q.conceptShortCode,
        status,
        totalMark,
        stepChainId,
      });
      stepMap.set(stepCode, list);
    });
  });

  const rows: MicroConceptDiagnosticRow[] = [];

  stepMap.forEach((involvedQuestions, stepCode) => {
    const involvedQuestionsCount = involvedQuestions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let unattemptedCount = 0;

    involvedQuestions.forEach((iq) => {
      if (iq.status === 'C') correctCount++;
      else if (iq.status === 'W') wrongCount++;
      else if (iq.status === 'S') skippedCount++;
      else unattemptedCount++;
    });

    const attemptedQuestionsCount = correctCount + wrongCount + skippedCount;
    const rawAccuracyPct =
      attemptedQuestionsCount > 0 ? (correctCount / attemptedQuestionsCount) * 100 : 0;
    const wrongRatePct =
      attemptedQuestionsCount > 0 ? (wrongCount / attemptedQuestionsCount) * 100 : 0;
    const netAccuracyMarks = Number(
      (correctCount * 1.0 - wrongCount * 0.5 - skippedCount * 0.2).toFixed(2)
    );
    const netAccuracyValuationPct =
      attemptedQuestionsCount > 0 ? (netAccuracyMarks / attemptedQuestionsCount) * 100 : 0;

    // Lookup description from Micro Concept Registry Page 5
    const regMatch =
      microConcepts.find(
        (mc) =>
          mc.chapterCode.toLowerCase() === chapterCode.toLowerCase() &&
          mc.shortCode.toLowerCase() === stepCode.toLowerCase()
      ) ||
      microConcepts.find((mc) => mc.shortCode.toLowerCase() === stepCode.toLowerCase());

    const stepName = regMatch ? regMatch.code : `Step ${stepCode} Operation`;
    const microConceptId = regMatch
      ? `${regMatch.domainCode}-${regMatch.chapterCode}-${stepCode}`
      : `QA-${chapterCode}-${stepCode}`;

    let diagnosticStatus: 'WEAK STEP' | 'MODERATE' | 'STRONG' | 'UNATTEMPTED' = 'UNATTEMPTED';
    if (attemptedQuestionsCount > 0) {
      if (rawAccuracyPct <= 60 || (wrongCount > 0 && rawAccuracyPct < 75)) {
        diagnosticStatus = 'WEAK STEP';
      } else if (rawAccuracyPct < 85) {
        diagnosticStatus = 'MODERATE';
      } else {
        diagnosticStatus = 'STRONG';
      }
    }

    rows.push({
      microConceptId,
      stepCode,
      stepName,
      involvedQuestions,
      involvedQuestionsCount,
      attemptedQuestionsCount,
      correctCount,
      wrongCount,
      skippedCount,
      unattemptedCount,
      correctToWrongRatioLabel: `${correctCount} C : ${wrongCount} W`,
      rawAccuracyPct,
      wrongRatePct,
      netAccuracyMarks,
      netAccuracyValuationPct,
      diagnosticStatus,
    });
  });

  // Sort by stepCode (T1, T2, T3...)
  rows.sort((a, b) => a.stepCode.localeCompare(b.stepCode, undefined, { numeric: true }));
  return rows;
}


