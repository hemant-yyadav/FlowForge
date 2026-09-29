export const WS_MESSAGE_TYPES = {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    CHAT: "chat",
} as const;

export type WsMessageType = (typeof WS_MESSAGE_TYPES)[keyof typeof WS_MESSAGE_TYPES];
