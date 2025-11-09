import { generateJSON } from './gemini-client';

export interface MCQFeedback {
  isCorrect: boolean;
  explanation: string;
  whyWrong?: string;
  howToUnderstand?: string;
  correctAnswerExplanation: string;
}

export async function gradeMCQ(
  question: string,
  selectedAnswer: string,
  correctAnswer: string,
  options: Array<{ label: string; text: string }>,
  context?: string
): Promise<MCQFeedback> {
  const selectedOption = options.find(opt => opt.label === selectedAnswer);
  const correctOption = options.find(opt => opt.label === correctAnswer);
  
  const prompt = `You are an expert financial analyst providing feedback on a multiple-choice question.

QUESTION:
${question}

OPTIONS:
${options.map(opt => `${opt.label}. ${opt.text}`).join('\n')}

CORRECT ANSWER: ${correctAnswer} - ${correctOption?.text}

STUDENT'S SELECTED ANSWER: ${selectedAnswer} - ${selectedOption?.text}

${context ? `CONTEXT: ${context}` : ''}

Provide detailed feedback in JSON format:
{
  "isCorrect": ${selectedAnswer === correctAnswer},
  "explanation": "A clear explanation of why the correct answer is correct",
  "whyWrong": ${selectedAnswer !== correctAnswer ? `"Explain specifically why the student's answer (${selectedAnswer}) is incorrect. What misconception or error in thinking led to this choice?"` : 'null'},
  "howToUnderstand": ${selectedAnswer !== correctAnswer ? `"Provide guidance on how the student can better understand this concept. What should they review or think about differently?"` : 'null'},
  "correctAnswerExplanation": "A detailed explanation of the correct answer and the underlying concept"
}

Be educational and helpful. If the answer is correct, still provide a thorough explanation. If incorrect, help the student understand their mistake and how to approach similar questions.`;

  try {
    const result = await generateJSON(prompt);
    return result as MCQFeedback;
  } catch (error) {
    console.error('Error grading MCQ:', error);
    // Return default feedback if AI fails
    const isCorrect = selectedAnswer === correctAnswer;
    return {
      isCorrect,
      explanation: correctOption?.text || 'The correct answer is the one that best addresses the question.',
      whyWrong: isCorrect ? undefined : `The selected answer (${selectedAnswer}) is not correct.`,
      howToUnderstand: isCorrect ? undefined : 'Review the lesson material and consider the key concepts discussed.',
      correctAnswerExplanation: `The correct answer is ${correctAnswer} because ${correctOption?.text || 'it best addresses the question.'}`
    };
  }
}

