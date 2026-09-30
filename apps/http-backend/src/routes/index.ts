import { Router, IRouter } from "express";
import authRoutes from "./auth.routes";
import roomRoutes from "./room.routes";
import workspaceRoutes from "./workspace.routes";

const router: IRouter = Router();

router.use(authRoutes);
router.use(roomRoutes);
router.use("/api/v1/workspaces", workspaceRoutes);

export default router;
