export const WS_MESSAGE_TYPES = {
    AUTHENTICATE: "authenticate",
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    CHAT: "chat",
    DRAW: "draw",
    CLEAR_BOARD: "clear_board",
    CURSOR: "cursor",
} as const;

export type WsMessageType = (typeof WS_MESSAGE_TYPES)[keyof typeof WS_MESSAGE_TYPES];
