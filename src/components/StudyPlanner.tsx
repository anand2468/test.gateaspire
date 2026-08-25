import React, { useState, useEffect } from 'react';
import { BranchType, UserProfile } from '../types';
import { 
  getUserPlannerFromDb, 
  saveUserPlannerToDb, 
  getUserStreakFromDb 
} from '../firebase';
import { 
  BRANCH_SYLLABUS, 
  DEFAULT_GATE_TARGETS, 
  DEFAULT_MONTHLY_GOALS, 
  DEFAULT_TIMETABLE,
  GateTargetConfig, 
  MonthlyGoal, 
  TimetableSlot,
  TopicItem,
  SubjectSyllabus
} from '../data/syllabusData';
import { 
  Target, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  BarChart2, 
  Zap, 
  Bookmark, 
  RotateCcw,
  ListTodo,
  Lock,
  CloudCheck
} from 'lucide-react';

interface StudyPlannerProps {
  user: UserProfile | null;
  selectedBranch: BranchType;
  onOpenAuth?: () => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  user,
  selectedBranch,
  onOpenAuth
}) => {
  // Active Tab: 'goals' | 'syllabus' | 'timetable' | 'targets'
  const [activeTab, setActiveTab] = useState<'goals' | 'syllabus' | 'timetable' | 'targets'>('goals');

  // Loading & Sync states
  const [isLoadingPlanner, setIsLoadingPlanner] = useState<boolean>(true);
  const [hasLoadedPlanner, setHasLoadedPlanner] = useState<boolean>(false);

  // 1. GATE Targets State
  const [gateTargets, setGateTargets] = useState<GateTargetConfig>(DEFAULT_GATE_TARGETS);
  const [isEditingTargets, setIsEditingTargets] = useState(false);

  // 2. Syllabus Completion State (Map of topicId -> status)
  const [topicStatuses, setTopicStatuses] = useState<Record<string, TopicItem['status']>>({});

  // 3. Monthly Goals State
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(DEFAULT_MONTHLY_GOALS);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('August 2026');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<MonthlyGoal['category']>('Syllabus');
  const [newGoalPriority, setNewGoalPriority] = useState<MonthlyGoal['priority']>('High');
  const [newGoalDate, setNewGoalDate] = useState('2026-08-31');

  // 4. Timetable State
  const [timetable, setTimetable] = useState<TimetableSlot[]>(DEFAULT_TIMETABLE);
  const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>('Monday');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('06:00 AM - 08:30 AM');
  const [newSlotSubject, setNewSlotSubject] = useState('Algorithms & DS');
  const [newSlotFocus, setNewSlotFocus] = useState<TimetableSlot['focusType']>('Theory & Concepts');

  // 5. Daily Study Tracker
  const [todayLoggedHours, setTodayLoggedHours] = useState<number>(4.5);
  const [studyStreak, setStudyStreak] = useState<number>(1);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({ days: 0, hours: 0, minutes: 0 });

  // Load user specific planner & streak data from Firebase Firestore
  useEffect(() => {
    if (!user) {
      setIsLoadingPlanner(false);
      setHasLoadedPlanner(false);
      return;
    }

    let isMounted = true;
    setIsLoadingPlanner(true);

    const loadPlannerData = async () => {
      try {
        const [planner, streakData] = await Promise.all([
          getUserPlannerFromDb(user.uid),
          getUserStreakFromDb(user.uid)
        ]);

        if (isMounted) {
          if (planner) {
            if (planner.gateTargets) setGateTargets(planner.gateTargets);
            if (planner.topicStatuses) setTopicStatuses(planner.topicStatuses);
            if (planner.monthlyGoals) setMonthlyGoals(planner.monthlyGoals);
            if (planner.timetable) setTimetable(planner.timetable);
            if (planner.todayLoggedHours !== undefined) setTodayLoggedHours(planner.todayLoggedHours);
          }
          if (streakData?.currentStreak !== undefined) {
            setStudyStreak(streakData.currentStreak);
          }
          setHasLoadedPlanner(true);
        }
      } catch (err) {
        console.error('Failed to load user planner from Firestore:', err);
      } finally {
        if (isMounted) setIsLoadingPlanner(false);
      }
    };

    loadPlannerData();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Save changes to Firebase Firestore (after initial load completes)
  useEffect(() => {
    if (!user || !hasLoadedPlanner) return;

    const timer = setTimeout(() => {
      saveUserPlannerToDb(user.uid, {
        gateTargets,
        topicStatuses,
        monthlyGoals,
        timetable,
        todayLoggedHours
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [user?.uid, hasLoadedPlanner, gateTargets, topicStatuses, monthlyGoals, timetable, todayLoggedHours]);

  useEffect(() => {
    const calculateCountdown = () => {
      const examDate = new Date(gateTargets.examDate).getTime();
      const now = new Date().getTime();
      const difference = examDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 60000);
    return () => clearInterval(timer);
  }, [gateTargets.examDate]);


  // Topic status helpers
  const handleToggleTopicStatus = (topicId: string) => {
    const order: TopicItem['status'][] = ['not_started', 'in_progress', 'pyqs_done', 'revised_1', 'mastered'];
    const current = topicStatuses[topicId] || 'not_started';
    const currentIndex = order.indexOf(current);
    const next = order[(currentIndex + 1) % order.length];
    
    setTopicStatuses(prev => ({
      ...prev,
      [topicId]: next
    }));
  };

  // Syllabus progress calculation
  const branchSyllabus = BRANCH_SYLLABUS[selectedBranch] || BRANCH_SYLLABUS['CS'];
  const allBranchTopics = branchSyllabus.flatMap(s => s.topics);
  const completedTopicsCount = allBranchTopics.filter(t => {
    const st = topicStatuses[t.id] || t.status;
    return st === 'revised_1' || st === 'mastered' || st === 'pyqs_done';
  }).length;
  const overallSyllabusPercent = allBranchTopics.length > 0 
    ? Math.round((completedTopicsCount / allBranchTopics.length) * 100) 
    : 0;

  // Monthly goals handlers
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: MonthlyGoal = {
      id: 'mg_' + Date.now(),
      title: newGoalTitle.trim(),
      month: selectedMonthFilter,
      category: newGoalCategory,
      priority: newGoalPriority,
      status: 'Pending',
      targetDate: newGoalDate
    };

    setMonthlyGoals(prev => [newGoal, ...prev]);
    setNewGoalTitle('');
    setIsAddGoalModalOpen(false);
  };

  const handleToggleGoalStatus = (goalId: string) => {
    setMonthlyGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const nextStatus = g.status === 'Pending' ? 'In Progress' : g.status === 'In Progress' ? 'Completed' : 'Pending';
      return { ...g, status: nextStatus };
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setMonthlyGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Timetable handlers
  const handleToggleSlotCompleted = (slotId: string) => {
    setTimetable(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      return { ...s, isCompleted: !s.isCompleted };
    }));
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotSubject.trim()) return;

    const newSlot: TimetableSlot = {
      id: 'tt_' + Date.now(),
      day: selectedDay,
      timeRange: newSlotTime,
      subject: newSlotSubject,
      focusType: newSlotFocus,
      isCompleted: false
    };

    setTimetable(prev => [...prev, newSlot]);
    setIsAddSlotOpen(false);
  };

  const handleDeleteSlot = (slotId: string) => {
    setTimetable(prev => prev.filter(s => s.id !== slotId));
  };

  // Preset Schedule Generators
  const applyPresetTimetable = (type: 'full_time' | 'working' | 'crash') => {
    if (type === 'full_time') {
      const fullTimeSlots: TimetableSlot[] = [
        { id: 'p_1', day: selectedDay, timeRange: '06:00 AM - 08:30 AM', subject: 'Math & General Aptitude', focusType: 'Theory & Concepts', isCompleted: false },
        { id: 'p_2', day: selectedDay, timeRange: '10:00 AM - 01:00 PM', subject: 'Core Branch Subject (Slot 1)', focusType: 'PYQ Practice', isCompleted: false },
        { id: 'p_3', day: selectedDay, timeRange: '03:00 PM - 05:30 PM', subject: 'Core Branch Subject (Slot 2)', focusType: 'Weak Topics', isCompleted: false },
        { id: 'p_4', day: selectedDay, timeRange: '08:00 PM - 10:00 PM', subject: 'Short Notes & Daily Formula Revision', focusType: 'Formula Revision', isCompleted: false }
      ];
      setTimetable(prev => [...prev.filter(s => s.day !== selectedDay), ...fullTimeSlots]);
    } else if (type === 'working') {
      const workingSlots: TimetableSlot[] = [
        { id: 'pw_1', day: selectedDay, timeRange: '06:00 AM - 08:00 AM', subject: 'High Focus Theory / Problem Solving', focusType: 'Theory & Concepts', isCompleted: false },
        { id: 'pw_2', day: selectedDay, timeRange: '08:30 PM - 10:30 PM', subject: 'GATE PYQs & Topic Practice', focusType: 'PYQ Practice', isCompleted: false }
      ];
      setTimetable(prev => [...prev.filter(s => s.day !== selectedDay), ...workingSlots]);
    } else if (type === 'crash') {
      const crashSlots: TimetableSlot[] = [
        { id: 'pc_1', day: selectedDay, timeRange: '06:00 AM - 09:00 AM', subject: 'Subject Wise PYQ Marathon', focusType: 'PYQ Practice', isCompleted: false },
        { id: 'pc_2', day: selectedDay, timeRange: '11:00 AM - 02:00 PM', subject: 'Full Length / Subject Test', focusType: 'Mock Test', isCompleted: false },
        { id: 'pc_3', day: selectedDay, timeRange: '04:00 PM - 07:00 PM', subject: 'Test Error Analysis & Formula Note Update', focusType: 'Weak Topics', isCompleted: false },
        { id: 'pc_4', day: selectedDay, timeRange: '08:30 PM - 10:30 PM', subject: 'High Weightage Topic Sprint', focusType: 'Formula Revision', isCompleted: false }
      ];
      setTimetable(prev => [...prev.filter(s => s.day !== selectedDay), ...crashSlots]);
    }
  };

  if (!user) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-inner">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-extrabold tracking-wider">
            AUTHENTICATION REQUIRED
          </span>
          <h2 className="text-2xl font-black text-white mt-3">Goals & Study Planner Locked</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Your personal GATE exam targets, monthly goals, subject-wise syllabus progress, and daily timetables are fetched directly from your Firebase account. Please sign in to access and track your study goals.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <Target className="w-4 h-4" />
            <span>Sign In / Register to Access Goals</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      
      {/* Top Banner & GATE Countdown Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-black uppercase">
                {selectedBranch} BRANCH
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CloudCheck className="w-3.5 h-3.5" />
                Firebase Synced ({user.displayName || user.email})
              </span>
              <span className="text-xs font-mono text-zinc-400">Target Year: GATE {gateTargets.targetYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Study Planner & Preparation Tracker
              <Sparkles className="w-5 h-5 text-sky-400" />
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Set monthly goals, track subject-wise syllabus completion, design customized daily timetables, and hit your AIR targets.
            </p>
          </div>

          {/* GATE Countdown Box */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-inner">
            <div className="p-3 bg-white text-black rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">GATE {gateTargets.targetYear} Countdown</p>
              <div className="flex items-baseline gap-2 font-mono mt-0.5">
                <span className="text-2xl font-black text-white">{timeLeft.days}</span>
                <span className="text-xs text-zinc-400">Days</span>
                <span className="text-xl font-bold text-white ml-1">{timeLeft.hours}</span>
                <span className="text-xs text-zinc-400">Hrs</span>
              </div>
            </div>
            <div className="border-l border-zinc-800 pl-4 ml-2 hidden sm:block">
              <p className="text-[10px] font-mono text-zinc-400">TARGET AIR</p>
              <p className="text-lg font-black text-emerald-400 font-mono">Top {gateTargets.targetAirRank}</p>
            </div>
          </div>
        </div>

        {/* High Level Tracker Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>Syllabus Covered</span>
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white font-mono">{overallSyllabusPercent}%</span>
              <span className="text-[10px] text-zinc-400">({completedTopicsCount}/{allBranchTopics.length} topics)</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${overallSyllabusPercent}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>Monthly Goals</span>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white font-mono">
                {monthlyGoals.filter(g => g.status === 'Completed').length}/{monthlyGoals.length}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Achieved</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${monthlyGoals.length > 0 ? (monthlyGoals.filter(g => g.status === 'Completed').length / monthlyGoals.length) * 100 : 0}%` }} 
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>Study Hours Today</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.5" 
                min="0" 
                max="16"
                value={todayLoggedHours}
                onChange={(e) => setTodayLoggedHours(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-base font-extrabold font-mono text-white text-center focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-zinc-400 font-mono">/ {gateTargets.dailyStudyHoursTarget} hrs goal</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (todayLoggedHours / gateTargets.dailyStudyHoursTarget) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Study Streak</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-orange-400 font-mono">{studyStreak}</span>
              <span className="text-xs font-semibold text-zinc-300">Days Active 🔥</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1">Keep daily consistency!</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Planner Suite */}
      <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition shrink-0 ${
            activeTab === 'goals'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Monthly Goals & Targets
        </button>

        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition shrink-0 ${
            activeTab === 'syllabus'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subject & Syllabus Completion
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition shrink-0 ${
            activeTab === 'timetable'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Daily Timetable & Schedule
        </button>

        <button
          onClick={() => setActiveTab('targets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition shrink-0 ${
            activeTab === 'targets'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Award className="w-4 h-4" />
          GATE Exam Score & Rank Target
        </button>
      </div>

      {/* TAB 1: MONTHLY GOALS */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-sky-400" />
                Monthly Goals Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Break down your GATE preparation into structured monthly milestones.</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-white"
              >
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
                <option value="January 2027">January 2027</option>
              </select>

              <button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition shadow"
              >
                <Plus className="w-4 h-4" />
                Add Monthly Goal
              </button>
            </div>
          </div>

          {/* Goals List */}
          <div className="grid grid-cols-1 gap-3">
            {monthlyGoals.filter(g => g.month === selectedMonthFilter).length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-12 text-center">
                <ListTodo className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No goals created for {selectedMonthFilter} yet</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Set specific monthly targets like completing subject PYQs, scoring high in test series, or revising formula notes.
                </p>
                <button
                  onClick={() => setIsAddGoalModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Goal
                </button>
              </div>
            ) : (
              monthlyGoals
                .filter(g => g.month === selectedMonthFilter)
                .map((goal) => (
                  <div
                    key={goal.id}
                    className={`bg-zinc-950 border ${
                      goal.status === 'Completed'
                        ? 'border-emerald-900/50 bg-emerald-950/10'
                        : goal.status === 'In Progress'
                        ? 'border-sky-900/50 bg-sky-950/10'
                        : 'border-zinc-800'
                    } rounded-xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleGoalStatus(goal.id)}
                        className="mt-0.5 text-zinc-400 hover:text-white transition shrink-0"
                        title="Click to toggle status"
                      >
                        {goal.status === 'Completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                        ) : goal.status === 'In Progress' ? (
                          <Zap className="w-5 h-5 text-sky-400 fill-sky-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>

                      <div>
                        <h4 className={`text-sm font-bold text-white ${goal.status === 'Completed' ? 'line-through text-zinc-400' : ''}`}>
                          {goal.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {goal.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            goal.priority === 'High' ? 'bg-red-950/80 text-red-400 border border-red-800/60' :
                            goal.priority === 'Medium' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {goal.priority} Priority
                          </span>
                          {goal.targetDate && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Target: {goal.targetDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleGoalStatus(goal.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold font-mono transition border ${
                          goal.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : goal.status === 'In Progress'
                            ? 'bg-sky-950 text-sky-300 border-sky-800 hover:bg-sky-900'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {goal.status}
                      </button>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition hover:bg-zinc-900 rounded-lg"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT & SYLLABUS COMPLETION */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                  GATE {selectedBranch} Syllabus Completion Tracker
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Click on topics to cycle status: ⚪ Not Started → 🟡 In Progress → 🔵 PYQs Solved → 🟢 Revised → ⭐ Mastered
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] font-mono uppercase text-zinc-400">OVERALL BRANCH SYLLABUS</span>
                <p className="text-xl font-extrabold font-mono text-sky-400">{overallSyllabusPercent}% Completed</p>
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800 text-xs font-mono text-zinc-400">
              <span className="text-zinc-500 font-bold">STATUS LEGEND:</span>
              <span className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">⚪ Not Started</span>
              <span className="flex items-center gap-1 bg-amber-950/60 text-amber-300 px-2 py-1 rounded border border-amber-800/60">🟡 In Progress</span>
              <span className="flex items-center gap-1 bg-blue-950/60 text-blue-300 px-2 py-1 rounded border border-blue-800/60">🔵 PYQs Solved</span>
              <span className="flex items-center gap-1 bg-emerald-950/60 text-emerald-300 px-2 py-1 rounded border border-emerald-800/60">🟢 Revised x1</span>
              <span className="flex items-center gap-1 bg-purple-950/60 text-purple-300 px-2 py-1 rounded border border-purple-800/60">⭐ Mastered</span>
            </div>
          </div>

          {/* Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branchSyllabus.map((subject) => {
              const subjectCompletedCount = subject.topics.filter(t => {
                const st = topicStatuses[t.id] || t.status;
                return st === 'revised_1' || st === 'mastered' || st === 'pyqs_done';
              }).length;
              const subjectPercent = Math.round((subjectCompletedCount / subject.topics.length) * 100);

              return (
                <div key={subject.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{subject.name}</h3>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          Estimated GATE Weightage: ~{subject.estimatedMarks} Marks
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-sky-400 font-mono font-extrabold text-xs rounded-lg shrink-0">
                        {subjectPercent}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-4 border border-zinc-800">
                      <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${subjectPercent}%` }} />
                    </div>

                    <div className="space-y-2">
                      {subject.topics.map((topic) => {
                        const status = topicStatuses[topic.id] || topic.status;

                        return (
                          <div
                            key={topic.id}
                            onClick={() => handleToggleTopicStatus(topic.id)}
                            className="p-2.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-2.5">
                              {status === 'not_started' && <Circle className="w-4 h-4 text-zinc-600 shrink-0" />}
                              {status === 'in_progress' && <Zap className="w-4 h-4 text-amber-400 shrink-0 fill-amber-950" />}
                              {status === 'pyqs_done' && <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />}
                              {status === 'revised_1' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-950" />}
                              {status === 'mastered' && <Sparkles className="w-4 h-4 text-purple-400 shrink-0 fill-purple-950" />}

                              <span className={`text-xs font-semibold ${status === 'mastered' ? 'text-purple-200' : 'text-zinc-200'}`}>
                                {topic.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {topic.weightageHint && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {topic.weightageHint}
                                </span>
                              )}
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                status === 'not_started' ? 'bg-zinc-800 text-zinc-400' :
                                status === 'in_progress' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                                status === 'pyqs_done' ? 'bg-blue-950/80 text-blue-300 border border-blue-800' :
                                status === 'revised_1' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                                'bg-purple-950/80 text-purple-300 border border-purple-800'
                              }`}>
                                {status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLE & DAILY SCHEDULE */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  Interactive GATE Timetable & Schedule Manager
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Organize your daily study time slots. Check off slots as you complete them throughout the day.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddSlotOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </button>
              </div>
            </div>

            {/* Quick Preset Generator Bar */}
            <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">PRESET SCHEDULES:</span>
              <button
                onClick={() => applyPresetTimetable('full_time')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700 font-semibold transition"
              >
                🎓 Full-time Aspirant (8 Hrs)
              </button>
              <button
                onClick={() => applyPresetTimetable('working')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700 font-semibold transition"
              >
                💼 Working / College Student (4 Hrs)
              </button>
              <button
                onClick={() => applyPresetTimetable('crash')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700 font-semibold transition"
              >
                ⚡ Test Series & Crash Mode (10 Hrs)
              </button>
            </div>
          </div>

          {/* Days selector */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map((day) => {
              const daySlotsCount = timetable.filter(s => s.day === day).length;
              const dayCompletedCount = timetable.filter(s => s.day === day && s.isCompleted).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    selectedDay === day
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>{day}</span>
                  {daySlotsCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      selectedDay === day ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {dayCompletedCount}/{daySlotsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Schedule list for selected day */}
          <div className="space-y-3">
            {timetable.filter(s => s.day === selectedDay).length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No schedule set for {selectedDay}</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Click "Add Time Slot" or pick a preset schedule above to generate your study timetable.
                </p>
                <button
                  onClick={() => setIsAddSlotOpen(true)}
                  className="mt-4 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create {selectedDay} Slot
                </button>
              </div>
            ) : (
              timetable
                .filter(s => s.day === selectedDay)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className={`bg-zinc-950 border ${
                      slot.isCompleted ? 'border-emerald-900/50 bg-emerald-950/10' : 'border-zinc-800'
                    } rounded-xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => handleToggleSlotCompleted(slot.id)}
                        className="text-zinc-400 hover:text-white transition shrink-0"
                      >
                        {slot.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 font-mono text-xs text-sky-400 font-extrabold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.timeRange}</span>
                        </div>
                        <h4 className={`text-sm font-extrabold text-white mt-0.5 ${slot.isCompleted ? 'line-through text-zinc-400' : ''}`}>
                          {slot.subject}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        slot.focusType === 'Theory & Concepts' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                        slot.focusType === 'PYQ Practice' ? 'bg-blue-950/80 text-blue-300 border border-blue-800' :
                        slot.focusType === 'Mock Test' ? 'bg-purple-950/80 text-purple-300 border border-purple-800' :
                        slot.focusType === 'Formula Revision' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                        'bg-red-950/80 text-red-300 border border-red-800'
                      }`}>
                        {slot.focusType}
                      </span>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition hover:bg-zinc-900 rounded-lg"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GATE EXAM SCORE & RANK TARGETS */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-400" />
                  GATE Exam Target Dashboard
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Customize your personal target score, rank, and study metrics.</p>
              </div>

              <button
                onClick={() => setIsEditingTargets(!isEditingTargets)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition shadow shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                {isEditingTargets ? 'Close Customizer' : 'Customize Targets'}
              </button>
            </div>

            {/* Target Customizer Form */}
            {isEditingTargets && (
              <div className="mb-6 p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 animate-fade-in">
                <h3 className="text-xs font-mono font-bold uppercase text-sky-400 tracking-wider">Configure GATE Targets</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Target AIR Rank</label>
                    <input
                      type="number"
                      value={gateTargets.targetAirRank}
                      onChange={(e) => setGateTargets(prev => ({ ...prev, targetAirRank: parseInt(e.target.value) || 100 }))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Target Marks (out of 100)</label>
                    <input
                      type="number"
                      value={gateTargets.targetMarks}
                      onChange={(e) => setGateTargets(prev => ({ ...prev, targetMarks: parseInt(e.target.value) || 75 }))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Daily Study Target (Hours)</label>
                    <input
                      type="number"
                      value={gateTargets.dailyStudyHoursTarget}
                      onChange={(e) => setGateTargets(prev => ({ ...prev, dailyStudyHoursTarget: parseFloat(e.target.value) || 6 }))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Weekly Mock Test Target</label>
                    <input
                      type="number"
                      value={gateTargets.weeklyMockTarget}
                      onChange={(e) => setGateTargets(prev => ({ ...prev, weeklyMockTarget: parseInt(e.target.value) || 2 }))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Target Accuracy %</label>
                    <input
                      type="number"
                      value={gateTargets.targetAccuracyPercent}
                      onChange={(e) => setGateTargets(prev => ({ ...prev, targetAccuracyPercent: parseInt(e.target.value) || 85 }))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Exam Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={gateTargets.examDate}
                      onChange={(e) => setGateTargets(prev => ({ ...prev, examDate: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsEditingTargets(false)}
                    className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded-xl hover:bg-emerald-400 transition"
                  >
                    Save & Apply Targets
                  </button>
                </div>
              </div>
            )}

            {/* Visual Targets Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center flex flex-col justify-between">
                <p className="text-xs font-mono text-zinc-400 uppercase">Target Rank</p>
                <div className="my-4">
                  <span className="text-4xl font-black text-emerald-400 font-mono">AIR &lt; {gateTargets.targetAirRank}</span>
                </div>
                <p className="text-[11px] text-zinc-500">Qualifies for Top IITs & PSU Direct Call letters</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center flex flex-col justify-between">
                <p className="text-xs font-mono text-zinc-400 uppercase">Target Marks</p>
                <div className="my-4">
                  <span className="text-4xl font-black text-sky-400 font-mono">{gateTargets.targetMarks} / 100</span>
                </div>
                <p className="text-[11px] text-zinc-500">Estimated GATE Score ~800+</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center flex flex-col justify-between">
                <p className="text-xs font-mono text-zinc-400 uppercase">Test Frequency</p>
                <div className="my-4">
                  <span className="text-4xl font-black text-purple-400 font-mono">{gateTargets.weeklyMockTarget} Mocks/wk</span>
                </div>
                <p className="text-[11px] text-zinc-500">Targeting {gateTargets.targetAccuracyPercent}% Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              Add Monthly Goal for {selectedMonthFilter}
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Goal Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish 100 PYQs of Operating Systems"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as MonthlyGoal['category'])}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="Syllabus">Syllabus</option>
                    <option value="PYQ Practice">PYQ Practice</option>
                    <option value="Mock Test">Mock Test</option>
                    <option value="Revision">Revision</option>
                    <option value="Habit">Habit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Priority</label>
                  <select
                    value={newGoalPriority}
                    onChange={(e) => setNewGoalPriority(e.target.value as MonthlyGoal['priority'])}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition shadow"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Time Slot Modal */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              Add Time Slot for {selectedDay}
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Time Slot Range</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 06:00 AM - 08:30 AM"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Subject / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithms & Graph Theory"
                  value={newSlotSubject}
                  onChange={(e) => setNewSlotSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Focus Type</label>
                <select
                  value={newSlotFocus}
                  onChange={(e) => setNewSlotFocus(e.target.value as TimetableSlot['focusType'])}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Theory & Concepts">Theory & Concepts</option>
                  <option value="PYQ Practice">PYQ Practice</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Formula Revision">Formula Revision</option>
                  <option value="Weak Topics">Weak Topics</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition shadow"
                >
                  Add Time Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
