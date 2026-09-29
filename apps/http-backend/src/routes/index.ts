import { Router, IRouter } from "express";
import authRoutes from "./auth.routes";
import roomRoutes from "./room.routes";

const router: IRouter = Router();

router.use(authRoutes);
router.use(roomRoutes);

export default router;
