
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-next-turn.ts';
import '@/ai/flows/manage-combat-scenario.ts';
import '@/ai/flows/query-game-director.ts';
import '@/ai/flows/craft-item-flow.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/test-api-key-flow.ts';

import '@/ai/prompts/generate-next-turn-prompt.ts';
import '@/ai/prompts/manage-combat-scenario-prompt.ts';
import '@/ai/prompts/query-game-director-prompt.ts';
import '@/ai/prompts/craft-item-prompt.ts';
