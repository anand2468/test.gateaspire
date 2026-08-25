import React, { useState } from 'react';
import { TestAttempt, Question } from '../types';
import { X, CheckCircle2, XCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

interface SolutionReviewModalProps {
  attempt: TestAttempt | null;
  questions: Question[];
  onClose: () => void;
}

export const SolutionReviewModal: React.FC<SolutionReviewModalProps> = ({
  attempt,
  questions,
  onClose
}) => {
  const [filter, setFilter] = useState<'All' | 'Correct' | 'Wrong' | 'Skipped'>('All');

  if (!attempt) return null;

  // Retrieve questions for this attempt
  const attemptQuestions = attempt.questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is Question => q !== undefined);

  const filteredQuestions = attemptQuestions.filter((q) => {
    const uAns = attempt.answers[q.id]?.selectedAnswers || [];
    const isSkipped = uAns.length === 0;

    let isCorrect = false;
    if (!isSkipped) {
      if (q.type === 'MCQ') {
        isCorrect = q.correctAnswers.includes(uAns[0]);
      } else if (q.type === 'MSQ') {
        isCorrect = uAns.length === q.correctAnswers.length && uAns.every(val => q.correctAnswers.includes(val));
      } else if (q.type === 'NAT') {
        const val = parseFloat(uAns[0]);
        if (!isNaN(val) && q.natMin !== undefined && q.natMax !== undefined) {
          isCorrect = val >= q.natMin && val <= q.natMax;
        } else {
          isCorrect = q.correctAnswers.includes(uAns[0]);
        }
      }
    }

    if (filter === 'Correct') return isCorrect;
    if (filter === 'Wrong') return !isCorrect && !isSkipped;
    if (filter === 'Skipped') return isSkipped;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-[10px] font-bold">
                SOLUTION REVIEW
              </span>
              <h2 className="text-xl font-extrabold text-white">{attempt.testTitle}</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Score: <strong className="text-white">{attempt.score} / {attempt.maxScore}</strong> • Correct: {attempt.correctCount} • Wrong: {attempt.incorrectCount} • Skipped: {attempt.skippedCount}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4">
          {(['All', 'Correct', 'Wrong', 'Skipped'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {filteredQuestions.map((q, idx) => {
            const uAns = attempt.answers[q.id]?.selectedAnswers || [];
            const isSkipped = uAns.length === 0;

            let isCorrect = false;
            if (!isSkipped) {
              if (q.type === 'MCQ') {
                isCorrect = q.correctAnswers.includes(uAns[0]);
              } else if (q.type === 'MSQ') {
                isCorrect = uAns.length === q.correctAnswers.length && uAns.every(val => q.correctAnswers.includes(val));
              } else if (q.type === 'NAT') {
                const val = parseFloat(uAns[0]);
                if (!isNaN(val) && q.natMin !== undefined && q.natMax !== undefined) {
                  isCorrect = val >= q.natMin && val <= q.natMax;
                } else {
                  isCorrect = q.correctAnswers.includes(uAns[0]);
                }
              }
            }

            return (
              <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">Q#{idx + 1} • {q.subject} ({q.topic})</span>
                  <div className="flex items-center gap-2">
                    {isSkipped ? (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">SKIPPED (0 Marks)</span>
                    ) : isCorrect ? (
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> CORRECT (+{q.mark})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> WRONG ({q.type === 'MCQ' ? (q.mark === 1 ? '-0.33' : '-0.66') : '0'})
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-100 leading-relaxed font-sans whitespace-pre-line">{q.questionText}</p>

                {/* Response Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">YOUR ANSWER:</span>
                    <span className={isCorrect ? 'text-emerald-400 font-bold' : isSkipped ? 'text-zinc-400' : 'text-rose-400 font-bold'}>
                      {isSkipped ? 'None Selected' : uAns.join(', ')}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">CORRECT ANSWER:</span>
                    <span className="text-emerald-400 font-bold">
                      {q.correctAnswers.join(', ')} {q.natMin ? `[Accepted Range: ${q.natMin} - ${q.natMax}]` : ''}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-1">
                    <span className="text-sky-400 font-mono font-bold block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> EXPLANATION:
                    </span>
                    <p className="leading-relaxed font-sans">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
