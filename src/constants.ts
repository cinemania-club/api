export const BRT = "America/Sao_Paulo";

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";

export const MONGO_URL = "mongodb://mongo/cinemania";
export const ELASTICSEARCH_URL = "http://elasticsearch:9200";
export const REDIS_URL = "redis://redis:6379";

export const PASSWORD_SALT_ROUNDS = 10;
export const JWT_EXPIRATION = "30 days";

export const LIST_PAGE_SIZE = 100;
