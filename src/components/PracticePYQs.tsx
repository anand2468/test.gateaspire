import React, { useState, useEffect } from 'react';
import { Question, BranchType, QuestionType, UserProfile } from '../types';
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  PlusCircle, 
  Share2, 
  Sparkles,
  BookOpen,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';

interface PracticePYQsProps {
  questions: Question[];
  selectedBranch: BranchType;
  bookmarks: string[];
  user?: UserProfile | null;
  onOpenAuth?: () => void;
  onToggleBookmark: (questionId: string) => void;
  onSubmitNewQuestion: (q: Omit<Question, 'id'>) => void;
  onShareToCommunity: (q: Question) => void;
}

export const PracticePYQs: React.FC<PracticePYQsProps> = ({
  questions,
  selectedBranch,
  bookmarks,
  user,
  onOpenAuth,
  onToggleBookmark,
  onSubmitNewQuestion,
  onShareToCommunity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [userSelection, setUserSelection] = useState<Record<string, string[]>>({});
  const [natInputs, setNatInputs] = useState<Record<string, string>>({});
  
  // Custom Question Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabVisible, setIsFabVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsFabVisible(false);
      } else {
        setIsFabVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<QuestionType>('MCQ');
  const [newSubject, setNewSubject] = useState('Algorithms');
  const [newTopic, setNewTopic] = useState('General');
  const [newMark, setNewMark] = useState<1 | 2>(1);
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectOption, setNewCorrectOption] = useState('A');
  const [newNatMin, setNewNatMin] = useState('');
  const [newNatMax, setNewNatMax] = useState('');
  const [newExplanation, setNewExplanation] = useState('');

  // Extract unique subjects
  const subjects = Array.from(newSet(['All', ...questions.map(q => q.subject)]));
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];

  function newSet<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  // Filter logic
  const filteredQuestions = questions.filter(q => {
    // Status check: show approved questions or user's pending community questions
    if (q.status && q.status === 'rejected') return false;

    if (selectedBranch && q.branch !== selectedBranch && q.branch !== 'GA') return false;
    if (yearFilter !== 'All' && q.year?.toString() !== yearFilter) return false;
    if (subjectFilter !== 'All' && q.subject !== subjectFilter) return false;
    if (typeFilter !== 'All' && q.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const qText = (q.questionText + ' ' + q.subject + ' ' + q.topic + ' ' + (q.explanation || '')).toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const toggleReveal = (id: string) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectOption = (questionId: string, optionKey: string, type: QuestionType) => {
    if (type === 'MCQ') {
      setUserSelection(prev => ({ ...prev, [questionId]: [optionKey] }));
    } else if (type === 'MSQ') {
      const current = userSelection[questionId] || [];
      const updated = current.includes(optionKey) 
        ? current.filter(k => k !== optionKey)
        : [...current, optionKey];
      setUserSelection(prev => ({ ...prev, [questionId]: updated }));
    }
  };

  const handleNatChange = (questionId: string, val: string) => {
    setNatInputs(prev => ({ ...prev, [questionId]: val }));
    setUserSelection(prev => ({ ...prev, [questionId]: [val] }));
  };

  const handleOpenCreateModal = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!newText.trim()) return;

    let options: string[] | undefined = undefined;
    let correctAnswers: string[] = [newCorrectOption];

    if (newType === 'MCQ' || newType === 'MSQ') {
      options = [
        `A: ${newOptionA || 'Option A'}`,
        `B: ${newOptionB || 'Option B'}`,
        `C: ${newOptionC || 'Option C'}`,
        `D: ${newOptionD || 'Option D'}`
      ];
    } else if (newType === 'NAT') {
      correctAnswers = [newNatMin || '0'];
    }

    onSubmitNewQuestion({
      questionText: newText,
      type: newType,
      options,
      correctAnswers,
      natMin: newNatMin ? parseFloat(newNatMin) : undefined,
      natMax: newNatMax ? parseFloat(newNatMax) : undefined,
      subject: newSubject,
      topic: newTopic,
      branch: selectedBranch,
      year: 2025,
      mark: newMark,
      explanation: newExplanation,
      isCommunity: true,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    setIsModalOpen(false);
    // Reset form
    setNewText('');
    setNewExplanation('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">
      
      {/* Floating Action Button (FAB) */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-300 transform ${
          isFabVisible
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
            : 'translate-y-20 opacity-0 scale-75 pointer-events-none'
        }`}
      >
        <button
          onClick={handleOpenCreateModal}
          title="Create & Submit Question"
          aria-label="Create & Submit Question"
          className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center bg-white hover:bg-zinc-200 text-black rounded-full shadow-2xl border border-zinc-300 hover:scale-110 active:scale-95 transition-transform group"
        >
          <PlusCircle className="w-6 h-6 text-black group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Header & Controls Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono mb-2">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>GATE PYQ BANK ({selectedBranch})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Previous Year Questions & Practice</h2>
            <p className="text-xs text-zinc-400 mt-1">Filter solved GATE papers by Year, Subject, and Type with step-by-step solutions.</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search concepts, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="All">All Years (2015-2024)</option>
            {years.filter(y => y !== 'All').map(y => (
              <option key={y} value={y}>GATE {y}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="All">All Subjects</option>
            {subjects.filter(s => s !== 'All').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="All">All Question Types (MCQ, MSQ, NAT)</option>
            <option value="MCQ">MCQ (Multiple Choice)</option>
            <option value="MSQ">MSQ (Multiple Select)</option>
            <option value="NAT">NAT (Numerical Answer)</option>
          </select>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => {
            const isBookmarked = bookmarks.includes(q.id);
            const isRevealed = !!revealedAnswers[q.id];
            const selected = userSelection[q.id] || [];

            return (
              <div key={q.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4 hover:border-zinc-700/80 transition">
                
                {/* Q Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-[11px] font-mono font-bold text-white">
                      Q#{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{q.subject}</span>
                    <span className="text-xs text-zinc-500">• {q.topic}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-zinc-400">GATE {q.year || 'Practice'}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {q.type} ({q.mark} Mark{q.mark > 1 ? 's' : ''})
                    </span>
                    
                    {/* Bookmark Button */}
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-white" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="text-sm sm:text-base text-zinc-100 font-sans leading-relaxed whitespace-pre-line">
                  {q.questionText}
                </div>

                {/* Options / NAT Input */}
                {q.type === 'NAT' ? (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 max-w-xs space-y-2">
                    <label className="text-xs font-mono text-zinc-400">Enter Numerical Value:</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 15.5"
                      value={natInputs[q.id] || ''}
                      onChange={(e) => handleNatChange(q.id, e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options?.map((optKey, optIdx) => {
                      const optCode = String.fromCharCode(65 + optIdx); // A, B, C, D
                      const isSelected = selected.includes(optCode) || selected.includes(optKey);
                      
                      // Highlight correct/incorrect if revealed
                      let borderStyle = 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700';
                      if (isSelected) {
                        borderStyle = 'border-white bg-zinc-800 text-white font-bold';
                      }
                      if (isRevealed) {
                        if (q.correctAnswers.includes(optCode) || q.correctAnswers.includes(optKey)) {
                          borderStyle = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 font-bold';
                        } else if (isSelected) {
                          borderStyle = 'border-rose-500/80 bg-rose-950/40 text-rose-300';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optCode, q.type)}
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition flex items-start gap-3 ${borderStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono shrink-0">
                            {optCode}
                          </span>
                          <span className="break-words">{optKey.replace(/^[A-D]:\s*/, '')}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Answer Reveal & Community Share Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Hide Answer' : 'Show Answer & Solution'}</span>
                    </button>

                    <button
                      onClick={() => onShareToCommunity(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-lg border border-zinc-800 transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Ask Community</span>
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-lg">
                      Correct Answer: {q.correctAnswers.join(', ')} {q.natMin ? `[Range: ${q.natMin} to ${q.natMax}]` : ''}
                    </div>
                  )}
                </div>

                {/* Solution Explanation Block */}
                {isRevealed && q.explanation && (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-2 text-white font-mono font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                      <span>STEP-BY-STEP SOLUTION & EXPLANATION</span>
                    </div>
                    <p className="leading-relaxed font-sans">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No questions matching criteria</h4>
            <p className="text-xs text-zinc-400 mt-1">Try clearing filters or search terms to see all available GATE PYQs.</p>
          </div>
        )}
      </div>

      {/* Create New Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-white mb-1">Create & Submit Practice Question</h3>
            <p className="text-xs text-zinc-400 mb-4">Submitted questions are routed to Admin for verification and published to all GATE aspirants.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Question Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Type full GATE problem statement..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Question Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as QuestionType)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="MSQ">MSQ (Multiple Select)</option>
                    <option value="NAT">NAT (Numerical Answer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Marks</label>
                  <select
                    value={newMark}
                    onChange={(e) => setNewMark(parseInt(e.target.value) as 1 | 2)}
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
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Synchronization"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Options for MCQ/MSQ */}
              {(newType === 'MCQ' || newType === 'MSQ') && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-mono text-sky-400 font-bold">Options</label>
                  <input
                    type="text"
                    placeholder="Option A"
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />

                  <div className="pt-2">
                    <label className="block text-xs font-mono text-zinc-300 mb-1">Correct Key (e.g. A)</label>
                    <input
                      type="text"
                      value={newCorrectOption}
                      onChange={(e) => setNewCorrectOption(e.target.value.toUpperCase())}
                      className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* NAT Range */}
              {newType === 'NAT' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1">Min Value</label>
                    <input
                      type="number"
                      step="any"
                      value={newNatMin}
                      onChange={(e) => setNewNatMin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1">Max Value</label>
                    <input
                      type="number"
                      step="any"
                      value={newNatMax}
                      onChange={(e) => setNewNatMax(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Explanation / Solution Steps</label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Provide step-by-step mathematical or logical proof..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs rounded-xl hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
