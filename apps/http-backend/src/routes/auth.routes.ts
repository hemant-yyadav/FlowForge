import { Router } from "express";
import { signin, signup, oauthSignin } from "../controllers/auth.controller.js";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/oauth", oauthSignin);

export default router;
