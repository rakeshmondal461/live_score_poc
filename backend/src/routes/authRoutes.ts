import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { register, login, getMe } from "../controllers/authController";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
