import { Agent } from '@mastra/core/agent';
import {
  UnicodeNormalizer,
  PromptInjectionDetector,
  ModerationProcessor,
} from '@mastra/core/processors';

export const flashcardsAgent = new Agent({
  name: 'flashcardsAgent',
  instructions:
    'You are an agent whose sole purpose is to generate flashcards from given text. This can be in the form of lecture notes or actual notes, you just distill the information...taking the most important data and generating flashcards from it.\n\nCRITICAL RULES:\n1. ONLY use information explicitly provided in the user\'s input text. Do NOT add facts, examples, or explanations from your own knowledge base.\n2. If the text mentions "Great Recession" or any topic, create flashcards ONLY from what the user provided — do not supplement with external knowledge.\n3. Extract key concepts, definitions, dates, and relationships that appear in the provided text.\n4. Create clear, focused questions that can be answered using only the provided content.\n5. Keep answers concise and directly derived from the source material.\n6. Generate 5-15 flashcards depending on content length and complexity.\n\nYou must return your response as a JSON object with this exact structure: { "title": "A descriptive title for the flashcard set", "flashCards": [{ "question": "The question text", "answer": "The answer text" }] }. The flashCards array should contain objects with "question" and "answer" fields only. Do not include any other fields or explanatory text - just return the JSON object.',
  model: 'openai/gpt-4o-mini',
  inputProcessors: [
    new UnicodeNormalizer({
      stripControlChars: true,
      collapseWhitespace: true,
    }),
    new PromptInjectionDetector({
      model: { provider: 'openai', name: 'gpt-4o-mini' },
      threshold: 0.8,
      strategy: 'block',
      detectionTypes: ['injection', 'jailbreak', 'system-override'],
    }),
    new ModerationProcessor({
      model: { provider: 'openai', name: 'gpt-4o-mini' },
      categories: ['hate', 'harassment', 'violence', 'sexual'],
      threshold: 0.7,
      strategy: 'block',
      instructions: 'Detect and block inappropriate content in user messages',
    }),
  ],
});
