import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  listMatches,
  getMatch,
  createMatch,
  updateMatchStatus,
  updateMatchScore,
  deleteMatch,
} from "../controllers/matchController";

const router: Router = Router();

// All match routes require authentication
router.use(authenticate);

router.get("/", listMatches);
router.get("/:id", getMatch);
router.post("/", requireAdmin, createMatch);
router.patch("/:id/status", requireAdmin, updateMatchStatus);
router.patch("/:id/score", requireAdmin, updateMatchScore);
router.delete("/:id", requireAdmin, deleteMatch);

export default router;
