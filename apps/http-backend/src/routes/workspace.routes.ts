import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { createWorkspace, getWorkspaces, getWorkspace } from "../controllers/workspace.controller";

const router: IRouter = Router();

router.post("/", middleware, createWorkspace);
router.get("/", middleware, getWorkspaces);
router.get("/:id", middleware, getWorkspace);

export default router;
