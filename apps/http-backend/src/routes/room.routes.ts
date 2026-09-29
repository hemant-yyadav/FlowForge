import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { createRoom } from "../controllers/room.controller";

const router: IRouter = Router();

router.post("/room", middleware, createRoom);

export default router;
