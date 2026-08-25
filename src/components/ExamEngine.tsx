import React, { useState, useEffect } from 'react';
import { TestConfig, Question, UserAnswer, TestAttempt, UserProfile, BranchType } from '../types';
import { VirtualCalculator } from './VirtualCalculator';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Calculator, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Bookmark, 
  Send,
  RotateCcw,
  Sparkles,
  Award,
  BarChart3
} from 'lucide-react';

interface ExamEngineProps {
  testConfig: TestConfig;
  allQuestions: Question[];
  user: UserProfile | null;
  onFinishExam: (attempt: Omit<TestAttempt, 'id'>) => void;
  onExit: () => void;
  selectedBranch: BranchType;
}

export const ExamEngine: React.FC<ExamEngineProps> = ({
  testConfig,
  allQuestions,
  user,
  onFinishExam,
  onExit,
  selectedBranch
}) => {
  // Map question IDs to actual Question objects
  const questions = testConfig.questionIds
    .map(id => allQuestions.find(q => q.id === id))
    .filter((q): q is Question => q !== undefined);

  // Fallback if empty testConfig
  const activeQuestions = questions.length > 0 ? questions : allQuestions.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(testConfig.durationMinutes * 60);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalAttempt, setFinalAttempt] = useState<TestAttempt | null>(null);

  const currentQ = activeQuestions[currentIndex];

  // Initialize answer states
  useEffect(() => {
    const initialMap: Record<string, UserAnswer> = {};
    activeQuestions.forEach((q, idx) => {
      initialMap[q.id] = {
        questionId: q.id,
        selectedAnswers: [],
        isMarkedForReview: false,
        isVisited: idx === 0,
        timeSpentSeconds: 0
      };
    });
    setAnswers(initialMap);
  }, [testConfig.id]);

  // Mark current as visited
  useEffect(() => {
    if (currentQ) {
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          isVisited: true
        }
      }));
    }
  }, [currentIndex, currentQ?.id]);

  // Timer Interval
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest(); // Auto submit on timer expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Format time remaining
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optCode: string) => {
    if (!currentQ) return;
    const currentAns = answers[currentQ.id]?.selectedAnswers || [];

    let updated: string[];
    if (currentQ.type === 'MCQ') {
      updated = [optCode];
    } else if (currentQ.type === 'MSQ') {
      updated = currentAns.includes(optCode)
        ? currentAns.filter(c => c !== optCode)
        : [...currentAns, optCode];
    } else {
      updated = [optCode];
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedAnswers: updated
      }
    }));
  };

  const handleNatInput = (val: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedAnswers: val.trim() ? [val.trim()] : []
      }
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedAnswers: []
      }
    }));
  };

  const handleToggleMarkForReview = () => {
    if (!currentQ) return;
    const isMarked = answers[currentQ.id]?.isMarkedForReview;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        isMarkedForReview: !isMarked
      }
    }));
    // Next question
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Evaluation algorithm matching GATE rules
  const handleSubmitTest = () => {
    let obtainedScore = 0;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    activeQuestions.forEach((q) => {
      const uAns = answers[q.id]?.selectedAnswers || [];

      if (uAns.length === 0) {
        skipped++;
        return;
      }

      if (q.type === 'MCQ') {
        const userChoice = uAns[0];
        const isCorrect = q.correctAnswers.includes(userChoice);
        if (isCorrect) {
          correct++;
          obtainedScore += q.mark;
        } else {
          incorrect++;
          // GATE negative marking: 1/3 for 1-mark, 2/3 for 2-marks
          const penalty = q.mark === 1 ? 0.333 : 0.666;
          obtainedScore -= penalty;
        }
      } else if (q.type === 'MSQ') {
        // MSQ requires EXACT match of set of correct answers, NO partial marks, NO negative marks
        const isExactMatch = 
          uAns.length === q.correctAnswers.length &&
          uAns.every(val => q.correctAnswers.includes(val));

        if (isExactMatch) {
          correct++;
          obtainedScore += q.mark;
        } else {
          incorrect++;
        }
      } else if (q.type === 'NAT') {
        const val = parseFloat(uAns[0]);
        let isCorrect = false;

        if (!isNaN(val)) {
          if (q.natMin !== undefined && q.natMax !== undefined) {
            isCorrect = val >= q.natMin && val <= q.natMax;
          } else {
            isCorrect = q.correctAnswers.includes(uAns[0]);
          }
        }

        if (isCorrect) {
          correct++;
          obtainedScore += q.mark;
        } else {
          incorrect++;
          // NO negative marking for NAT
        }
      }
    });

    const timeSpent = testConfig.durationMinutes * 60 - timeLeftSeconds;

    const attemptData: Omit<TestAttempt, 'id'> = {
      userId: user ? user.uid : 'demo-aspirant-123',
      userName: user ? user.displayName : 'Aspirant',
      testTitle: testConfig.title,
      subject: testConfig.subject,
      topic: testConfig.topic,
      type: testConfig.type,
      score: Number(obtainedScore.toFixed(2)),
      maxScore: testConfig.totalMarks,
      totalQuestions: activeQuestions.length,
      correctCount: correct,
      incorrectCount: incorrect,
      skippedCount: skipped,
      timeTakenSeconds: timeSpent,
      branch: selectedBranch,
      answers,
      questionIds: activeQuestions.map(q => q.id),
      attemptedAt: new Date().toISOString()
    };

    onFinishExam(attemptData);

    const fullAttempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      ...attemptData
    };

    setFinalAttempt(fullAttempt);
    setIsFinished(true);

    // Confetti celebration if >50% score
    if (obtainedScore > testConfig.totalMarks * 0.5) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Status counts for Question Palette
  const answerList = Object.values(answers) as UserAnswer[];
  const answeredCount = answerList.filter(a => a.selectedAnswers.length > 0 && !a.isMarkedForReview).length;
  const markedCount = answerList.filter(a => a.isMarkedForReview && a.selectedAnswers.length === 0).length;
  const answeredAndMarkedCount = answerList.filter(a => a.isMarkedForReview && a.selectedAnswers.length > 0).length;
  const notAnsweredCount = answerList.filter(a => a.isVisited && a.selectedAnswers.length === 0 && !a.isMarkedForReview).length;
  const notVisitedCount = activeQuestions.length - (answeredCount + markedCount + answeredAndMarkedCount + notAnsweredCount);

  if (isFinished && finalAttempt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shadow-xl">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">GATE Test Result</h2>
            <p className="text-xs text-zinc-400 mt-1">{finalAttempt.testTitle} ({selectedBranch})</p>
          </div>

          {/* Score Badge */}
          <div className="inline-block p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <span className="text-xs font-mono text-zinc-400 block mb-1">SCORE OBTAINED</span>
            <div className="text-4xl sm:text-5xl font-black text-white">
              {finalAttempt.score} <span className="text-xl text-zinc-500">/ {finalAttempt.maxScore}</span>
            </div>
            <p className="text-xs text-emerald-400 font-mono mt-2">
              Accuracy: {finalAttempt.totalQuestions > 0 ? Math.round((finalAttempt.correctCount / finalAttempt.totalQuestions) * 100) : 0}%
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-xs font-mono">
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
              <span className="text-emerald-400 font-bold text-lg block">{finalAttempt.correctCount}</span>
              <span className="text-zinc-400 text-[10px]">CORRECT</span>
            </div>
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              <span className="text-rose-400 font-bold text-lg block">{finalAttempt.incorrectCount}</span>
              <span className="text-zinc-400 text-[10px]">WRONG</span>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-zinc-300 font-bold text-lg block">{finalAttempt.skippedCount}</span>
              <span className="text-zinc-400 text-[10px]">SKIPPED</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-zinc-800">
            <button
              onClick={onExit}
              className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none">
      
      {/* Floating Virtual Calculator */}
      <VirtualCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {/* Top Header Bar */}
      <header className="h-14 bg-black border-b border-zinc-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{testConfig.title}</h2>
            <span className="text-[10px] text-zinc-400 font-mono">GATE {selectedBranch} EXAM SIMULATION</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Virtual Calculator Trigger */}
          <button
            onClick={() => setIsCalcOpen(!isCalcOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
              isCalcOpen
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">VIRTUAL CALCULATOR</span>
          </button>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
            <Clock className={`w-4 h-4 ${timeLeftSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-bold ${timeLeftSeconds < 300 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeftSeconds)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Left Area: Active Question Screen */}
        <div className="lg:col-span-3 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto border-r border-zinc-800">
          
          {currentQ ? (
            <div className="space-y-6">
              
              {/* Question Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-xs">
                    QUESTION {currentIndex + 1} OF {activeQuestions.length}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    TYPE: {currentQ.type}
                  </span>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  +{currentQ.mark} Mark(s) {currentQ.type === 'MCQ' ? '(-0.33 / -0.66 wrong)' : '(No negative marks)'}
                </div>
              </div>

              {/* Question Body */}
              <div className="text-base sm:text-lg text-zinc-100 leading-relaxed font-sans whitespace-pre-line bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80">
                {currentQ.questionText}
              </div>

              {/* Input Choices / NAT Keypad */}
              {currentQ.type === 'NAT' ? (
                <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 max-w-sm space-y-3">
                  <label className="block text-xs font-mono text-white font-bold">NAT ANSWER INPUT:</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter your exact numerical response"
                    value={answers[currentQ.id]?.selectedAnswers[0] || ''}
                    onChange={(e) => handleNatInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white font-mono font-bold focus:outline-none focus:border-zinc-500"
                  />
                  <p className="text-[10px] text-zinc-500">Use Virtual Calculator for precision calculations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options?.map((optKey, optIdx) => {
                    const optCode = String.fromCharCode(65 + optIdx); // A, B, C, D
                    const isSelected = answers[currentQ.id]?.selectedAnswers.includes(optCode);

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optCode)}
                        className={`p-4 rounded-xl border text-left text-sm transition flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-white text-black border-white font-bold shadow'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 ${
                          isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {optCode}
                        </span>
                        <span>{optKey.replace(/^[A-D]:\s*/, '')}</span>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">No question selected.</div>
          )}

          {/* Bottom Action Controls */}
          <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMarkForReview}
                className="px-4 py-2.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Mark for Review & Next
              </button>

              <button
                onClick={handleClearResponse}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold transition"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 bg-zinc-900 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-800 transition"
              >
                Previous
              </button>

              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                Save & Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Question Palette Sidebar */}
        <div className="bg-zinc-900/60 p-4 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between space-y-6">
          
          <div>
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">QUESTION PALETTE</h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-4 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span className="text-zinc-300">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-zinc-300">Not Ans ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500"></span>
                <span className="text-zinc-300">Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-zinc-700"></span>
                <span className="text-zinc-300">Not Visited ({notVisitedCount})</span>
              </div>
            </div>

            {/* Questions Number Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {activeQuestions.map((q, idx) => {
                const ansState = answers[q.id];
                const hasAns = ansState?.selectedAnswers.length > 0;
                const isMarked = ansState?.isMarkedForReview;
                const isVisited = ansState?.isVisited;

                let bgStyle = 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'; // Default not visited
                if (hasAns && !isMarked) {
                  bgStyle = 'bg-emerald-500 text-black font-bold';
                } else if (isMarked && !hasAns) {
                  bgStyle = 'bg-purple-600 text-white font-bold';
                } else if (isMarked && hasAns) {
                  bgStyle = 'bg-purple-600 text-emerald-300 border-2 border-emerald-400 font-bold';
                } else if (isVisited && !hasAns) {
                  bgStyle = 'bg-rose-500 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center transition ${bgStyle} ${
                      currentIndex === idx ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-zinc-950' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            SUBMIT FINAL TEST
          </button>
        </div>

      </div>

      {/* Confirm Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-extrabold text-white">Submit GATE Test?</h3>
            <p className="text-xs text-zinc-400">Are you sure you want to finish and evaluate your exam responses?</p>

            <div className="bg-zinc-900 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>Total Questions:</span> <strong>{activeQuestions.length}</strong>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Answered:</span> <strong>{answeredCount}</strong>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Not Answered:</span> <strong>{notAnsweredCount}</strong>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>Marked for Review:</span> <strong>{markedCount + answeredAndMarkedCount}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs rounded-xl hover:bg-zinc-800"
              >
                Resume Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg"
              >
                Confirm & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
