import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { createWorkspace, getWorkspaces, getWorkspace, getWorkspaceRooms, deleteWorkspace, addMember, removeMember, changeMemberRole } from "../controllers/workspace.controller";

const router: IRouter = Router();

router.post("/", middleware, createWorkspace);
router.get("/", middleware, getWorkspaces);
router.get("/:id", middleware, getWorkspace);
router.get("/:workspaceId/rooms", middleware, getWorkspaceRooms);
router.delete("/:id", middleware, deleteWorkspace);
router.post("/:id/members", middleware, addMember);
router.delete("/:id/members/:userId", middleware, removeMember);
router.put("/:id/members/:userId/role", middleware, changeMemberRole);

export default router;
