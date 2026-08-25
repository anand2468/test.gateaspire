import React, { useState, useEffect } from 'react';
import { UserProfile, UserStreak, StudyLog } from '../types';
import { 
  getUserStreakFromDb, 
  recordDailyActivityInDb, 
  getUserStudyLogsFromDb,
  getTodayDateString 
} from '../firebase';
import { 
  Flame, 
  Zap, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Lock, 
  TrendingUp, 
  History, 
  BookOpen,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

interface DailyStreakCounterProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({
  user,
  onOpenAuth
}) => {
  const [streakData, setStreakData] = useState<UserStreak | null>(null);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Custom log form state
  const [minutesInput, setMinutesInput] = useState<number>(45);
  const [questionsInput, setQuestionsInput] = useState<number>(15);
  const [activityTypeInput, setActivityTypeInput] = useState<'checkin' | 'test' | 'pyq' | 'planner'>('checkin');
  const [noteInput, setNoteInput] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Load streak & study logs on user change
  useEffect(() => {
    if (!user) {
      setStreakData(null);
      setStudyLogs([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [streak, logs] = await Promise.all([
          getUserStreakFromDb(user.uid),
          getUserStudyLogsFromDb(user.uid)
        ]);
        if (isMounted) {
          setStreakData(streak);
          setStudyLogs(logs);
        }
      } catch (err) {
        console.error('Failed to load streak data from Firestore:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Check if active today
  const isActiveToday = streakData?.lastActiveDate === todayStr;

  // Handle Quick Check-In / Custom Study Log submit
  const handleCheckIn = async (customMins?: number) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    const minsToRecord = customMins ?? minutesInput;
    const questionsToRecord = customMins ? 0 : questionsInput;
    const noteToRecord = customMins ? 'Quick daily check-in' : noteInput;

    try {
      const updatedStreak = await recordDailyActivityInDb(
        user.uid,
        minsToRecord,
        activityTypeInput,
        questionsToRecord,
        0,
        noteToRecord
      );

      if (updatedStreak) {
        setStreakData(updatedStreak);
        // Refresh logs
        const updatedLogs = await getUserStudyLogsFromDb(user.uid);
        setStudyLogs(updatedLogs);
        
        setSuccessMessage(`🔥 Study activity recorded! +${minsToRecord} mins added to Firestore.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        setShowLogModal(false);
        // Reset form
        setNoteInput('');
      }
    } catch (e) {
      console.error('Error recording check-in:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate last 7 days array for visual week tracker
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateVal}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = i === 0;
      const isActive = streakData?.activeDatesMap?.[dateStr] || false;
      days.push({ dateStr, dayName, dayNum: d.getDate(), isToday, isActive });
    }
    return days;
  };

  const weekDays = getLast7Days();

  // If user is not logged in, show Guest CTA Card for cloud tracking
  if (!user) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl shrink-0 shadow-inner">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-extrabold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> FIRESTORE PERSISTENT
                </span>
                <span className="text-xs text-zinc-400">Daily Study Streak Tracker</span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                Daily Study Streak & Activity Logs
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Log in to automatically maintain your study streak, record daily test minutes, track consecutive study days in Firestore, and stay consistent for GATE 2026.
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={onOpenAuth}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition shadow-lg"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>Sign In to Unlock Streaks</span>
            </button>
          </div>
        </div>

        {/* Demo Disabled Preview Grid */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-60">
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500 font-medium">Current Streak</p>
            <p className="text-lg font-black text-zinc-400 flex items-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 text-zinc-600" /> 0 Days
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500 font-medium">Best Record</p>
            <p className="text-lg font-black text-zinc-400 flex items-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-zinc-600" /> 0 Days
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500 font-medium">Total Study Days</p>
            <p className="text-lg font-black text-zinc-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-4 h-4 text-zinc-600" /> 0 Days
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500 font-medium">Total Hours</p>
            <p className="text-lg font-black text-zinc-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-zinc-600" /> 0.0 hrs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border shrink-0 ${
            (streakData?.currentStreak || 0) > 0 
              ? 'bg-white text-black border-white' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" /> SYNCED WITH FIRESTORE
              </span>
              {isActiveToday ? (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
                  ACTIVE TODAY
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  CHECK-IN PENDING
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <span>{streakData?.currentStreak || 0} Day Study Streak</span>
              <span className="text-xl">🔥</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Logged in as <strong className="text-zinc-200">{user.displayName}</strong> • Firestore Cloud Persistence
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {!isActiveToday ? (
            <button
              onClick={() => handleCheckIn(30)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Quick Check-in (+30m)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Streak Maintained Today!</span>
            </div>
          )}

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl border border-zinc-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Activity</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-800 transition"
            title="View Activity Logs"
          >
            <History className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Logs</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mt-4 p-3 bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {streakData?.currentStreak || 0} <span className="text-xs font-semibold text-zinc-400">days</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Consecutive activity</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Longest Streak</span>
            <Award className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {streakData?.longestStreak || 0} <span className="text-xs font-semibold text-zinc-400">days</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Personal record</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Study Days</span>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {streakData?.totalStudyDays || 0} <span className="text-xs font-semibold text-zinc-400">days</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Logged active days</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Time Logged</span>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {((streakData?.totalStudyTimeMinutes || 0) / 60).toFixed(1)} <span className="text-xs font-semibold text-zinc-400">hrs</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">{streakData?.totalStudyTimeMinutes || 0} minutes total</p>
        </div>
      </div>

      {/* Last 7 Days Visual Streak Heatmap */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>Weekly Consistency Track</span>
          </p>
          <span className="text-[11px] text-zinc-500">Last 7 Days</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => (
            <div 
              key={d.dateStr}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                d.isActive
                  ? 'bg-white text-black border-white'
                  : d.isToday
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                    : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-500'
              }`}
            >
              <span className={`text-[10px] font-mono uppercase ${d.isActive ? 'text-zinc-800 font-bold' : 'text-zinc-400'}`}>{d.dayName}</span>
              <div className="my-1">
                {d.isActive ? (
                  <Flame className="w-5 h-5 text-black fill-black" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border border-dashed flex items-center justify-center ${
                    d.isToday ? 'border-white text-white' : 'border-zinc-700 text-zinc-600'
                  }`}>
                    <span className="text-[10px]">{d.dayNum}</span>
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-mono font-semibold ${d.isActive ? 'text-black' : ''}`}>
                {d.isToday ? 'Today' : d.isActive ? 'Done' : 'Missed'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Activity Custom Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Log Daily Study Activity</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Add custom study minutes, solved questions, or study notes to your Firestore activity logs.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Activity Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'checkin', label: 'Daily Practice' },
                    { type: 'test', label: 'Mock Test' },
                    { type: 'pyq', label: 'PYQ Solving' },
                    { type: 'planner', label: 'Syllabus Review' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setActivityTypeInput(item.type as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                        activityTypeInput === item.type
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Study Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Questions Solved
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={questionsInput}
                    onChange={(e) => setQuestionsInput(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Topic / Study Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Solved Data Structures Tree & Graph GATE questions..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckIn()}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-black rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Record Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normalized History Logs Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fadeIn max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Firestore Activity Logs</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Normalized record of daily study logs stored in <code className="text-zinc-200 font-mono text-[10px]">/studyLogs</code> collection.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {studyLogs.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
                  <p className="text-sm text-zinc-400">No activity logs recorded yet.</p>
                  <p className="text-xs text-zinc-500 mt-1">Complete a test or click "Quick Check-in" to log study days.</p>
                </div>
              ) : (
                studyLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{log.date}</span>
                        <div className="flex gap-1">
                          {log.activityTypes?.map((type) => (
                            <span key={type} className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      {log.note && (
                        <p className="text-xs text-zinc-400 mt-1 italic">"{log.note}"</p>
                      )}
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {log.questionsSolved ? `${log.questionsSolved} questions • ` : ''}
                        {log.testsTaken ? `${log.testsTaken} tests completed • ` : ''}
                        Updated: {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white">{log.minutesStudied}m</span>
                      <p className="text-[10px] text-zinc-500">studied</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-4 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
