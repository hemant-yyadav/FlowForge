import { Request, Response, NextFunction } from "express";
import { checkUser } from "@repo/backend-common/auth";

export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = (req.headers["authorization"] ?? "").replace("Bearer ", "");
    const userId = checkUser(token);
    if (!userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
    }
    req.userId = userId;
    next();
}