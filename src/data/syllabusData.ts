export interface TopicItem {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'pyqs_done' | 'revised_1' | 'mastered';
  weightageHint?: string;
}

export interface SubjectSyllabus {
  id: string;
  name: string;
  estimatedMarks: number;
  topics: TopicItem[];
}

export const BRANCH_SYLLABUS: Record<string, SubjectSyllabus[]> = {
  CS: [
    {
      id: 'cs_ga',
      name: 'General Aptitude',
      estimatedMarks: 15,
      topics: [
        { id: 'cs_ga_1', name: 'Verbal Ability & Grammar', status: 'not_started' },
        { id: 'cs_ga_2', name: 'Numerical Ability & Data Interpretation', status: 'not_started' },
        { id: 'cs_ga_3', name: 'Analytical & Spatial Aptitude', status: 'not_started' }
      ]
    },
    {
      id: 'cs_math',
      name: 'Engineering Mathematics & Discrete Math',
      estimatedMarks: 13,
      topics: [
        { id: 'cs_m_1', name: 'Mathematical Logic & Propositional Logic', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_m_2', name: 'Sets, Relations, Functions & Partial Orders', status: 'not_started' },
        { id: 'cs_m_3', name: 'Group Theory & Combinatorics', status: 'not_started' },
        { id: 'cs_m_4', name: 'Graph Theory & Planarity', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_m_5', name: 'Linear Algebra (Matrices & Eigenvalues)', status: 'not_started' },
        { id: 'cs_m_6', name: 'Calculus (Limits, Continuity, Integrals)', status: 'not_started' },
        { id: 'cs_m_7', name: 'Probability & Distributions (Bayes, Conditional)', status: 'not_started', weightageHint: 'High Weightage' }
      ]
    },
    {
      id: 'cs_ds_algo',
      name: 'Data Structures & Algorithms',
      estimatedMarks: 16,
      topics: [
        { id: 'cs_dsa_1', name: 'Arrays, Stacks, Queues, Linked Lists', status: 'not_started' },
        { id: 'cs_dsa_2', name: 'Trees, Binary Search Trees & Heaps', status: 'not_started', weightageHint: 'Core' },
        { id: 'cs_dsa_3', name: 'Graph Traversals (BFS, DFS, Shortest Path)', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_dsa_4', name: 'Asymptotic Analysis & Recurrences', status: 'not_started' },
        { id: 'cs_dsa_5', name: 'Divide & Conquer, Greedy Algorithms', status: 'not_started' },
        { id: 'cs_dsa_6', name: 'Dynamic Programming & NP-Completeness', status: 'not_started', weightageHint: 'High Weightage' }
      ]
    },
    {
      id: 'cs_toc_compiler',
      name: 'Theory of Computation & Compiler Design',
      estimatedMarks: 14,
      topics: [
        { id: 'cs_tc_1', name: 'Finite Automata (DFA, NFA) & Regular Expressions', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_tc_2', name: 'Context-Free Grammars & Pushdown Automata', status: 'not_started' },
        { id: 'cs_tc_3', name: 'Turing Machines & Decidability', status: 'not_started' },
        { id: 'cs_tc_4', name: 'Lexical Analysis & Parsing (LL, LR)', status: 'not_started', weightageHint: 'Core' },
        { id: 'cs_tc_5', name: 'Syntax Directed Translation & Intermediate Code', status: 'not_started' },
        { id: 'cs_tc_6', name: 'Code Optimization & Runtime Environments', status: 'not_started' }
      ]
    },
    {
      id: 'cs_os',
      name: 'Operating Systems',
      estimatedMarks: 10,
      topics: [
        { id: 'cs_os_1', name: 'Processes, Threads & CPU Scheduling', status: 'not_started' },
        { id: 'cs_os_2', name: 'Process Synchronization & Semaphores', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_os_3', name: 'Deadlocks (Prevention, Avoidance, Bankers)', status: 'not_started' },
        { id: 'cs_os_4', name: 'Memory Management & Virtual Memory (Paging)', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_os_5', name: 'File Systems & Disk Scheduling', status: 'not_started' }
      ]
    },
    {
      id: 'cs_dbms',
      name: 'Database Management Systems (DBMS)',
      estimatedMarks: 8,
      topics: [
        { id: 'cs_db_1', name: 'ER-Model & Relational Algebra', status: 'not_started' },
        { id: 'cs_db_2', name: 'SQL Queries & Subqueries', status: 'not_started' },
        { id: 'cs_db_3', name: 'Normalization & Functional Dependencies (1NF-BCNF)', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_db_4', name: 'Transactions, Concurrency Control & Serializability', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_db_5', name: 'B & B+ Trees Indexing', status: 'not_started' }
      ]
    },
    {
      id: 'cs_cn',
      name: 'Computer Networks',
      estimatedMarks: 8,
      topics: [
        { id: 'cs_cn_1', name: 'OSI & TCP/IP Layering Architecture', status: 'not_started' },
        { id: 'cs_cn_2', name: 'Data Link Layer (Framing, Flow Control, Ethernet)', status: 'not_started' },
        { id: 'cs_cn_3', name: 'IPv4/IPv6 Addressing & Subnetting', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_cn_4', name: 'Routing Protocols (RIP, OSPF, BGP)', status: 'not_started' },
        { id: 'cs_cn_5', name: 'Transport Layer (TCP, UDP, Congestion Control)', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_cn_6', name: 'Application Protocols (DNS, HTTP, SMTP)', status: 'not_started' }
      ]
    },
    {
      id: 'cs_coa_digital',
      name: 'COA & Digital Logic',
      estimatedMarks: 16,
      topics: [
        { id: 'cs_cd_1', name: 'Boolean Algebra, K-Maps & Logic Gates', status: 'not_started' },
        { id: 'cs_cd_2', name: 'Combinational & Sequential Circuits (Mux, Flip-Flops)', status: 'not_started' },
        { id: 'cs_cd_3', name: 'Machine Instructions & Addressing Modes', status: 'not_started', weightageHint: 'Core' },
        { id: 'cs_cd_4', name: 'ALU, Data Path & Control Unit (Hardwired/Microprogrammed)', status: 'not_started' },
        { id: 'cs_cd_5', name: 'Pipelining & Hazards', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_cd_6', name: 'Cache Memory Hierarchy & Direct/Associative Mapping', status: 'not_started', weightageHint: 'High Weightage' },
        { id: 'cs_cd_7', name: 'I/O Interface (Interrupts & DMA)', status: 'not_started' }
      ]
    }
  ],
  ECE: [
    {
      id: 'ece_ga',
      name: 'General Aptitude',
      estimatedMarks: 15,
      topics: [
        { id: 'ece_ga_1', name: 'Verbal & Analytical Aptitude', status: 'not_started' },
        { id: 'ece_ga_2', name: 'Quantitative & Spatial Aptitude', status: 'not_started' }
      ]
    },
    {
      id: 'ece_math',
      name: 'Engineering Mathematics',
      estimatedMarks: 13,
      topics: [
        { id: 'ece_m_1', name: 'Linear Algebra & Matrices', status: 'not_started' },
        { id: 'ece_m_2', name: 'Calculus & Vector Analysis', status: 'not_started' },
        { id: 'ece_m_3', name: 'Differential Equations & Complex Variables', status: 'not_started' },
        { id: 'ece_m_4', name: 'Probability & Random Variables', status: 'not_started' }
      ]
    },
    {
      id: 'ece_networks',
      name: 'Network Theory',
      estimatedMarks: 10,
      topics: [
        { id: 'ece_net_1', name: 'KCL, KVL & Network Theorems (Thevenin, Norton)', status: 'not_started' },
        { id: 'ece_net_2', name: 'Transient & Steady State Response (RLC)', status: 'not_started' },
        { id: 'ece_net_3', name: 'Two-Port Networks & Resonance', status: 'not_started' }
      ]
    },
    {
      id: 'ece_signals',
      name: 'Signals and Systems',
      estimatedMarks: 12,
      topics: [
        { id: 'ece_sig_1', name: 'LTI Systems, Convolution & Fourier Series/Transform', status: 'not_started' },
        { id: 'ece_sig_2', name: 'Laplace & Z-Transforms', status: 'not_started' },
        { id: 'ece_sig_3', name: 'Sampling Theorem & Discrete Fourier Transform (DFT/FFT)', status: 'not_started' }
      ]
    },
    {
      id: 'ece_analog',
      name: 'Analog Electronics & Circuits',
      estimatedMarks: 13,
      topics: [
        { id: 'ece_ana_1', name: 'Diode Circuits, Clippers & Clampers', status: 'not_started' },
        { id: 'ece_ana_2', name: 'BJT & MOSFET Biasing and Amplifiers', status: 'not_started' },
        { id: 'ece_ana_3', name: 'Op-Amp Applications, Active Filters & Oscillators', status: 'not_started' }
      ]
    },
    {
      id: 'ece_comm',
      name: 'Communication Systems',
      estimatedMarks: 12,
      topics: [
        { id: 'ece_com_1', name: 'Analog Communications (AM, FM, PM)', status: 'not_started' },
        { id: 'ece_com_2', name: 'Digital Communications (PCM, PSK, QAM, BER)', status: 'not_started' },
        { id: 'ece_com_3', name: 'Information Theory & Error Control Coding', status: 'not_started' }
      ]
    },
    {
      id: 'ece_emft',
      name: 'Electromagnetics (EMFT)',
      estimatedMarks: 10,
      topics: [
        { id: 'ece_emf_1', name: 'Maxwells Equations & Plane Waves', status: 'not_started' },
        { id: 'ece_emf_2', name: 'Transmission Lines & Impedance Matching', status: 'not_started' },
        { id: 'ece_emf_3', name: 'Waveguides & Antennas', status: 'not_started' }
      ]
    }
  ],
  EE: [
    {
      id: 'ee_ga',
      name: 'General Aptitude',
      estimatedMarks: 15,
      topics: [
        { id: 'ee_ga_1', name: 'Verbal & Quantitative Aptitude', status: 'not_started' }
      ]
    },
    {
      id: 'ee_math',
      name: 'Engineering Mathematics',
      estimatedMarks: 13,
      topics: [
        { id: 'ee_m_1', name: 'Linear Algebra, Calculus & Differential Equations', status: 'not_started' },
        { id: 'ee_m_2', name: 'Complex Variables & Numerical Methods', status: 'not_started' }
      ]
    },
    {
      id: 'ee_machines',
      name: 'Electrical Machines',
      estimatedMarks: 12,
      topics: [
        { id: 'ee_em_1', name: 'Single & Three Phase Transformers', status: 'not_started' },
        { id: 'ee_em_2', name: 'DC Machines & Induction Motors', status: 'not_started' },
        { id: 'ee_em_3', name: 'Synchronous Machines & Alternators', status: 'not_started' }
      ]
    },
    {
      id: 'ee_power',
      name: 'Power Systems',
      estimatedMarks: 12,
      topics: [
        { id: 'ee_ps_1', name: 'Transmission Line Parameters & Modeling', status: 'not_started' },
        { id: 'ee_ps_2', name: 'Load Flow Analysis & Fault Analysis', status: 'not_started' },
        { id: 'ee_ps_3', name: 'Power System Protection & Stability', status: 'not_started' }
      ]
    },
    {
      id: 'ee_pe',
      name: 'Power Electronics',
      estimatedMarks: 10,
      topics: [
        { id: 'ee_pe_1', name: 'Power Semiconductor Switches (Thyristors, MOSFETs, IGBTs)', status: 'not_started' },
        { id: 'ee_pe_2', name: 'Controlled Rectifiers & Choppers', status: 'not_started' },
        { id: 'ee_pe_3', name: 'Inverters & AC Voltage Controllers', status: 'not_started' }
      ]
    },
    {
      id: 'ee_ctrl',
      name: 'Control Systems',
      estimatedMarks: 10,
      topics: [
        { id: 'ee_cs_1', name: 'Block Diagrams, Signal Flow Graphs & Time Response', status: 'not_started' },
        { id: 'ee_cs_2', name: 'Routh-Hurwitz, Root Locus & Bode Plots', status: 'not_started' },
        { id: 'ee_cs_3', name: 'State Space Analysis & Compensators', status: 'not_started' }
      ]
    }
  ],
  ME: [
    {
      id: 'me_ga',
      name: 'General Aptitude',
      estimatedMarks: 15,
      topics: [{ id: 'me_ga_1', name: 'General Aptitude & Reasoning', status: 'not_started' }]
    },
    {
      id: 'me_math',
      name: 'Engineering Mathematics',
      estimatedMarks: 13,
      topics: [{ id: 'me_m_1', name: 'Calculus, Linear Algebra, Diff Eq & Numerical Methods', status: 'not_started' }]
    },
    {
      id: 'me_som',
      name: 'Strength of Materials & Mechanics',
      estimatedMarks: 12,
      topics: [
        { id: 'me_som_1', name: 'Engineering Mechanics & Free Body Diagrams', status: 'not_started' },
        { id: 'me_som_2', name: 'Stress, Strain & Mohr Circle', status: 'not_started' },
        { id: 'me_som_3', name: 'SFD, BMD, Torsion & Deflection of Beams', status: 'not_started' }
      ]
    },
    {
      id: 'me_thermo',
      name: 'Thermodynamics & Heat Transfer',
      estimatedMarks: 15,
      topics: [
        { id: 'me_th_1', name: 'Laws of Thermodynamics & Cycles (Otto, Diesel, Rankine)', status: 'not_started' },
        { id: 'me_th_2', name: 'Heat Transfer (Conduction, Convection, Radiation)', status: 'not_started' },
        { id: 'me_th_3', name: 'Refrigeration, Air Conditioning & Power Engineering', status: 'not_started' }
      ]
    },
    {
      id: 'me_fm',
      name: 'Fluid Mechanics & Thermal Turbo',
      estimatedMarks: 10,
      topics: [
        { id: 'me_fm_1', name: 'Fluid Statics, Kinematics & Bernoulli Equation', status: 'not_started' },
        { id: 'me_fm_2', name: 'Viscous Flow, Boundary Layer & Hydraulic Turbines', status: 'not_started' }
      ]
    },
    {
      id: 'me_mfg',
      name: 'Manufacturing & Industrial Engineering',
      estimatedMarks: 15,
      topics: [
        { id: 'me_mfg_1', name: 'Casting, Forming, Joining & Machining Processes', status: 'not_started' },
        { id: 'me_mfg_2', name: 'Metrology & Inspection', status: 'not_started' },
        { id: 'me_mfg_3', name: 'Inventory Control, Forecasting, PERT/CPM & LPP', status: 'not_started' }
      ]
    }
  ],
  CE: [
    {
      id: 'ce_ga',
      name: 'General Aptitude',
      estimatedMarks: 15,
      topics: [{ id: 'ce_ga_1', name: 'General Aptitude & Verbal Reasoning', status: 'not_started' }]
    },
    {
      id: 'ce_math',
      name: 'Engineering Mathematics',
      estimatedMarks: 13,
      topics: [{ id: 'ce_m_1', name: 'Linear Algebra, Calculus & Differential Equations', status: 'not_started' }]
    },
    {
      id: 'ce_struct',
      name: 'Structural Engineering & Mechanics',
      estimatedMarks: 15,
      topics: [
        { id: 'ce_st_1', name: 'Solid Mechanics & Bending Stresses', status: 'not_started' },
        { id: 'ce_st_2', name: 'Structural Analysis & Trusses', status: 'not_started' },
        { id: 'ce_st_3', name: 'RCC & Steel Design Concepts', status: 'not_started' }
      ]
    },
    {
      id: 'ce_geotech',
      name: 'Geotechnical Engineering (Soil Mechanics)',
      estimatedMarks: 14,
      topics: [
        { id: 'ce_geo_1', name: 'Soil Properties, Indexing & Classification', status: 'not_started' },
        { id: 'ce_geo_2', name: 'Seepage, Effective Stress & Consolidation', status: 'not_started' },
        { id: 'ce_geo_3', name: 'Shear Strength & Foundation Design', status: 'not_started' }
      ]
    },
    {
      id: 'ce_env',
      name: 'Environmental & Water Resources Engineering',
      estimatedMarks: 14,
      topics: [
        { id: 'ce_env_1', name: 'Water Supply, Treatment & Wastewater Engineering', status: 'not_started' },
        { id: 'ce_env_2', name: 'Fluid Mechanics, Pipe Flow & Open Channel Flow', status: 'not_started' },
        { id: 'ce_env_3', name: 'Hydrology & Irrigation Engineering', status: 'not_started' }
      ]
    },
    {
      id: 'ce_transport',
      name: 'Transportation & Geomatics',
      estimatedMarks: 10,
      topics: [
        { id: 'ce_tr_1', name: 'Highway Geometric Design & Pavement Design', status: 'not_started' },
        { id: 'ce_tr_2', name: 'Traffic Engineering & Surveying (GPS/GIS)', status: 'not_started' }
      ]
    }
  ],
  IN: [
    {
      id: 'in_ga',
      name: 'General Aptitude & Mathematics',
      estimatedMarks: 28,
      topics: [{ id: 'in_m_1', name: 'General Aptitude & Engineering Math', status: 'not_started' }]
    },
    {
      id: 'in_sensors',
      name: 'Sensors & Industrial Instrumentation',
      estimatedMarks: 20,
      topics: [
        { id: 'in_sen_1', name: 'Resistive, Capacitive & Inductive Transducers', status: 'not_started' },
        { id: 'in_sen_2', name: 'Flow, Temperature, Pressure & Level Measurement', status: 'not_started' }
      ]
    },
    {
      id: 'in_signals',
      name: 'Signals, Systems & Control',
      estimatedMarks: 22,
      topics: [
        { id: 'in_sig_1', name: 'LTI Systems, Fourier & Laplace Transforms', status: 'not_started' },
        { id: 'in_sig_2', name: 'Feedback Control & Stability Analysis', status: 'not_started' }
      ]
    },
    {
      id: 'in_circuits',
      name: 'Analog & Digital Circuits',
      estimatedMarks: 20,
      topics: [
        { id: 'in_cir_1', name: 'Op-Amps, Signal Conditioning & Filters', status: 'not_started' },
        { id: 'in_cir_2', name: 'Digital Logic, ADC & DAC Converters', status: 'not_started' }
      ]
    }
  ]
};

export interface MonthlyGoal {
  id: string;
  title: string;
  month: string; // e.g. "August 2026"
  category: 'Syllabus' | 'PYQ Practice' | 'Mock Test' | 'Revision' | 'Habit';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  targetDate?: string;
}

export interface GateTargetConfig {
  targetYear: number;
  examDate: string; // "2026-02-07"
  targetAirRank: number; // e.g. 50
  targetMarks: number; // e.g. 78
  dailyStudyHoursTarget: number; // e.g. 6
  weeklyMockTarget: number; // e.g. 2
  targetAccuracyPercent: number; // e.g. 85
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeRange: string; // e.g. "06:00 AM - 08:30 AM"
  subject: string;
  focusType: 'Theory & Concepts' | 'PYQ Practice' | 'Mock Test' | 'Formula Revision' | 'Weak Topics';
  isCompleted?: boolean;
}

export const DEFAULT_GATE_TARGETS: GateTargetConfig = {
  targetYear: 2026,
  examDate: '2026-02-07',
  targetAirRank: 100,
  targetMarks: 75,
  dailyStudyHoursTarget: 6,
  weeklyMockTarget: 2,
  targetAccuracyPercent: 85
};

export const DEFAULT_MONTHLY_GOALS: MonthlyGoal[] = [
  {
    id: 'mg_1',
    title: 'Complete 100% Engineering Mathematics & Aptitude PYQs',
    month: 'August 2026',
    category: 'PYQ Practice',
    priority: 'High',
    status: 'In Progress',
    targetDate: '2026-08-31'
  },
  {
    id: 'mg_2',
    title: 'Finish Theory Lectures for Data Structures & Algorithms',
    month: 'August 2026',
    category: 'Syllabus',
    priority: 'High',
    status: 'Completed',
    targetDate: '2026-08-15'
  },
  {
    id: 'mg_3',
    title: 'Attempt 4 Full-Length Mock Tests with deep error analysis',
    month: 'August 2026',
    category: 'Mock Test',
    priority: 'High',
    status: 'Pending',
    targetDate: '2026-08-28'
  },
  {
    id: 'mg_4',
    title: 'Revise Short Notes for Operating Systems & Computer Networks',
    month: 'August 2026',
    category: 'Revision',
    priority: 'Medium',
    status: 'In Progress',
    targetDate: '2026-08-25'
  }
];

export const DEFAULT_TIMETABLE: TimetableSlot[] = [
  { id: 'tt_1', day: 'Monday', timeRange: '06:00 AM - 08:30 AM', subject: 'Engineering Mathematics', focusType: 'Theory & Concepts', isCompleted: true },
  { id: 'tt_2', day: 'Monday', timeRange: '10:00 AM - 01:00 PM', subject: 'Data Structures & Algorithms', focusType: 'PYQ Practice', isCompleted: true },
  { id: 'tt_3', day: 'Monday', timeRange: '03:00 PM - 05:00 PM', subject: 'Computer Networks', focusType: 'Weak Topics', isCompleted: false },
  { id: 'tt_4', day: 'Monday', timeRange: '08:00 PM - 10:00 PM', subject: 'General Aptitude & Formulas', focusType: 'Formula Revision', isCompleted: false },

  { id: 'tt_5', day: 'Tuesday', timeRange: '06:00 AM - 08:30 AM', subject: 'Operating Systems', focusType: 'Theory & Concepts', isCompleted: false },
  { id: 'tt_6', day: 'Tuesday', timeRange: '10:00 AM - 01:00 PM', subject: 'DBMS & SQL Queries', focusType: 'PYQ Practice', isCompleted: false },
  { id: 'tt_7', day: 'Tuesday', timeRange: '03:00 PM - 05:00 PM', subject: 'Theory of Computation', focusType: 'Theory & Concepts', isCompleted: false },

  { id: 'tt_8', day: 'Wednesday', timeRange: '09:00 AM - 12:00 PM', subject: 'Full-Length GATE Mock Test', focusType: 'Mock Test', isCompleted: false },
  { id: 'tt_9', day: 'Wednesday', timeRange: '02:00 PM - 05:00 PM', subject: 'Mock Test Mistake Analysis & Review', focusType: 'Weak Topics', isCompleted: false }
];
