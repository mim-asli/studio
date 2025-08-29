let currentApiKey: string | undefined = undefined;

/**
 * Sets the current API key to be used for requests.
 * This is called by the game context before an AI action.
 */
export function setCurrentApiKey(key: string) {
  currentApiKey = key;
}

/**
 * Retrieves the current API key.
 * Used to report which key failed (e.g., for quota errors).
 */
export function getApiKey(): string | undefined {
  return currentApiKey;
}

/**
 * Injects the current API key into the request headers.
 * This function is used as middleware in the Genkit configuration.
 * @param req - The request object to modify.
 */
export function setApiKey(req: any) {
  if (currentApiKey) {
    if (!req.headers) {
      req.headers = new Headers();
    }
    // Google AI specific header
    req.headers.set('x-goog-api-key', currentApiKey);
  }
}
