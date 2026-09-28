import { Request,Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req : Request,res:Response,next : Function){
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token,JWT_SECRET);
    if(!decoded){
        res.status(403).json({
            message : "wrong credentials"
        })
        return;
    }
    // @ts-ignore
    req.userId = decoded.userId;
    next();
}