import React, { useState } from 'react';
import { Question, UserProfile, TestAttempt, ForumPost, BranchType } from '../types';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  PlusCircle, 
  Users, 
  FileText, 
  Award, 
  Sparkles, 
  Search,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  questions: Question[];
  users: UserProfile[];
  testAttempts: TestAttempt[];
  forumPosts: ForumPost[];
  currentUser: UserProfile | null;
  onUpdateQuestionStatus: (questionId: string, status: 'approved' | 'rejected') => void;
  onUpdateUserRole: (uid: string, role: 'admin' | 'user') => void;
  onCreateOfficialQuestion: (q: Omit<Question, 'id'>) => void;
  onOpenAuth: () => void;
  selectedBranch: BranchType;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  users,
  testAttempts,
  forumPosts,
  currentUser,
  onUpdateQuestionStatus,
  onUpdateUserRole,
  onCreateOfficialQuestion,
  onOpenAuth,
  selectedBranch
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'pending' | 'questions' | 'users'>('pending');
  const [searchQ, setSearchQ] = useState('');
  
  // New Question Form State
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'MCQ' | 'MSQ' | 'NAT'>('MCQ');
  const [qSubject, setQSubject] = useState('Algorithms');
  const [qTopic, setQTopic] = useState('Data Structures');
  const [qBranch, setQBranch] = useState<BranchType>(selectedBranch);
  const [qYear, setQYear] = useState<number>(2024);
  const [qMark, setQMark] = useState<1 | 2>(1);
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctKey, setCorrectKey] = useState('A');
  const [explanationText, setExplanationText] = useState('');

  const pendingQuestions = questions.filter(q => q.status === 'pending');
  const approvedQuestions = questions.filter(q => q.status === 'approved' || !q.status);

  const handleCreateOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    let options: string[] | undefined = undefined;
    if (qType === 'MCQ' || qType === 'MSQ') {
      options = [
        `A: ${optA || 'Option A'}`,
        `B: ${optB || 'Option B'}`,
        `C: ${optC || 'Option C'}`,
        `D: ${optD || 'Option D'}`
      ];
    }

    onCreateOfficialQuestion({
      questionText: qText,
      type: qType,
      options,
      correctAnswers: [correctKey],
      subject: qSubject,
      topic: qTopic,
      branch: qBranch,
      year: qYear,
      mark: qMark,
      explanation: explanationText,
      status: 'approved',
      createdAt: new Date().toISOString()
    });

    setQText('');
    setExplanationText('');
    alert('Official question added to database successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>ADMINISTRATOR CONTROL PANEL</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">GATE Aspire Management Page</h2>
            <p className="text-xs text-zinc-400 mt-1">Approve community submitted questions, manage question database, and control user roles.</p>
          </div>

          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow transition"
            >
              Sign In as Admin
            </button>
          )}
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs font-mono text-zinc-500 uppercase block mb-1">Total Users</span>
          <div className="text-2xl font-black text-white">{users.length || 1}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs font-mono text-zinc-500 uppercase block mb-1">Pending Approval</span>
          <div className="text-2xl font-black text-amber-400">{pendingQuestions.length}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs font-mono text-zinc-500 uppercase block mb-1">Total Q Bank</span>
          <div className="text-2xl font-black text-white">{questions.length}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs font-mono text-zinc-500 uppercase block mb-1">Test Attempts</span>
          <div className="text-2xl font-black text-emerald-400">{testAttempts.length}</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-zinc-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveAdminTab('pending')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeAdminTab === 'pending'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Pending Community Submissions
          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono">
            {pendingQuestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('questions')}
          className={`pb-3 transition border-b-2 ${
            activeAdminTab === 'questions'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Question Bank & Add Official
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`pb-3 transition border-b-2 ${
            activeAdminTab === 'users'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          User Role Manager
        </button>
      </div>

      {/* Admin Tab 1: Pending Community Questions */}
      {activeAdminTab === 'pending' && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">Community Submissions Awaiting Approval</h3>

          {pendingQuestions.length > 0 ? (
            <div className="space-y-4">
              {pendingQuestions.map((q) => (
                <div key={q.id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-sky-400 font-bold">{q.subject} ({q.topic}) • {q.branch}</span>
                    <span className="text-zinc-500">Submitted by: {q.createdByName || 'Aspirant'}</span>
                  </div>

                  <p className="text-sm text-zinc-100 font-sans whitespace-pre-line">{q.questionText}</p>

                  {q.explanation && (
                    <div className="p-3 bg-zinc-900 rounded-xl text-xs text-zinc-300">
                      <strong>Solution:</strong> {q.explanation}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => onUpdateQuestionStatus(q.id, 'rejected')}
                      className="px-4 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-xl border border-rose-800 flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => onUpdateQuestionStatus(q.id, 'approved')}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">All pending questions cleared</h4>
              <p className="text-xs text-zinc-400 mt-1">There are no unreviewed community submissions at the moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Tab 2: Question Bank Manager & Add Official Form */}
      {activeAdminTab === 'questions' && (
        <div className="space-y-8">
          
          {/* Add Official Form */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-sky-400" />
              Add Official GATE Question / PYQ
            </h3>

            <form onSubmit={handleCreateOfficialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Question Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Official GATE question problem statement..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Type</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="MSQ">MSQ</option>
                    <option value="NAT">NAT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Branch</label>
                  <select
                    value={qBranch}
                    onChange={(e) => setQBranch(e.target.value as BranchType)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="CS">CS</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={qYear}
                    onChange={(e) => setQYear(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Marks</label>
                  <select
                    value={qMark}
                    onChange={(e) => setQMark(parseInt(e.target.value) as 1 | 2)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value={1}>1 Mark</option>
                    <option value={2}>2 Marks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Topic</label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {(qType === 'MCQ' || qType === 'MSQ') && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                  <input type="text" placeholder="Opt A" value={optA} onChange={(e) => setOptA(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white" />
                  <input type="text" placeholder="Opt B" value={optB} onChange={(e) => setOptB(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white" />
                  <input type="text" placeholder="Opt C" value={optC} onChange={(e) => setOptC(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white" />
                  <input type="text" placeholder="Opt D" value={optD} onChange={(e) => setOptD(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white" />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Correct Answer / Key (e.g. A)</label>
                <input
                  type="text"
                  value={correctKey}
                  onChange={(e) => setCorrectKey(e.target.value.toUpperCase())}
                  className="w-32 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Detailed Explanation</label>
                <textarea
                  rows={2}
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow transition"
                >
                  Save Question to Database
                </button>
              </div>
            </form>
          </div>

          {/* Approved List */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Published Questions ({approvedQuestions.length})</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {approvedQuestions.map(q => (
                <div key={q.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-mono text-zinc-300">
                    <span>{q.subject} • GATE {q.year || 2024}</span>
                    <span className="text-white font-bold">{q.type} ({q.mark}M)</span>
                  </div>
                  <p className="text-zinc-200 line-clamp-2">{q.questionText}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Admin Tab 3: Users Role Manager */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">User Roles & Authorization</h3>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Toggle Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(users.length > 0 ? users : [
                  { uid: 'ramanaidu2004@gmail.com', displayName: 'Primary Admin', email: 'ramanaidu2004@gmail.com', role: 'admin', branch: 'CS', targetYear: 2026, createdAt: '' }
                ]).map((u) => (
                  <tr key={u.uid} className="hover:bg-zinc-900/50">
                    <td className="p-3 font-bold text-white">{u.displayName}</td>
                    <td className="p-3 text-zinc-400">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 'admin' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onUpdateUserRole(u.uid, u.role === 'admin' ? 'user' : 'admin')}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sky-400 rounded transition"
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
