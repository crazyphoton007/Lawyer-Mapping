export function friendlyErrorMessage(error: unknown, fallback = "Please try again in a moment.") {
  const raw = error instanceof Error ? error.message : String(error || "");
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (!text) return fallback;

  if (
    lower.includes("network request failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("timeout")
  ) {
    return "We could not reach caseFit. Please check your connection and try again.";
  }

  if (lower.includes("http 401") || lower.includes("invalid token") || lower.includes("missing authorization")) {
    return "Your session has expired. Please log in again.";
  }

  if (lower.includes("http 429") || lower.includes("too many otp")) {
    return "Too many attempts. Please wait a little before trying again.";
  }

  if (lower.includes("http 500") || lower.includes("http 502") || lower.includes("http 503") || lower.includes("http 504")) {
    return "caseFit is temporarily unavailable. Please try again in a few minutes.";
  }

  if (text.startsWith("HTTP ")) return fallback;

  return text;
}
