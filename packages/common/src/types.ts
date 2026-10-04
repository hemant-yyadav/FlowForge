import z from "zod";

export const CreateUserSchema = z.object({
    username : z.string().min(3).max(20),
    password : z.string().min(6).max(10),
    name : z.string()
})

export const SigninSchema = z.object({
    username : z.string().min(3).max(20),
    password : z.string().min(6).max(10)
})

export const CreateRoomSchema = z.object({
    name : z.string().min(3).max(20),
    password : z.string().min(6).max(10).optional(),
    workspaceId: z.string().optional()
})

const RoomIdSchema = z.string().min(3).max(100).regex(/^[A-Za-z0-9_-]+$/);
const ChatMessageSchema = z.string().trim().min(1).max(2_000);
const FiniteCoordinateSchema = z.number().finite().min(-100_000).max(100_000);
const ShapeSchema = z.object({
    type: z.string().min(1).max(64),
}).catchall(z.unknown()).refine((shape) => new TextEncoder().encode(JSON.stringify(shape)).byteLength <= 16_000, {
    message: "Shape payload is too large",
});

export const WebSocketInboundMessageSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("authenticate"), token: z.string().min(1).max(8_192) }),
    z.object({ type: z.literal("join_room"), roomId: RoomIdSchema }),
    z.object({ type: z.literal("leave_room"), roomId: RoomIdSchema }),
    z.object({ type: z.literal("chat"), roomId: RoomIdSchema, message: ChatMessageSchema }),
    z.object({ type: z.literal("draw"), roomId: RoomIdSchema, shape: ShapeSchema }),
    z.object({ type: z.literal("clear_board"), roomId: RoomIdSchema }),
    z.object({ type: z.literal("cursor"), roomId: RoomIdSchema, x: FiniteCoordinateSchema, y: FiniteCoordinateSchema }),
]);

export type WebSocketInboundMessage = z.infer<typeof WebSocketInboundMessageSchema>;
