'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { PdfGeneratorProps } from '@/types/pdf';
import { Question } from '@/types/quiz';

export default function PdfGenerator({ questions, isOpen, onClose }: PdfGeneratorProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);

    const doc = new jsPDF();
    const questionsToExport = questions.slice(0, numQuestions);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    questionsToExport.forEach((question: Question, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      let yPosition = margin;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Question ${index + 1} of ${questionsToExport.length}`, margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setTextColor(0);
      const questionLines = doc.splitTextToSize(question.question, maxWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 7 + 10;

      const optionKeys = Object.keys(question.options).sort();
      optionKeys.forEach((key) => {
        const optionText = `${key}. ${question.options[key]}`;
        const optionLines = doc.splitTextToSize(optionText, maxWidth);
        doc.text(optionLines, margin, yPosition);
        yPosition += optionLines.length * 7 + 5;
      });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${index + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    });

    doc.addPage();
    let yPosition = margin;

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Answer Key', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    questionsToExport.forEach((question: Question, index: number) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      const answerText = `${index + 1}. ${question.answer} - ${question.options[question.answer]}`;
      const answerLines = doc.splitTextToSize(answerText, maxWidth);
      doc.text(answerLines, margin, yPosition);
      yPosition += answerLines.length * 6 + 4;
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    const totalPages = doc.getNumberOfPages();
    doc.text(`Page ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save('quiz-questions.pdf');
    setIsGenerating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl border border-border p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-medium text-foreground mb-6">Generate PDF</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Number of questions (1-{questions.length})
          </label>
          <input
            type="number"
            min="1"
            max={questions.length}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.min(questions.length, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-sm text-foreground-muted mt-2">
            Each question will be on a separate page.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={generatePdf}
            disabled={isGenerating}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              isGenerating
                ? 'bg-surface-hover text-foreground-muted cursor-not-allowed border border-border'
                : 'bg-accent text-white hover:bg-accent-hover'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-3 rounded-lg font-medium border border-border bg-surface-hover hover:bg-surface text-foreground-muted hover:text-foreground transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
