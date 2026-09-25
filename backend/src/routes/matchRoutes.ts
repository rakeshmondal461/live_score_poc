import { Router, Response } from "express";
import { Match } from "../models/Match";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { getIO } from "../socket/initSocket";

const router: Router = Router();

// All match routes require authentication
router.use(authenticate);

// GET /api/matches — List all matches
router.get("/", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/matches/:id — Get single match
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params["id"]);
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.json(match);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/matches — Create match (admin only)
router.post(
  "/",
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, sport, teamA, teamB } = req.body as {
        name?: string;
        sport?: "football" | "basketball";
        teamA?: string;
        teamB?: string;
      };

      if (!name || !sport || !teamA || !teamB) {
        res
          .status(400)
          .json({ message: "name, sport, teamA, teamB are required" });
        return;
      }

      if (sport !== "football" && sport !== "basketball") {
        res
          .status(400)
          .json({ message: "sport must be football or basketball" });
        return;
      }

      const match = await Match.create({
        name,
        sport,
        teamA: { name: teamA, score: 0 },
        teamB: { name: teamB, score: 0 },
        status: "upcoming",
      });

      const io = getIO();
      io.emit("match:created", match);

      res.status(201).json(match);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PATCH /api/matches/:id/status — Update match status (admin only)
router.patch(
  "/:id/status",
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body as { status?: string };
      const allowed = ["upcoming", "live", "finished"];

      if (!status || !allowed.includes(status)) {
        res
          .status(400)
          .json({ message: "status must be upcoming | live | finished" });
        return;
      }

      const match = await Match.findByIdAndUpdate(
        req.params["id"],
        { status },
        { new: true },
      );

      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      const io = getIO();
      io.emit("match:status:update", { id: match._id, status: match.status });

      res.json(match);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PATCH /api/matches/:id/score — Update score (admin only)
router.patch(
  "/:id/score",
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { team, delta } = req.body as { team?: string; delta?: number };

      if (!team || (team !== "teamA" && team !== "teamB")) {
        res.status(400).json({ message: "team must be teamA or teamB" });
        return;
      }
      if (delta !== 1 && delta !== -1) {
        res.status(400).json({ message: "delta must be 1 or -1" });
        return;
      }

      const match = await Match.findById(req.params["id"]);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      if (team === "teamA") {
        match.teamA.score = Math.max(0, match.teamA.score + delta);
      } else {
        match.teamB.score = Math.max(0, match.teamB.score + delta);
      }

      await match.save();

      res.json(match);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/matches/:id — Delete match (admin only)
router.delete(
  "/:id",
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const match = await Match.findByIdAndDelete(req.params["id"]);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }
      const io = getIO();
      io.emit("match:deleted", { id: match._id });

      res.json({ message: "Match deleted successfully" });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
