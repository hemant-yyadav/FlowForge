import { WebSocket } from "ws";

export interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
    name: string;
}

const users: User[] = [];

export function addUser(user: User) {
    users.push(user);
}

export function removeUser(ws: WebSocket) {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) {
        users.splice(index, 1);
    }
}

export function findUser(ws: WebSocket): User | undefined {
    return users.find((u) => u.ws === ws);
}

export function getUsersInRoom(roomId: string): User[] {
    return users.filter((u) => u.rooms.includes(roomId));
}

export function getActiveRooms(): string[] {
    const activeRooms = new Set<string>();
    users.forEach(u => {
        u.rooms.forEach(r => activeRooms.add(r));
    });
    return Array.from(activeRooms);
}
