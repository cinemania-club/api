declare global {
  namespace Express {
    interface Request {
      payload?: { userId: Oid };
    }
  }
}

export {};
