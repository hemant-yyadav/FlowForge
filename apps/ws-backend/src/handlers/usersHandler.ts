import { getUsersInRoom } from "../UserManager.js";

export function broadcastRoomUsers(roomId: string) {
    const usersInRoom = getUsersInRoom(roomId);
    
    // Extract safe user data (just name and userId, not the ws object)
    const userData = usersInRoom.map(u => ({
        id: u.userId,
        name: u.name
    }));

    const payload = JSON.stringify({ type: "room_users", users: userData });

    usersInRoom.forEach(user => {
        if (user.ws.readyState === 1) { // OPEN
            user.ws.send(payload);
        }
    });
}
