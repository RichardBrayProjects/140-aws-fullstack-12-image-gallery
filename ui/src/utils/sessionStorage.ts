export const TOKEN_STORAGE_KEY = "cognito_access_token";
export const ID_TOKEN_STORAGE_KEY = "cognito_id_token";
export const CODE_VERIFIER_KEY = "pkce_code_verifier";
export const STATE_KEY = "oauth_state";
export const REDIRECT_URI_KEY = "oauth_redirect_uri";

export const SESSION_STORAGE_KEYS = [
  TOKEN_STORAGE_KEY,
  ID_TOKEN_STORAGE_KEY,
  CODE_VERIFIER_KEY,
  STATE_KEY,
  REDIRECT_URI_KEY,
] as const;
