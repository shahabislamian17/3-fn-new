import { NextResponse } from 'next/server';
import { chatAssistant } from '@/ai/flows/assistant-flow';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { history, userRole, language } = body;

    if (!history || !Array.isArray(history)) {
      return NextResponse.json(
        { error: 'Invalid request: history is required and must be an array' },
        { status: 400 }
      );
    }

    const result = await chatAssistant({
      history,
      userRole: userRole || 'Investor',
      language: language || 'en',
    });

    return NextResponse.json({ message: result.message });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
