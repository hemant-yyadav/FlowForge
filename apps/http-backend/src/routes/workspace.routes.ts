import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { createWorkspace, getWorkspaces, getWorkspace, getWorkspaceRooms } from "../controllers/workspace.controller";

const router: IRouter = Router();

router.post("/", middleware, createWorkspace);
router.get("/", middleware, getWorkspaces);
router.get("/:id", middleware, getWorkspace);
router.get("/:workspaceId/rooms", middleware, getWorkspaceRooms);

export default router;
