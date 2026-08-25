import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, TestAttempt, Question, BranchType } from '../types';
import { DailyStreakCounter } from './DailyStreakCounter';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  Award, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Bookmark, 
  ChevronRight,
  Zap,
  Sparkles,
  Calendar,
  ListTodo,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile | null;
  testAttempts: TestAttempt[];
  questions: Question[];
  bookmarks: string[];
  onStartTestFromDashboard: (testId: string) => void;
  onReviewAttempt: (attempt: TestAttempt) => void;
  onOpenAuth: () => void;
  selectedBranch: BranchType;
  onNavigateToPYQs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  testAttempts,
  questions,
  bookmarks,
  onStartTestFromDashboard,
  onReviewAttempt,
  onOpenAuth,
  selectedBranch,
  onNavigateToPYQs
}) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'history' | 'bookmarks'>('analytics');

  // Filter attempts by user or show demo list if none
  const userAttempts = testAttempts.filter(t => !user || t.userId === user.uid || t.userId === 'demo-aspirant-123');

  // Calculate Metrics
  const totalTests = userAttempts.length;
  const totalQuestionsAttempted = userAttempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const totalCorrect = userAttempts.reduce((acc, curr) => acc + curr.correctCount, 0);
  const accuracy = totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0;
  
  const totalTimeSeconds = userAttempts.reduce((acc, curr) => acc + curr.timeTakenSeconds, 0);
  const avgTimePerQ = totalQuestionsAttempted > 0 ? Math.round(totalTimeSeconds / totalQuestionsAttempted) : 0;

  // Score Progression Data for LineChart
  const scoreProgressionData = userAttempts.slice().reverse().map((attempt, idx) => ({
    name: `Test #${idx + 1}`,
    score: Number(attempt.score.toFixed(1)),
    maxScore: attempt.maxScore,
    percentage: Math.round((attempt.score / attempt.maxScore) * 100)
  }));

  // Subject-wise Breakdown Data
  const subjectMap: Record<string, { total: number; correct: number }> = {};
  userAttempts.forEach(attempt => {
    const subj = attempt.subject || 'General';
    if (!subjectMap[subj]) {
      subjectMap[subj] = { total: 0, correct: 0 };
    }
    subjectMap[subj].total += attempt.totalQuestions;
    subjectMap[subj].correct += attempt.correctCount;
  });

  const subjectBreakdownData = Object.keys(subjectMap).map(subj => {
    const stat = subjectMap[subj];
    return {
      subject: subj.length > 15 ? subj.slice(0, 15) + '...' : subj,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      totalQuestions: stat.total
    };
  });

  // Weak Areas Identification (<60% accuracy)
  const weakSubjects = subjectBreakdownData.filter(s => s.accuracy < 60);

  // Bookmarked questions list
  const bookmarkedQuestions = questions.filter(q => bookmarks.includes(q.id));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>PREPARATION STATUS • {selectedBranch} BRANCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user ? `Welcome back, ${user.displayName}` : 'GATE Aspire Preparation Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Real-time analytics engine tracking accuracy, topic mastery, time per question, and GATE score projections.
            </p>
          </div>

          {!user && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Sign in to sync
            </button>
          )}
        </div>
      </div>

      {/* Daily Streak Counter Component (Logged-in vs Guest State with Firestore Sync) */}
      <DailyStreakCounter user={user} onOpenAuth={onOpenAuth} />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Overall Accuracy</span>
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{accuracy}%</div>
          <p className="text-[11px] text-zinc-500 mt-1">Target for top AIR: &gt;75%</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Tests Taken</span>
            <FileCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalTests}</div>
          <p className="text-[11px] text-zinc-500 mt-1">{totalQuestionsAttempted} Total Questions</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Avg Speed / Q</span>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{avgTimePerQ}s</div>
          <p className="text-[11px] text-zinc-500 mt-1">GATE limit: ~160s per Q</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Bookmarked Qs</span>
            <Bookmark className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{bookmarks.length}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Saved for revision</p>
        </div>
      </div>

      {/* Study Planner & Goals Shortcut Card */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white text-black rounded-xl shrink-0">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">NEW SUITE</span>
              <span className="text-xs font-mono text-zinc-400">Monthly Goals • Syllabus • Timetables</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">GATE Study Planner & Syllabus Completion Tracker</h3>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
              Track subject-wise GATE syllabus %, manage monthly preparation goals, design daily study timetables, and monitor target score & rank.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/planner')}
          className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition shadow shrink-0"
        >
          <span>Open Goals & Schedule</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Secondary Navigation Tabs inside Dashboard */}
      <div className="flex border-b border-zinc-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`pb-3 transition border-b-2 ${
            activeSubTab === 'analytics'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          Performance Charts & Insights
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          Test Attempt History
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-mono text-zinc-300">{userAttempts.length}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('bookmarks')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeSubTab === 'bookmarks'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          Bookmarked Questions
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-mono text-zinc-300">{bookmarks.length}</span>
        </button>
      </div>

      {/* Sub Tab 1: Charts & Analytics */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Score Progression */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Score Progression</h3>
                  <p className="text-xs text-zinc-400">Score trend across recent mock & topic tests</p>
                </div>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>

              {scoreProgressionData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreProgressionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#ffffff" 
                        strokeWidth={2} 
                        dot={{ fill: '#38bdf8', r: 4 }} 
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                  Take your first test to generate score progression analytics.
                </div>
              )}
            </div>

            {/* Subject-wise Accuracy Breakdown */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Subject Accuracy %</h3>
                  <p className="text-xs text-zinc-400">Accuracy rate by individual subject</p>
                </div>
                <BarChart3Icon className="w-5 h-5 text-white" />
              </div>

              {subjectBreakdownData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="subject" stroke="#71717a" fontSize={10} interval={0} />
                      <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="accuracy" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                  Complete subject-wise practice tests to populate subject accuracy breakdown.
                </div>
              )}
            </div>
          </div>

          {/* Weak Areas & Focus Recommendations */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Weak Area Diagnostics & Focus Recommendations</h3>
                <p className="text-xs text-zinc-400">Automated feedback on topics requiring immediate revision before GATE</p>
              </div>
            </div>

            {weakSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weakSubjects.map((s, idx) => (
                  <div key={idx} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-white font-bold uppercase">{s.subject}</span>
                      <p className="text-xs text-zinc-300 mt-1">Accuracy: <strong className="text-rose-400">{s.accuracy}%</strong> ({s.totalQuestions} questions attempted)</p>
                      <p className="text-[11px] text-zinc-400 mt-2">
                        💡 Recommendation: Re-read core standard textbook chapters & attempt 20+ topic-wise PYQs.
                      </p>
                    </div>
                    <button
                      onClick={onNavigateToPYQs}
                      className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition whitespace-nowrap ml-2"
                    >
                      Practice Subject
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3 text-zinc-200 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Great work! All subjects tested so far have &gt;60% accuracy. Keep taking mock tests to maintain peak performance!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Test Attempt History */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Completed Test Attempts</h3>
            <span className="text-xs text-zinc-400 font-mono">{userAttempts.length} Total Records</span>
          </div>

          {userAttempts.length > 0 ? (
            <div className="space-y-3">
              {userAttempts.map((attempt) => (
                <div 
                  key={attempt.id} 
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-700">
                        {attempt.type}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{attempt.subject}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{attempt.testTitle}</h4>
                    <p className="text-xs text-zinc-400">
                      Attempted on {new Date(attempt.attemptedAt).toLocaleDateString()} at {new Date(attempt.attemptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        Score: {attempt.score.toFixed(1)} / {attempt.maxScore}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {attempt.correctCount} Correct • {attempt.incorrectCount} Wrong • {attempt.skippedCount} Skipped
                      </div>
                    </div>

                    <button
                      onClick={() => onReviewAttempt(attempt)}
                      className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                    >
                      <span>Review Solutions</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
              <FileCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No test attempts recorded yet</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
                Head over to the Test Series or PYQs tab to launch a practice session and build your GATE analytics.
              </p>
              <button
                onClick={onNavigateToPYQs}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition"
              >
                Browse Practice Tests
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub Tab 3: Bookmarked Questions */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Bookmarked Revision Questions</h3>
            <span className="text-xs text-zinc-400 font-mono">{bookmarkedQuestions.length} Saved</span>
          </div>

          {bookmarkedQuestions.length > 0 ? (
            <div className="space-y-4">
              {bookmarkedQuestions.map((q, idx) => (
                <div key={q.id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="text-white font-bold">Q#{idx + 1} • {q.subject} ({q.topic})</span>
                    <span>GATE {q.year || 2024} • {q.mark} Mark(s) • {q.type}</span>
                  </div>
                  <p className="text-sm text-zinc-200 font-sans leading-relaxed whitespace-pre-line">{q.questionText}</p>
                  
                  {q.explanation && (
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300">
                      <strong className="text-white font-mono block mb-1">EXPLANATION:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
              <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No bookmarked questions</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                You can bookmark challenging PYQs during practice or test sessions to review them anytime here.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

function BarChart3Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  );
}
