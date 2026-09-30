import { Router, IRouter } from "express";
import { middleware } from "../middleware.js";
import { createRoom, getRoom, getShapes, getNotesForRoom, deleteRoom } from "../controllers/room.controller.js";

const router: IRouter = Router();

router.post("/room", middleware, createRoom);
router.get("/room/:slug", middleware, getRoom);
router.get("/room/:slug/shapes", middleware, getShapes);

router.get("/api/v1/rooms/:roomId/notes", middleware, getNotesForRoom);
router.delete("/room/:roomId", middleware, deleteRoom);

export default router;
