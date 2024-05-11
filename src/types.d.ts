import { Oid } from "./mongo";

export type RequestPayload = { userId: Oid };

declare global {
  namespace Express {
    interface Request {
      payload?: RequestPayload;
    }
  }
}

export {};
