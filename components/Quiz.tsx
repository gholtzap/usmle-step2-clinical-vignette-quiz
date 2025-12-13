'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer } from '@/types/quiz';
import { DrawingTool } from '@/types/canvas';
import DrawingCanvas from '@/components/DrawingCanvas';
import DrawingToolbar from '@/components/DrawingToolbar';
import PdfGenerator from '@/components/PdfGenerator';

type StepFilter = 'step1' | 'step2' | 'both';

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('cursor');
  const [clearCanvasTrigger, setClearCanvasTrigger] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stepFilter, setStepFilter] = useState<StepFilter>('both');
  const [showPdfGenerator, setShowPdfGenerator] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [stepFilter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isQuizComplete || loading) return;

      const key = event.key.toLowerCase();

      if (['a', 'b', 'c', 'd', 'e'].includes(key) && !showFeedback) {
        const upperKey = key.toUpperCase();
        const currentQuestion = questions[currentQuestionIndex];
        const optionKeys = Object.keys(currentQuestion.options).sort();

        if (optionKeys.includes(upperKey)) {
          handleAnswerSelect(upperKey);
        }
      }

      if (event.key === 'Enter') {
        if (!showFeedback && selectedAnswer) {
          handleSubmitAnswer();
        } else if (showFeedback) {
          handleNextQuestion();
        }
      }

      if (event.key === 'ArrowRight') {
        if (showFeedback) {
          handleNextQuestion();
        } else {
          handleSkipQuestion();
        }
      }

      if (event.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          setClearCanvasTrigger((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          setSelectedAnswer('');
          setShowFeedback(false);
          setShowAnswer(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, selectedAnswer, showFeedback, isQuizComplete, loading, questions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer('');
      setShowFeedback(false);
      setIsQuizComplete(false);

      const response = await fetch(`/api/questions?limit=50&steps=${stepFilter}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setQuestions(data.questions);
      }
    } catch (err) {
      setError('Failed to load questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;

    const userAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect,
    };

    setUserAnswers([...userAnswers, userAnswer]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setClearCanvasTrigger((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowAnswer(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleSkipQuestion = () => {
    setClearCanvasTrigger((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowAnswer(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    loadQuestions();
  };

  const handleClearCanvas = () => {
    setClearCanvasTrigger((prev) => prev + 1);
  };

  const handleCopyQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const optionKeys = Object.keys(currentQuestion.options).sort();

    const formattedText = `${currentQuestion.question}

${optionKeys.map(key => `${key}. ${currentQuestion.options[key]}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-xl text-foreground-muted">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-xl text-error">Error: {error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-xl text-foreground-muted">No questions available</div>
      </div>
    );
  }

  if (isQuizComplete) {
    const score = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / userAnswers.length) * 100);

    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto bg-surface rounded-xl border border-border p-8">
          <h1 className="text-3xl font-medium text-center mb-8 text-foreground">
            Quiz Complete
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-semibold text-accent mb-4">
              {percentage}%
            </div>
            <div className="text-xl text-foreground-muted">
              {score} out of {userAnswers.length} correct
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(a => a.questionIndex === index);
              if (!userAnswer) return null;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors ${
                    userAnswer.isCorrect
                      ? 'border-success/30 bg-success/5'
                      : 'border-error/30 bg-error/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`font-medium ${
                      userAnswer.isCorrect ? 'text-success' : 'text-error'
                    }`}>
                      Q{index + 1}:
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-foreground-muted mb-2">
                        {question.question.substring(0, 100)}...
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Your answer: </span>
                        <span className={userAnswer.isCorrect ? 'text-success' : 'text-error'}>
                          {userAnswer.selectedAnswer} - {question.options[userAnswer.selectedAnswer]}
                        </span>
                      </div>
                      {!userAnswer.isCorrect && (
                        <div className="text-sm mt-1">
                          <span className="font-medium text-foreground">Correct answer: </span>
                          <span className="text-success">
                            {question.answer} - {question.options[question.answer]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestartQuiz}
            className="w-full bg-accent text-white py-3 px-6 rounded-lg hover:bg-accent-hover transition-all font-medium"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const optionKeys = Object.keys(currentQuestion.options).sort();
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setStepFilter('step1')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                stepFilter === 'step1'
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-foreground-muted border border-border hover:bg-surface hover:text-foreground'
              }`}
            >
              Step 1
            </button>
            <button
              onClick={() => setStepFilter('step2')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                stepFilter === 'step2'
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-foreground-muted border border-border hover:bg-surface hover:text-foreground'
              }`}
            >
              Step 2
            </button>
            <button
              onClick={() => setStepFilter('both')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                stepFilter === 'both'
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-foreground-muted border border-border hover:bg-surface hover:text-foreground'
              }`}
            >
              Both Steps
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-foreground-muted mb-3">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-surface rounded-full h-1 overflow-hidden">
            <div
              className="bg-accent h-1 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-8">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="inline-block bg-surface-hover border border-border text-foreground-muted text-sm px-3 py-1.5 rounded-md">
                {currentQuestion.meta_info}
              </div>
              <button
                onClick={handleCopyQuestion}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-hover hover:bg-surface text-foreground-muted hover:text-foreground transition-all text-sm"
                title="Copy question"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <h2 className="text-xl font-medium text-foreground leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {optionKeys.map((key) => {
              const isSelected = selectedAnswer === key;
              const isCorrect = key === currentQuestion.answer;
              const showCorrect = (showFeedback || showAnswer) && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    showCorrect
                      ? 'border-success bg-success/5'
                      : showIncorrect
                      ? 'border-error bg-error/5'
                      : isSelected
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-border-hover hover:bg-surface-hover'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                      showCorrect
                        ? 'bg-success text-black'
                        : showIncorrect
                        ? 'bg-error text-white'
                        : isSelected
                        ? 'bg-accent text-white'
                        : 'bg-surface-hover text-foreground-muted border border-border'
                    }`}>
                      {key}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-foreground">{currentQuestion.options[key]}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 border ${
              selectedAnswer === currentQuestion.answer
                ? 'bg-success/5 border-success/30'
                : 'bg-error/5 border-error/30'
            }`}>
              <p className={`font-medium ${
                selectedAnswer === currentQuestion.answer
                  ? 'text-success'
                  : 'text-error'
              }`}>
                {selectedAnswer === currentQuestion.answer
                  ? '✓ Correct'
                  : '✗ Incorrect'}
              </p>
              {selectedAnswer !== currentQuestion.answer && (
                <p className="text-sm text-foreground-muted mt-1">
                  The correct answer is <strong className="text-foreground">{currentQuestion.answer}</strong>: {currentQuestion.options[currentQuestion.answer]}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {!showFeedback ? (
              <>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    selectedAnswer
                      ? 'bg-accent text-white hover:bg-accent-hover'
                      : 'bg-surface-hover text-foreground-muted cursor-not-allowed border border-border'
                  }`}
                >
                  Submit Answer
                </button>
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-6 py-3 rounded-lg font-medium border border-border bg-surface-hover hover:bg-surface text-foreground-muted hover:text-foreground transition-all"
                >
                  Show Answer
                </button>
                <button
                  onClick={handleSkipQuestion}
                  className="px-6 py-3 rounded-lg font-medium border border-border bg-surface-hover hover:bg-surface text-foreground-muted hover:text-foreground transition-all"
                >
                  Skip
                </button>
              </>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-accent text-white py-3 px-6 rounded-lg hover:bg-accent-hover transition-all font-medium"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'View Results'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-surface rounded-lg border border-border p-4">
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Current Score</span>
            <span className="text-2xl font-semibold text-accent">
              {userAnswers.filter(a => a.isCorrect).length} / {userAnswers.length}
            </span>
          </div>
        </div>

        <div className="mt-4 bg-surface rounded-lg border border-border p-4">
          <div className="text-sm text-foreground-muted">
            <div className="font-medium text-foreground mb-2">Keyboard Shortcuts</div>
            <div className="grid grid-cols-2 gap-2">
              <div><kbd className="px-2 py-1 bg-surface-hover rounded border border-border text-xs">A-E</kbd> Select answer</div>
              <div><kbd className="px-2 py-1 bg-surface-hover rounded border border-border text-xs">Enter</kbd> Submit / Next</div>
              <div><kbd className="px-2 py-1 bg-surface-hover rounded border border-border text-xs">→</kbd> Next / Skip</div>
              <div><kbd className="px-2 py-1 bg-surface-hover rounded border border-border text-xs">←</kbd> Previous</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowPdfGenerator(true)}
            className="w-full bg-surface border border-border text-foreground py-3 px-6 rounded-lg hover:bg-surface-hover transition-all font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate PDF
          </button>
        </div>
      </div>

      <PdfGenerator
        questions={questions}
        isOpen={showPdfGenerator}
        onClose={() => setShowPdfGenerator(false)}
      />

      <DrawingCanvas tool={drawingTool} clearTrigger={clearCanvasTrigger} />
      <DrawingToolbar currentTool={drawingTool} onToolChange={setDrawingTool} onClear={handleClearCanvas} />
    </div>
  );
}
