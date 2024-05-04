export const BRT = "America/Sao_Paulo";

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";

export const isApi = process.env.MODE === "api";
export const isWorker = process.env.MODE === "worker";

export const MONGO_URL = "mongodb://mongo/cinemania";
export const ELASTICSEARCH_URL = "http://elasticsearch:9200";
export const REDIS_URL = { host: "redis", port: 6379 };

export const SEARCH_PAGE_SIZE = 100;
