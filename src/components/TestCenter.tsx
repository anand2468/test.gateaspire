import React, { useState } from 'react';
import { TestConfig, Question, BranchType, UserProfile } from '../types';
import { MOCK_TEST_SERIES } from '../data/mockQuestions';
import { 
  Clock, 
  FileText, 
  Play, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  Award,
  Sparkles,
  Zap
} from 'lucide-react';

interface TestCenterProps {
  questions: Question[];
  selectedBranch: BranchType;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
  onStartExam: (testConfig: TestConfig) => void;
}

export const TestCenter: React.FC<TestCenterProps> = ({
  questions,
  selectedBranch,
  user,
  onOpenAuth,
  onStartExam
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Full Mock' | 'Subject Test' | 'Topic Test'>('All');
  
  // Custom Test Generator state
  const [customSubject, setCustomSubject] = useState('Algorithms');
  const [customDuration, setCustomDuration] = useState(20);
  const [customQuestionCount, setCustomQuestionCount] = useState(5);

  const availableTests = MOCK_TEST_SERIES.filter(t => t.branch === selectedBranch || t.branch === 'CS');

  const filteredTests = availableTests.filter(t => {
    if (activeCategory !== 'All' && t.type !== activeCategory) return false;
    return true;
  });

  const handleStartCustomTest = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    // Filter questions by subject & branch
    const matchingQs = questions.filter(q => 
      (q.subject.toLowerCase().includes(customSubject.toLowerCase()) || customSubject === 'All') &&
      (q.branch === selectedBranch || q.branch === 'CS' || q.branch === 'GA')
    );

    const selectedQs = (matchingQs.length > 0 ? matchingQs : questions).slice(0, customQuestionCount);
    const qIds = selectedQs.map(q => q.id);
    const totalMarks = selectedQs.reduce((acc, q) => acc + q.mark, 0);

    const customConfig: TestConfig = {
      id: `custom-${Date.now()}`,
      title: `${customSubject} Custom Practice Test`,
      description: `Custom ${customQuestionCount}-question timed practice test for GATE ${selectedBranch}`,
      subject: customSubject,
      branch: selectedBranch,
      type: 'Subject Test',
      durationMinutes: customDuration,
      questionIds: qIds,
      totalMarks
    };

    onStartExam(customConfig);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono mb-3">
          <FileText className="w-3.5 h-3.5 text-zinc-400" />
          <span>GATE SIMULATOR ENGINE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Test Series & Exam Practice Center</h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
          Simulate official GATE exam conditions with real countdown timer, Question Palette navigation, GATE marking rules (+1/-0.33, +2/-0.66), and Virtual Scientific Calculator.
        </p>
      </div>

      {/* Custom Test Builder */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-white font-bold text-sm mb-4">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span>CUSTOM QUICK TEST GENERATOR</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Select Target Subject</label>
            <select
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
            >
              <option value="Algorithms">Algorithms</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Database Management Systems">DBMS</option>
              <option value="Theory of Computation">Theory of Computation</option>
              <option value="General Aptitude">General Aptitude</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Number of Questions</label>
            <select
              value={customQuestionCount}
              onChange={(e) => setCustomQuestionCount(parseInt(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
            >
              <option value={3}>3 Questions (Quick Sprint)</option>
              <option value={5}>5 Questions (Standard Practice)</option>
              <option value={10}>10 Questions (Deep Assessment)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Time Limit (Minutes)</label>
            <select
              value={customDuration}
              onChange={(e) => setCustomDuration(parseInt(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
            >
              <option value={10}>10 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleStartCustomTest}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition shadow flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Custom Test Session
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {(['All', 'Full Mock', 'Subject Test', 'Topic Test'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-white text-black shadow'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Standard Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div 
            key={test.id} 
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 border border-zinc-700 text-[10px] font-mono font-bold uppercase">
                  {test.type}
                </span>
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {test.durationMinutes} Mins
                </span>
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-zinc-200 transition">{test.title}</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{test.description}</p>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="text-xs font-mono text-zinc-400">
                <span className="text-white font-bold">{test.questionIds.length}</span> Questions • <span className="text-white font-bold">{test.totalMarks}</span> Marks
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    if (onOpenAuth) onOpenAuth();
                    return;
                  }
                  onStartExam(test);
                }}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Test
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
