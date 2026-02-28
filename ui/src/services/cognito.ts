/**
 * The API below uses browser "session storage".
 * The effect is that the user is logged out as soon as the browser tab or window is closed.
 *
 * An alternative is browser "localStorage".
 * This persists across browser sessions, meaning that the user remains logged in
 * when the browser is closed and re-opened, until the Cognito token expires.
 *
 * To use localStorage instead: create a localStorage.ts that exports the same
 * key constants, then in this file and any other caller use window.localStorage
 * (and import keys from localStorage.ts) instead of window.sessionStorage.
 */

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  decodeIdToken,
  getCognitoLoginUrl,
  getCognitoLogoutUrl,
} from "../utils/oauth-helpers";
import {
  TOKEN_STORAGE_KEY,
  ID_TOKEN_STORAGE_KEY,
  CODE_VERIFIER_KEY,
  STATE_KEY,
  SESSION_STORAGE_KEYS,
} from "../utils/sessionStorage";
import type { User } from "../types";
import api from "./apiServer";

export async function startLogin(): Promise<void> {
  const config = await api.getConfig();

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  window.sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
  window.sessionStorage.setItem(STATE_KEY, state);

  window.location.href = getCognitoLoginUrl(
    state,
    codeChallenge,
    config.cognitoDomain,
    config.cognitoClientId,
  );
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<User> {
  const config = await api.getConfig();
  const storedState = window.sessionStorage.getItem(STATE_KEY);
  const codeVerifier = window.sessionStorage.getItem(CODE_VERIFIER_KEY);

  if (!storedState || !codeVerifier) {
    throw new Error(
      "Error: unable to read state or code verifier from session storage.",
    );
  }

  if (state !== storedState) {
    throw new Error("Error: cognito/session-storage state mismatch");
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.cognitoClientId,
    code: code,
    redirect_uri: `${window.location.origin}/callback`,
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${config.cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const tokens = await response.json();
  window.sessionStorage.removeItem(CODE_VERIFIER_KEY);
  window.sessionStorage.removeItem(STATE_KEY);

  if (!tokens.access_token) {
    throw new Error("No access token received");
  }

  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
  api.setAccessToken(tokens.access_token);

  if (!tokens.id_token) {
    throw new Error("No ID token received");
  }

  window.sessionStorage.setItem(ID_TOKEN_STORAGE_KEY, tokens.id_token);

  const user = decodeIdToken(tokens.id_token);
  if (!user) {
    throw new Error("Failed to decode user information from ID token");
  }

  return user;
}

export async function doLogout(): Promise<void> {
  const config = await api.getConfig();
  api.setAccessToken(null);
  SESSION_STORAGE_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
  window.location.href = getCognitoLogoutUrl(
    config.cognitoDomain,
    config.cognitoClientId,
  );
}

export function getUserFromStoredToken(): User | null {
  const idToken = window.sessionStorage.getItem(ID_TOKEN_STORAGE_KEY);
  if (!idToken) return null;
  return decodeIdToken(idToken);
}
