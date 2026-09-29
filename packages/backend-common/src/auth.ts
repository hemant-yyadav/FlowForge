import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !(decoded as JwtPayload).userId) {
            return null;
        }
        return (decoded as JwtPayload).userId as string;
    } catch {
        return null;
    }
}
