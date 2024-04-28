export const BRT = "America/Sao_Paulo";

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";

export const isApi = process.env.MODE === "api";
export const isWorker = process.env.MODE === "worker";

export const MOVIES_PAGE_SIZE = 100;
export const POPULAR_MOVIES_PAGES_LIMIT = 1000;
