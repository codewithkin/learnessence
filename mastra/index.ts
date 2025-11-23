import { Mastra } from '@mastra/core/mastra';
import { flashcardsAgent } from './agents/flashcardsAgent';

export const mastra = new Mastra({
  agents: { flashcardsAgent },
});
