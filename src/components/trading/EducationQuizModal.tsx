import React, { useState } from 'react';
import {
  WHAT_IF_SCENARIOS,
  SEBI_RISK_QUIZ_QUESTIONS,
} from '../../utils/portfolioHealthData';
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface EducationQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizCompleted?: (score: number) => void;
}

export const EducationQuizModal: React.FC<EducationQuizModalProps> = ({
  isOpen,
  onClose,
  onQuizCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'glossary' | 'quiz'>('simulator');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sim-covid');

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentScenario = WHAT_IF_SCENARIOS.find((s) => s.id === selectedScenarioId) || WHAT_IF_SCENARIOS[0];

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIdx }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < SEBI_RISK_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
      const score = calculateScore();
      if (onQuizCompleted) onQuizCompleted(score);
    }
  };

  const calculateScore = () => {
    let score = 0;
    SEBI_RISK_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const score = calculateScore();
  const isPassed = score >= 4;

  const GLOSSARY_TERMS = [
    {
      term: 'Stop-Loss (SL & SL-M)',
      definition: 'A pre-set conditional order placed with the exchange to automatically sell a security when the market falls to a designated trigger price, truncating catastrophic downside.',
      example: 'Buying Swiggy at ₹390 with a stop-loss at ₹370 caps maximum loss to ₹20/share (-5.1%).',
    },
    {
      term: 'Slippage',
      definition: 'The difference between the expected execution price and the actual fill price, caused by high market velocity, low liquidity, or market order spreads.',
      example: 'Placing a market buy during high volatility at ₹100, but getting filled at ₹102 due to thin immediate ask depth.',
    },
    {
      term: 'Maximum Drawdown (MDD)',
      definition: 'The maximum observed loss from a historical portfolio peak to a subsequent trough before a new peak is attained. The premier indicator of capital risk.',
      example: 'A portfolio dropping from ₹10 Lakhs to ₹7.5 Lakhs has an MDD of -25%.',
    },
    {
      term: 'Sharpe & Sortino Ratios',
      definition: 'Sharpe measures excess return per unit of total risk. Sortino isolates downside deviation, ignoring upside volatility to reward clean upward trends.',
      example: 'Sharpe > 1.5 indicates strong alpha relative to cash risk-free yields.',
    },
    {
      term: 'Herfindahl-Hirschman Index (HHI)',
      definition: 'A mathematical measure of portfolio concentration calculated as the sum of squared weights of all holdings. Lower numbers indicate superior diversification.',
      example: 'A portfolio with 10 equally weighted 10% assets has an HHI of 1,000 (well-diversified).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Investor Education Mode & Pre-Trade Risk Certification
              </h3>
              <p className="text-xs text-slate-500">
                Quantitative simulations of market crises, glossary diagnostics, and SEBI-aligned risk awareness testing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 text-xs font-semibold">
          {[
            { id: 'simulator', label: '“What Would Have Happened” Simulator' },
            { id: 'glossary', label: 'Trading & Risk Glossary' },
            { id: 'quiz', label: 'SEBI Risk Awareness Quiz' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-4 border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: "What Would Have Happened" Simulator */}
        {activeTab === 'simulator' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Scenario Chooser */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Historical Event:</span>
              <div className="flex gap-2">
                {WHAT_IF_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      selectedScenarioId === sc.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sc.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Description Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                <span>Asset: {currentScenario.asset}</span>
                <span>Timeline: {currentScenario.historicalDate}</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {currentScenario.eventDescription}
              </p>
            </div>

            {/* Comparison of Strategies: Disciplined vs Passive vs Reckless */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Rule-Based Outcomes Comparison (What Would Have Happened)
              </h5>
              <div className="space-y-3">
                {currentScenario.strategyOptions.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border space-y-2 transition-all ${
                      opt.outcomePnlPercent >= 0
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{opt.name}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">{opt.action}</p>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className={`text-sm font-bold block ${opt.outcomePnlPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {opt.outcomePnlPercent >= 0 ? '+' : ''}{opt.outcomePnlPercent}% Net P&L
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Max Drawdown: -{opt.drawdownMaxPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/60 text-[11px] text-slate-600">
                      <strong>Quantitative Lesson:</strong> {opt.takeaway}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Glossary */}
        {activeTab === 'glossary' && (
          <div className="p-6 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {GLOSSARY_TERMS.map((g, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{g.term}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {g.definition}
                  </p>
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                    <strong>Real Example:</strong> {g.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: SEBI Risk Awareness Quiz */}
        {activeTab === 'quiz' && (
          <div className="p-6 space-y-5 text-xs">
            {!isSubmitted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono text-slate-500">
                    Question {currentQuestionIndex + 1} of {SEBI_RISK_QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Demonstrate Risk Understanding
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {SEBI_RISK_QUIZ_QUESTIONS[currentQuestionIndex].question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {SEBI_RISK_QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, oIdx) => {
                    const isSelected = userAnswers[currentQuestionIndex] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(oIdx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 text-indigo-950 font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-mono ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white font-bold' : 'border-slate-300'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    disabled={userAnswers[currentQuestionIndex] === undefined}
                    onClick={handleNextQuestion}
                    className="py-2 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>{currentQuestionIndex === SEBI_RISK_QUIZ_QUESTIONS.length - 1 ? 'Submit & Review Score' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                {/* Score Summary Card */}
                <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                  isPassed
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-300 text-rose-950'
                }`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-2xs mb-1">
                    {isPassed ? (
                      <Award className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    )}
                  </div>
                  <h4 className="text-base font-bold">
                    {isPassed ? 'Risk Awareness Certified!' : 'Review SEBI Safety Guidelines'}
                  </h4>
                  <p className="text-xs max-w-md mx-auto">
                    You scored <strong className="font-mono text-sm">{score} / {SEBI_RISK_QUIZ_QUESTIONS.length}</strong>. {isPassed ? 'You have demonstrated solid understanding of leverage, gap risk, taxes, and stop-loss execution.' : 'A minimum score of 4/5 is recommended before placing live capital orders.'}
                  </p>
                  {isPassed && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Risk-Aware Trader Badge Unlocked</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Question Feedback Accordion */}
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Detailed Answer Explanations
                  </h5>
                  {SEBI_RISK_QUIZ_QUESTIONS.map((q, idx) => {
                    const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                          isCorrect ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 leading-snug">
                            {idx + 1}. {q.question}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                          <strong>SEBI Directive Note:</strong> {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleResetQuiz}
                    className="py-1.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="py-1.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            SEBI Regulatory Reference: Circular CIR/MRD/DP/118/2017 & Section 111A Capital Gains provisions.
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
