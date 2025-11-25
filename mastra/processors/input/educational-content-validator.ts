import type { Processor } from '@mastra/core/processors';
import type { MastraMessageV2 } from '@mastra/core/agent/message-list';
import { TripWire } from '@mastra/core/agent';

type EducationalContentValidatorOptions = {
  model: { id: string };
  strategy?: 'block' | 'warn';
  threshold?: number;
};

export class EducationalContentValidator implements Processor {
  readonly name = 'educational-content-validator';
  private model: { id: string };
  private strategy: 'block' | 'warn';
  private threshold: number;

  constructor(options: EducationalContentValidatorOptions) {
    this.model = options.model;
    this.strategy = options.strategy ?? 'block';
    this.threshold = options.threshold ?? 0.7;
  }

  async processInput({
    messages,
    abort,
  }: {
    messages: MastraMessageV2[];
    abort: (reason?: string) => never;
  }): Promise<MastraMessageV2[]> {
    try {
      // Extract text content from all messages
      const textContent = messages
        .map((msg) =>
          msg.content.parts
            .filter((part) => part.type === 'text')
            .map((part) => (part as any).text)
            .join(' ')
        )
        .join(' ')
        .trim();

      if (!textContent) {
        abort('No text content found in messages');
      }

      // Check if content is educational using simple heuristics
      // In a production scenario, you might use an LLM call here
      const isEducational = await this.validateEducationalContent(textContent);

      if (!isEducational) {
        switch (this.strategy) {
          case 'block':
            abort(
              'Content does not appear to be educational. Please provide learning materials, lecture notes, study content, or educational text.'
            );
            break;
          case 'warn':
            console.warn(
              'Warning: Content may not be educational. Processing anyway due to "warn" strategy.'
            );
            break;
        }
      }

      return messages;
    } catch (error) {
      if (error instanceof TripWire) {
        throw error;
      }
      throw new Error(
        `Educational content validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async validateEducationalContent(text: string): Promise<boolean> {
    // Reject greetings and short conversational phrases
    const greetingPatterns = [
      /^(hi|hello|hey|greetings?|good (morning|afternoon|evening)|what'?s up)[\s!.?]*$/i,
      /^(how are you|how'?s it going|sup|yo)[\s!.?]*$/i,
      /^(thanks?|thank you|bye|goodbye|see you|later)[\s!.?]*$/i,
    ];

    const trimmedLower = text.toLowerCase().trim();

    // Block pure greetings/small talk
    for (const pattern of greetingPatterns) {
      if (pattern.test(trimmedLower)) {
        return false;
      }
    }

    // Require minimum length (educational content should be substantial)
    if (text.length < 100) {
      return false;
    }

    // Check for educational indicators (keywords suggesting learning content)
    const educationalKeywords = [
      // Academic terms
      'study',
      'learn',
      'course',
      'lecture',
      'lesson',
      'chapter',
      'topic',
      'subject',
      'concept',
      'theory',
      'definition',
      'explain',
      'understand',
      'analysis',
      'research',
      'experiment',
      'hypothesis',
      'conclusion',
      'evidence',
      'argument',
      // Educational content types
      'notes',
      'summary',
      'overview',
      'introduction',
      'background',
      'history',
      'development',
      'process',
      'method',
      'technique',
      'principle',
      'formula',
      'equation',
      'theorem',
      'law',
      'rule',
      // Academic subjects
      'mathematics',
      'science',
      'biology',
      'chemistry',
      'physics',
      'history',
      'geography',
      'literature',
      'language',
      'economics',
      'psychology',
      'sociology',
      'philosophy',
      'engineering',
      'computer',
      'programming',
      // Educational verbs
      'describe',
      'compare',
      'contrast',
      'analyze',
      'evaluate',
      'summarize',
      'discuss',
      'examine',
      'explore',
      'investigate',
    ];

    const lowerText = text.toLowerCase();
    let keywordMatches = 0;

    for (const keyword of educationalKeywords) {
      if (lowerText.includes(keyword)) {
        keywordMatches++;
      }
    }

    // Consider it educational if it has multiple educational keywords
    // or has substantial length with at least one keyword
    if (keywordMatches >= 3) {
      return true;
    }

    if (keywordMatches >= 1 && text.length >= 200) {
      return true;
    }

    // Check for sentence structure indicators (educational content tends to be well-formed)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const hasMultipleSentences = sentences.length >= 3;
    const hasCapitalization = /[A-Z]/.test(text);

    // If content is substantial, well-structured, and has some keywords, allow it
    if (hasMultipleSentences && hasCapitalization && keywordMatches >= 1) {
      return true;
    }

    // Reject conversational or non-educational content
    return false;
  }
}
