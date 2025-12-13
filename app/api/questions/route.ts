import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Question } from '@/types/quiz';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const steps = searchParams.get('steps');

    const filePath = path.join(process.cwd(), 'questions/US_qbank.jsonl');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const lines = fileContent.trim().split('\n');
    let allQuestions: Question[] = lines.map(line => JSON.parse(line));

    if (steps && steps !== 'both') {
      allQuestions = allQuestions.filter(q => q.meta_info === steps);
    }

    // some questions reference diagrams that don't exist (because the Qs are in plaintext format)
    // this filters them out (approx 23% of questions - 14k -> 11k).
    const visualContentKeywords = [
      'diagram',
      'picture',
      'image',
      'shown in the',
      'shown below',
      'shown above',
      'figure',
      'illustration',
      'graph',
      'chart'
    ];

    allQuestions = allQuestions.filter(q => {
      const questionLower = q.question.toLowerCase();
      return !visualContentKeywords.some(keyword => questionLower.includes(keyword));
    });

    const shuffledQuestions = shuffleArray(allQuestions);

    const paginatedQuestions = shuffledQuestions.slice(offset, offset + limit);

    return NextResponse.json({
      questions: paginatedQuestions,
      total: allQuestions.length,
      offset,
      limit
    });
  } catch (error) {
    console.error('Error loading questions:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
