import { Router, IRouter } from "express";
import { middleware } from "../middleware.js";
import { createRoom, getRoom } from "../controllers/room.controller.js";

const router: IRouter = Router();

router.post("/room", middleware, createRoom);
router.get("/room/:slug", middleware, getRoom);

export default router;
