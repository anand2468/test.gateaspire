import { Question, TestConfig } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // CS - Algorithms
  {
    id: 'gate-cs-2024-q1',
    questionText: 'Consider an array A of n distinct integers. What is the time complexity of the best algorithm to find the maximum and minimum elements using the minimum number of comparisons?',
    type: 'MCQ',
    options: [
      'A: O(n) using 3n/2 comparisons',
      'B: O(n log n) using n log n comparisons',
      'C: O(n) using 2n - 2 comparisons',
      'D: O(n²) using n²/2 comparisons'
    ],
    correctAnswers: ['A'],
    subject: 'Algorithms',
    topic: 'Divide and Conquer',
    branch: 'CS',
    year: 2024,
    mark: 1,
    explanation: 'Using Divide & Conquer or pairwise comparison, we compare elements in pairs. For n elements, this takes ⌈3n/2⌉ - 2 comparisons, which is O(n).',
    createdAt: '2024-02-10T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'gate-cs-2023-q2',
    questionText: 'Let G = (V, E) be a connected undirected graph with weighted edges. Which of the following statements is/are CORRECT regarding Minimum Spanning Trees (MST)?',
    type: 'MSQ',
    options: [
      'A: If all edge weights are distinct, then the MST of G is unique.',
      'B: The shortest path between two vertices u and v in G is always present in every MST of G.',
      'C: If the weight of an edge e is reduced, the MST of G may or may not change.',
      'D: Kruskal\'s algorithm always finds an MST in O(|E| log |V|) time.'
    ],
    correctAnswers: ['A', 'C', 'D'],
    subject: 'Algorithms',
    topic: 'Graph Algorithms',
    branch: 'CS',
    year: 2023,
    mark: 2,
    explanation: 'A is correct: Distinct edge weights guarantee a unique MST. B is incorrect: Shortest path in graph is NOT necessarily part of MST (MST minimizes sum, not pairwise distance). C is correct: Reducing weight might make e part of MST or leave MST unchanged. D is correct: Sorting edges takes O(E log E) = O(E log V) using Union-Find.',
    createdAt: '2023-02-11T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'gate-cs-2024-nat1',
    questionText: 'Consider a hash table with 10 slots using open addressing with linear probing and hash function h(k) = k mod 10. The sequence of keys inserted is: 42, 23, 34, 52, 46. What is the index of key 46 in the hash table?',
    type: 'NAT',
    correctAnswers: ['6'],
    natMin: 6,
    natMax: 6,
    subject: 'Data Structures',
    topic: 'Hashing',
    branch: 'CS',
    year: 2024,
    mark: 2,
    explanation: 'h(42) = 2 (slot 2). h(23) = 3 (slot 3). h(34) = 4 (slot 4). h(52) = 2 (collision! probes slot 3, 4, 5 -> placed in slot 5). h(46) = 6 (slot 6 is empty -> placed in slot 6). Answer is 6.',
    createdAt: '2024-02-10T10:00:00Z',
    status: 'approved'
  },
  // CS - Operating Systems
  {
    id: 'gate-cs-2022-os1',
    questionText: 'In a virtual memory system using demand paging with LRU page replacement algorithm, a process accesses pages in the following sequence:\n1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6.\nCalculate the total number of page faults if the process is allocated 3 frames initially empty.',
    type: 'NAT',
    correctAnswers: ['15'],
    natMin: 15,
    natMax: 15,
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Page Replacement',
    branch: 'CS',
    year: 2022,
    mark: 2,
    explanation: 'Tracing LRU with 3 frames step by step yields 15 page faults.',
    createdAt: '2022-02-05T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'gate-cs-2023-os2',
    questionText: 'Consider a system with 4 processes (P1, P2, P3, P4) and 3 resource types (R1, R2, R3). Which of the following conditions is necessary for a deadlock to occur?',
    type: 'MSQ',
    options: [
      'A: Mutual Exclusion',
      'B: Hold and Wait',
      'C: Preemption of resources',
      'D: Circular Wait'
    ],
    correctAnswers: ['A', 'B', 'D'],
    subject: 'Operating Systems',
    topic: 'Deadlocks',
    branch: 'CS',
    year: 2023,
    mark: 1,
    explanation: 'The Coffman conditions for deadlock are: Mutual Exclusion, Hold & Wait, No Preemption (NOT Preemption!), and Circular Wait.',
    createdAt: '2023-02-11T10:00:00Z',
    status: 'approved'
  },
  // CS - Computer Networks
  {
    id: 'gate-cs-2024-cn1',
    questionText: 'An IP packet with a total length of 4000 bytes (including a 20-byte IP header) travels through a router towards a network with Maximum Transmission Unit (MTU) of 1500 bytes. What is the total length field value in the second fragment?',
    type: 'NAT',
    correctAnswers: ['1500'],
    natMin: 1500,
    natMax: 1500,
    subject: 'Computer Networks',
    topic: 'IP Addressing & Fragmentation',
    branch: 'CS',
    year: 2024,
    mark: 2,
    explanation: 'Data size = 4000 - 20 = 3980 bytes. Max payload per frame = 1500 - 20 = 1480 bytes (multiple of 8). Frag 1: 1480 data + 20 hdr = 1500 bytes. Frag 2: 1480 data + 20 hdr = 1500 bytes. Frag 3: remaining 1020 data + 20 hdr = 1040 bytes. Total length of 2nd fragment is 1500.',
    createdAt: '2024-02-10T10:00:00Z',
    status: 'approved'
  },
  // CS - DBMS
  {
    id: 'gate-cs-2023-dbms1',
    questionText: 'Let R(A, B, C, D, E) be a relational schema with functional dependencies F = { A -> BC, CD -> E, B -> D, E -> A }. What is the candidate key(s) of R?',
    type: 'MSQ',
    options: [
      'A: {A}',
      'B: {E}',
      'C: {B, C}',
      'D: {C, D}'
    ],
    correctAnswers: ['A', 'B', 'C'],
    subject: 'Database Management Systems',
    topic: 'Normalization & Functional Dependencies',
    branch: 'CS',
    year: 2023,
    mark: 2,
    explanation: 'A+ = {A,B,C,D,E} -> A is a candidate key.\nE+ = {E,A,B,C,D} -> E is a candidate key.\n(BC)+ = {B,C,D,E,A} -> BC is a candidate key.\n(CD)+ = {C,D,E,A,B} wait! CD+ = {C,D,E,A,B} -> CD is also tested: C+D+ = {C,D,E,A,B}? E->A, CD->E. So (CD)+ contains E, A, B. Since B->D, BC+ is minimal, CD contains D which B->D doesn\'t derive C alone. So candidate keys are A, E, BC, CD. Here options A, B, C are correct candidate keys.',
    createdAt: '2023-02-11T10:00:00Z',
    status: 'approved'
  },
  // CS - Theory of Computation
  {
    id: 'gate-cs-2024-toc1',
    questionText: 'Which of the following language problems is UNDECIDABLE?',
    type: 'MCQ',
    options: [
      'A: Emptiness problem for Finite Automata (DFA)',
      'B: Membership problem for Context-Free Grammars (CFG)',
      'C: Ambiguity problem for Context-Free Grammars (CFG)',
      'D: Equivalence problem for Deterministic Finite Automata (DFA)'
    ],
    correctAnswers: ['C'],
    subject: 'Theory of Computation',
    topic: 'Decidability & Complexity',
    branch: 'CS',
    year: 2024,
    mark: 1,
    explanation: 'The ambiguity problem for Context-Free Grammars (CFG) is undecidable via reduction from Post Correspondence Problem (PCP). DFA emptiness, CFG membership (CYK algorithm), and DFA equivalence are all decidable.',
    createdAt: '2024-02-10T10:00:00Z',
    status: 'approved'
  },
  // ECE - Signals & Systems
  {
    id: 'gate-ece-2023-q1',
    questionText: 'The continuous-time Fourier transform of x(t) = e^(-3t) u(t) is X(ω). Evaluate the magnitude |X(ω)| at ω = 4 rad/s.',
    type: 'NAT',
    correctAnswers: ['0.2'],
    natMin: 0.19,
    natMax: 0.21,
    subject: 'Signals and Systems',
    topic: 'Fourier Transform',
    branch: 'ECE',
    year: 2023,
    mark: 2,
    explanation: 'X(ω) = 1 / (3 + jω). Magnitude |X(ω)| = 1 / √(3² + ω²). For ω = 4, |X(4)| = 1 / √(9 + 16) = 1 / √25 = 1/5 = 0.20.',
    createdAt: '2023-02-05T10:00:00Z',
    status: 'approved'
  },
  // ME - Thermodynamics
  {
    id: 'gate-me-2024-q1',
    questionText: 'A Carnot engine operates between two thermal reservoirs at temperatures 800 K and 300 K. If the engine receives 100 kW of heat from the high-temperature reservoir, the power output (in kW) of the engine is:',
    type: 'NAT',
    correctAnswers: ['62.5'],
    natMin: 62.0,
    natMax: 63.0,
    subject: 'Thermodynamics',
    topic: 'Second Law & Carnot Cycle',
    branch: 'ME',
    year: 2024,
    mark: 2,
    explanation: 'Carnot Efficiency η = 1 - T_low / T_high = 1 - 300 / 800 = 1 - 0.375 = 0.625 (62.5%). Power Output W = η × Q_in = 0.625 × 100 kW = 62.5 kW.',
    createdAt: '2024-02-04T10:00:00Z',
    status: 'approved'
  },
  // General Aptitude
  {
    id: 'gate-ga-2024-q1',
    questionText: 'Complete the logical sentence: "The committee members could not reach a consensus; ______, the meeting was adjourned without a final decision."',
    type: 'MCQ',
    options: [
      'A: Consequently',
      'B: Nevertheless',
      'C: In contrast',
      'D: On the contrary'
    ],
    correctAnswers: ['A'],
    subject: 'General Aptitude',
    topic: 'Verbal Ability',
    branch: 'GA',
    year: 2024,
    mark: 1,
    explanation: '"Consequently" expresses cause and effect: failure to reach consensus caused the meeting to adjourn.',
    createdAt: '2024-02-10T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'gate-ga-2023-q2',
    questionText: 'If 6 men or 8 women can complete a piece of work in 12 days, how many days will 3 men and 4 women take to complete the same work?',
    type: 'NAT',
    correctAnswers: ['12'],
    natMin: 12,
    natMax: 12,
    subject: 'General Aptitude',
    topic: 'Quantitative Aptitude',
    branch: 'GA',
    year: 2023,
    mark: 2,
    explanation: '6 men = 8 women => 1 man = 4/3 women. 3 men + 4 women = 3*(4/3) + 4 = 4 + 4 = 8 women. Since 8 women take 12 days, 8 women will also take 12 days!',
    createdAt: '2023-02-11T10:00:00Z',
    status: 'approved'
  }
];

export const MOCK_TEST_SERIES: TestConfig[] = [
  {
    id: 'test-cs-full-2025-1',
    title: 'GATE CS Full Length Mock Test 1',
    description: 'Comprehensive 15-question mini full length test covering all core Computer Science subjects & Aptitude with GATE marking rules.',
    subject: 'All CS Subjects',
    branch: 'CS',
    type: 'Full Mock',
    durationMinutes: 30,
    questionIds: ['gate-cs-2024-q1', 'gate-cs-2023-q2', 'gate-cs-2024-nat1', 'gate-cs-2022-os1', 'gate-cs-2023-os2', 'gate-cs-2024-cn1', 'gate-cs-2023-dbms1', 'gate-cs-2024-toc1', 'gate-ga-2024-q1', 'gate-ga-2023-q2'],
    totalMarks: 18
  },
  {
    id: 'test-cs-algo-sub-1',
    title: 'Algorithms & Data Structures Speed Test',
    description: 'Topic & subject test focused on Graph Algorithms, Divide & Conquer, and Hashing.',
    subject: 'Algorithms',
    topic: 'Divide & Conquer & Graphs',
    branch: 'CS',
    type: 'Subject Test',
    durationMinutes: 15,
    questionIds: ['gate-cs-2024-q1', 'gate-cs-2023-q2', 'gate-cs-2024-nat1'],
    totalMarks: 5
  },
  {
    id: 'test-cs-os-topic-1',
    title: 'Operating Systems - Virtual Memory & Deadlocks',
    description: 'Targeted topic test covering LRU Page Replacement and Deadlock conditions.',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Deadlocks',
    branch: 'CS',
    type: 'Topic Test',
    durationMinutes: 10,
    questionIds: ['gate-cs-2022-os1', 'gate-cs-2023-os2'],
    totalMarks: 3
  },
  {
    id: 'test-ece-signals-1',
    title: 'ECE Signals & Systems Core Practice',
    description: 'Specialized test for ECE aspirants focusing on Fourier Transform, Laplace & System properties.',
    subject: 'Signals and Systems',
    branch: 'ECE',
    type: 'Subject Test',
    durationMinutes: 10,
    questionIds: ['gate-ece-2023-q1'],
    totalMarks: 2
  },
  {
    id: 'test-me-thermo-1',
    title: 'ME Thermodynamics & Thermal Systems',
    description: 'Practice questions for Mechanical Engineering GATE.',
    subject: 'Thermodynamics',
    branch: 'ME',
    type: 'Subject Test',
    durationMinutes: 10,
    questionIds: ['gate-me-2024-q1'],
    totalMarks: 2
  }
];
