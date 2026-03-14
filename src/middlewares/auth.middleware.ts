import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers['token'] as string;

    if (!token) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("jwt secret not set");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(403).json({
        message: "Invalid User",
      });
    }

    req.userId = decoded.id;

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

export default authMiddleware;
