import { Question } from './quiz';

export interface PdfGeneratorProps {
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
}
