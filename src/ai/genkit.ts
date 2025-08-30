import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {setApiKey} from '@/lib/apiKey-manager';

export const ai = genkit({
  plugins: [
    googleAI({
      // Override the default middleware to dynamically set the API key for each request.
      requestMiddleware: async (req, next) => {
        setApiKey(req);
        try {
          return await next(req);
        } catch (e) {
          const err = e as GenkitError;
          // Check if the error is a 429 (quota exceeded) and mark the key as such.
          if (err.code === ('unavailable' as GenkitErrorCode) || err.code === ('resourceExhausted' as GenkitErrorCode)) {
            const cause = err.cause as any;
            if (cause?.status === 429) {
                // The key manager will see this and mark the current key as invalid.
                // The next request will automatically use the next available key.
            }
          }
          // Re-throw the error to be handled by the application logic.
          throw err;
        }
      },
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
