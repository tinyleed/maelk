export const DEFAULT_CLIENT_REDIRECT_PATH = "/app";

const CLIENT_SAFE_REDIRECT_ORIGIN = "https://maelk.local";
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/u;

export function getClientSafeRedirectPath(candidate: string | null | undefined): string {
  if (typeof candidate !== "string" || candidate.length === 0) {
    return DEFAULT_CLIENT_REDIRECT_PATH;
  }

  if (hasUnsafeCharacters(candidate)) {
    return DEFAULT_CLIENT_REDIRECT_PATH;
  }

  let decodedCandidate: string;
  try {
    decodedCandidate = decodeURIComponent(candidate);
  } catch {
    return DEFAULT_CLIENT_REDIRECT_PATH;
  }

  if (hasUnsafeCharacters(decodedCandidate)) {
    return DEFAULT_CLIENT_REDIRECT_PATH;
  }

  if (!isRootRelativePath(candidate) || !isRootRelativePath(decodedCandidate)) {
    return DEFAULT_CLIENT_REDIRECT_PATH;
  }

  try {
    const redirectUrl = new URL(candidate, CLIENT_SAFE_REDIRECT_ORIGIN);
    if (redirectUrl.origin !== CLIENT_SAFE_REDIRECT_ORIGIN) {
      return DEFAULT_CLIENT_REDIRECT_PATH;
    }

    const redirectPath = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
    if (!isRootRelativePath(redirectPath) || hasUnsafeCharacters(redirectPath)) {
      return DEFAULT_CLIENT_REDIRECT_PATH;
    }

    return redirectPath;
  } catch {
    return DEFAULT_CLIENT_REDIRECT_PATH;
  }
}

function hasUnsafeCharacters(value: string): boolean {
  return CONTROL_CHARACTER_PATTERN.test(value) || value.includes("\\");
}

function isRootRelativePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}
