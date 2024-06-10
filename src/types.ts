import { Oid } from "./mongo";

export enum DataSource {
  INTERNAL = "INTERNAL",
  MOVIELENS = "MOVIELENS",
}

export type RequestPayload = { userId: Oid };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      payload?: RequestPayload;
    }
  }
}
