import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      payload?: { userId: Types.ObjectId };
    }
  }
}

export {};
