import { Mastra } from '@mastra/core/mastra';
import { flashcardsAgent } from './agents/flashcardsAgent';
import { notesAgent } from './agents/notesAgent';

export const mastra = new Mastra({
  agents: { flashcardsAgent, notesAgent },
});
