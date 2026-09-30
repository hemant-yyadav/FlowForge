import { Router, IRouter } from "express";
import authRoutes from "./auth.routes";
import roomRoutes from "./room.routes";
import workspaceRoutes from "./workspace.routes";
import noteRoutes from "./note.routes";

const router: IRouter = Router();

router.use(authRoutes);
router.use(roomRoutes);
router.use("/api/v1/workspaces", workspaceRoutes);
router.use("/api/v1", noteRoutes);

export default router;
