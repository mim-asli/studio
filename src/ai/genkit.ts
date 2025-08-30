
import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { useSettingsContext } from '@/context/settings-context';

// This is a bit of a hack to get access to the settings context hooks inside the middleware.
// In a real-world scenario, you might pass the settings down differently.
let settingsHook: ReturnType<typeof useSettingsContext> | null = null;
if (typeof window !== 'undefined') {
    // This will only be executed on the client-side
    settingsHook = useSettingsContext();
}


export const ai = genkit({
  plugins: [
    googleAI({
      // Override the default middleware to dynamically select and set the API key for each request.
      requestMiddleware: async (req, next) => {
        // Since this can be called from the server, we need a way to get settings.
        // For this app, all AI calls are from the client, so we can rely on the hook.
        // A more robust solution for server-side calls would be needed in a different app structure.
        const { settings, setApiKeyStatus } = settingsHook || { settings: null, setApiKeyStatus: () => {} };

        if (!settings) {
            throw new Error("Settings not available in Genkit middleware.");
        }

        const availableKeys = settings.geminiApiKeys.filter(k => 
            k.enabled && k.value && k.status !== 'invalid' && k.status !== 'quota_exceeded'
        );

        if (availableKeys.length === 0) {
            throw new Error("No valid, enabled Gemini API keys are available. Please add one in settings.");
        }

        // Just pick the first available key for this request
        const keyToUse = availableKeys[0];

        // Inject the API key into the request headers
        if (!req.headers) {
            req.headers = new Headers();
        }
        req.headers.set('x-goog-api-key', keyToUse.value);

        try {
            return await next(req);
        } catch (e) {
            const err = e as GenkitError;
            const cause = err.cause as any;
            
            // If we get a quota error (429), mark the key we used as 'quota_exceeded'
            if (err.code === ('unavailable' as GenkitErrorCode) || 
                err.code === ('resourceExhausted' as GenkitErrorCode) ||
                (cause?.status === 429)) {
                
                // This will trigger a re-render and the next call will pick the next available key.
                setApiKeyStatus(keyToUse.id, 'quota_exceeded');
            }
            
            // Re-throw the error to be handled by the application logic (e.g., show a toast)
            throw err;
        }
      },
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
