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

    const filePath = path.join(process.cwd(), 'questions/US_qbank.jsonl');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const lines = fileContent.trim().split('\n');
    const allQuestions: Question[] = lines.map(line => JSON.parse(line));

    // Shuffle questions to randomize order
    const shuffledQuestions = shuffleArray(allQuestions);

    // Apply pagination
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
