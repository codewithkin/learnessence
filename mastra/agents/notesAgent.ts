import { Agent } from '@mastra/core/agent';
import {
  UnicodeNormalizer,
  PromptInjectionDetector,
  ModerationProcessor,
  SystemPromptScrubber,
} from '@mastra/core/processors';
import { EducationalContentValidator } from '../processors/input/educational-content-validator';

export const notesAgent = new Agent({
  name: 'notesAgent',
  instructions:
    'You are an agent that converts input text (lecture notes, transcripts, or freeform speech) into a concise note.\n\nCRITICAL RULES:\n1. ONLY use information explicitly provided in the user\'s input text. Do NOT add facts, context, or explanations from your own knowledge base.\n2. If the text is about "Great Recession" or any topic, summarize and organize ONLY what the user provided — do not supplement with external knowledge.\n3. Organize the provided content into clear, logical sections with proper paragraph breaks.\n4. Preserve all key facts, names, dates, and concepts from the source material.\n5. Remove filler words, repetitions, and irrelevant tangents while keeping the core information intact.\n6. Use clear, concise language. Break long run-on sentences into shorter, readable ones.\n7. Maintain the original meaning and context — do not interpret or expand beyond what was said.\n\nReturn a JSON object with this exact structure: { "title": "A short descriptive title", "content": "The note content as plain text" }. IMPORTANT: The `content` field must be plain text formatted with clear paragraph breaks and line breaks. Use blank lines (\\n\\n) to separate paragraphs or logical sections. Do NOT include extra JSON fields, metadata, or explanatory text. Do NOT include HTML, markdown headings, or other special markup — only plain text with line breaks and spacing. Preserve sentence punctuation and organize the content into short paragraphs for readability. The response MUST be valid JSON matching the specified shape.',
  model: 'openai/gpt-4o-mini',
  inputProcessors: [
    // Normalization: Standardize input format
    new UnicodeNormalizer({
      stripControlChars: true,
      collapseWhitespace: true,
    }),
  ],
  outputProcessors: [],
  // Removed AI-powered processors that were causing performance issues:
  // - PromptInjectionDetector (expensive LLM calls)
  // - ModerationProcessor (expensive LLM calls)
  // - SystemPromptScrubber (expensive LLM calls)
  // - EducationalContentValidator (custom validation)
  // These can be re-enabled if needed, but should be optimized first.
});

export default notesAgent;
