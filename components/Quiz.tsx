'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer } from '@/types/quiz';

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions?limit=50');
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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsQuizComplete(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No questions available</div>
      </div>
    );
  }

  if (isQuizComplete) {
    const score = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / userAnswers.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
            Quiz Complete!
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-indigo-600 mb-4">
              {percentage}%
            </div>
            <div className="text-2xl text-gray-700">
              {score} out of {userAnswers.length} correct
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(a => a.questionIndex === index);
              if (!userAnswer) return null;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    userAnswer.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`font-bold ${
                      userAnswer.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Q{index + 1}:
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 mb-2">
                        {question.question.substring(0, 100)}...
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Your answer: </span>
                        <span className={userAnswer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {userAnswer.selectedAnswer} - {question.options[userAnswer.selectedAnswer]}
                        </span>
                      </div>
                      {!userAnswer.isCorrect && (
                        <div className="text-sm mt-1">
                          <span className="font-semibold">Correct answer: </span>
                          <span className="text-green-700">
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
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full mb-4">
              {currentQuestion.meta_info}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {optionKeys.map((key) => {
              const isSelected = selectedAnswer === key;
              const isCorrect = key === currentQuestion.answer;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showIncorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {key}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-800">{currentQuestion.options[key]}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Message */}
          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${
              selectedAnswer === currentQuestion.answer
                ? 'bg-green-100 border border-green-300'
                : 'bg-red-100 border border-red-300'
            }`}>
              <p className={`font-semibold ${
                selectedAnswer === currentQuestion.answer
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                {selectedAnswer === currentQuestion.answer
                  ? '✓ Correct!'
                  : '✗ Incorrect'}
              </p>
              {selectedAnswer !== currentQuestion.answer && (
                <p className="text-sm text-gray-700 mt-1">
                  The correct answer is <strong>{currentQuestion.answer}</strong>: {currentQuestion.options[currentQuestion.answer]}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  selectedAnswer
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'View Results'}
              </button>
            )}
          </div>
        </div>

        {/* Score Tracker */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Score:</span>
            <span className="text-2xl font-bold text-indigo-600">
              {userAnswers.filter(a => a.isCorrect).length} / {userAnswers.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
