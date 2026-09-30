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
    if (!user.password) {
        res.status(403).json({ message: "Please sign in with your connected OAuth provider (e.g., Google or GitHub)" });
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

export async function oauthSignin(req: Request, res: Response) {
    // This endpoint should only be called securely from the Next.js API route
    // after successful OAuth verification.
    const { email, name, provider, providerId } = req.body;

    if (!provider || !providerId) {
        res.status(400).json({ message: "Missing required OAuth fields" });
        return;
    }

    try {
        let user = null;
        
        // Try to find existing user by provider and providerId first
        user = await prismaClient.user.findFirst({
            where: { provider, providerId },
        });

        // Fallback: If no provider match, try matching by email if it exists
        if (!user && email) {
            user = await prismaClient.user.findFirst({
                where: { email },
            });
        }

        if (!user) {
            // Generate a random unique username
            const randomSuffix = Math.floor(Math.random() * 1000000).toString();
            // Name could also be null if not set on GitHub
            const safeName = name || "OAuth User";
            const generatedUsername = `${safeName.split(' ')[0].toLowerCase()}_${randomSuffix}`;
            
            user = await prismaClient.user.create({
                data: {
                    username: generatedUsername,
                    name: safeName,
                    email: email || null,
                    provider,
                    providerId,
                },
            });
        } else if (!user.provider) {
            // If the user exists (matched by email) but hasn't linked OAuth yet, link it
            user = await prismaClient.user.update({
                where: { id: user.id },
                data: { provider, providerId },
            });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, userId: user.id });
    } catch (error) {
        console.error("OAuth signin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMe(req: Request, res: Response) {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, username: true, email: true, photo: true }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ user });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
