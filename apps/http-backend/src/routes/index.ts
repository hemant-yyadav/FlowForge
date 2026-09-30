import { Router, IRouter } from "express";
import authRoutes from "./auth.routes";
import roomRoutes from "./room.routes";
import workspaceRoutes from "./workspace.routes";
import noteRoutes from "./note.routes";
import tagRoutes from "./tag.routes";
import favoriteRoutes from "./favorite.routes";

const router: IRouter = Router();

router.use(authRoutes);
router.use(roomRoutes);
router.use("/api/v1/workspaces", workspaceRoutes);
router.use("/api/v1", noteRoutes);
router.use("/api/v1", tagRoutes);
router.use("/api/v1", favoriteRoutes);

export default router;
