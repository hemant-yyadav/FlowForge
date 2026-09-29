import { Router, IRouter } from "express";
import { signup, signin } from "../controllers/auth.controller";

const router: IRouter = Router();

router.post("/signup", signup);
router.post("/signin", signin);

export default router;
