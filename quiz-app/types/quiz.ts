export interface Question {
  question: string;
  answer: string;
  options: Record<string, string>;
  meta_info: string;
}

export interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  isQuizComplete: boolean;
}
