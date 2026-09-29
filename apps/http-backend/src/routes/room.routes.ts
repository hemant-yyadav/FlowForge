import { Router, IRouter } from "express";
import { middleware } from "../middleware.js";
import { createRoom, getRoom, getShapes } from "../controllers/room.controller.js";

const router: IRouter = Router();

router.post("/room", middleware, createRoom);
router.get("/room/:slug", middleware, getRoom);
router.get("/room/:slug/shapes", middleware, getShapes);

export default router;
