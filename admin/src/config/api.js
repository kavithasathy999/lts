const DEFAULT_PRODUCTION_API_URL = "https://api.luxurytravelshow.in";

const configuredApiUrl = process.env.REACT_APP_API_BASE_URL;

export const API_BASE_URL = (
  configuredApiUrl && configuredApiUrl.trim()
    ? configuredApiUrl
    : DEFAULT_PRODUCTION_API_URL
).trim().replace(/\/+$/, "");
