import { Router } from "express";
import { signin, signup, oauthSignin, getMe } from "../controllers/auth.controller.js";
import { middleware } from "../middleware.js";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/oauth", oauthSignin);
router.get("/me", middleware, getMe);

export default router;
