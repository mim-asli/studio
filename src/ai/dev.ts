
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-next-turn.ts';
import '@/ai/flows/manage-combat-scenario.ts';
import '@/ai/flows/query-game-director.ts';
import '@/ai/flows/craft-item-flow.ts';
import '@/ai/flows/generate-image-flow.ts';

