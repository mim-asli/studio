import { config } from 'dotenv';
config();

import '@/ai/flows/generate-next-turn.ts';
import '@/ai/flows/manage-combat-scenario.ts';
import '@/ai/flows/query-game-director.ts';