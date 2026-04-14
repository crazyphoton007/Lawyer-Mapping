const envApiBase = process.env.EXPO_PUBLIC_API_BASE?.trim();

export const API_BASE = (
  envApiBase && envApiBase.length > 0
    ? envApiBase
    : "https://api.thecasefit.com"
).replace(/\/$/, "");
