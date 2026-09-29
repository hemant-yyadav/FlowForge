import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserSchema, SigninSchema } from "@repo/common/src/types";
import { prismaClient } from "db";
import { JWT_SECRET } from "@repo/backend-common/config";

export async function signup(req: Request, res: Response) {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid inputs" });
        return;
    }
    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
        const user = await prismaClient.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                name: parsedData.data.name,
            },
        });
        res.json({ userId: user.id });
    } catch {
        res.status(409).json({ message: "User already exists" });
    }
}

export async function signin(req: Request, res: Response) {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid inputs" });
        return;
    }
    const user = await prismaClient.user.findFirst({
        where: { username: parsedData.data.username },
    });
    if (!user) {
        res.status(403).json({ message: "Invalid credentials" });
        return;
    }
    const isPasswordCorrect = await bcrypt.compare(parsedData.data.password, user.password);
    if (!isPasswordCorrect) {
        res.status(403).json({ message: "Invalid credentials" });
        return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
}
