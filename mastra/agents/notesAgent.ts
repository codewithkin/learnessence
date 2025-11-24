import { Agent } from '@mastra/core/agent';

export const notesAgent = new Agent({
  name: 'notesAgent',
  instructions:
    'You are an agent that converts input text (lecture notes, transcripts, or freeform speech) into a concise note. Return a JSON object with this exact structure: { "title": "A short descriptive title", "content": "The note content, ideally markdown or plain text" }. Do not include extra fields or explanatory text — only return the JSON object.',
  model: 'openai/gpt-4o-mini',
});

export default notesAgent;
