import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import type { Match } from "../../types.ts";
import { socket } from "../../socket/socket.ts";

const STATUS_OPTIONS: Match["status"][] = ["upcoming", "live", "finished"];

export default function MatchControl() {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingScore, setUpdatingScore] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const data = await api.matches.get(id);
        setMatch(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load match");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleScore = async (team: "teamA" | "teamB", delta: 1 | -1) => {
    if (!id || !match) return;
    setUpdatingScore(true);
    try {
      const updated = await api.matches.updateScore(id, team, delta);
      console.log("updated", updated);
      const { name, sport, teamA, teamB } = updated;
      // [EMIT] send:match:update
      // Sent to the server after a successful score update via the REST API.
      // Payload: { roomId: match._id, payload: { name, sport, teamA, teamB } }
      // The server forwards this as "match-update" to all sockets in the match room,
      // so viewers on the Scoreboard page see the new score instantly.
      socket.emit("send:match:update", {
        roomId: updated._id,
        payload: { name, sport, teamA, teamB },
      });
      setMatch(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update score");
    } finally {
      setUpdatingScore(false);
    }
  };

  const handleStatus = async (status: Match["status"]) => {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.matches.updateStatus(id, status);
      setMatch(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading)
    return (
      <div className="loading-screen">
        <p>Loading match...</p>
      </div>
    );
  if (error)
    return (
      <div className="loading-screen">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  if (!match) return null;

  const sportIcon = match.sport === "football" ? "⚽" : "🏀";

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/admin")}
          >
            ← Back
          </button>
          <h1>
            {sportIcon} {match.name}
          </h1>
          <p>
            {match.teamA.name} vs {match.teamB.name}
          </p>
        </div>
        <button className="btn btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="container">
        {/* Scoreboard */}
        <section className="card scoreboard-admin">
          <div className="score-panel">
            <div className="team-control">
              <h2>{match.teamA.name}</h2>
              <div className="score-display">{match.teamA.score}</div>
              <div className="score-buttons">
                <button
                  className="btn btn-score btn-plus"
                  onClick={() => void handleScore("teamA", 1)}
                  disabled={match.status !== "live" || updatingScore}
                >
                  +
                </button>
                <button
                  className="btn btn-score btn-minus"
                  onClick={() => void handleScore("teamA", -1)}
                  disabled={
                    match.status !== "live" ||
                    updatingScore ||
                    match.teamA.score === 0
                  }
                >
                  −
                </button>
              </div>
            </div>

            <div className="score-separator">
              <span className="vs">VS</span>
              <span className={`badge badge-${match.status}`}>
                {match.status.toUpperCase()}
              </span>
            </div>

            <div className="team-control">
              <h2>{match.teamB.name}</h2>
              <div className="score-display">{match.teamB.score}</div>
              <div className="score-buttons">
                <button
                  className="btn btn-score btn-plus"
                  onClick={() => void handleScore("teamB", 1)}
                  disabled={match.status !== "live" || updatingScore}
                >
                  +
                </button>
                <button
                  className="btn btn-score btn-minus"
                  onClick={() => void handleScore("teamB", -1)}
                  disabled={
                    match.status !== "live" ||
                    updatingScore ||
                    match.teamB.score === 0
                  }
                >
                  −
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Status Control */}
        <section className="card">
          <h2>Match Status</h2>
          <div className="status-buttons">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`btn btn-status ${match.status === s ? "btn-status-active" : "btn-outline"}`}
                onClick={() => void handleStatus(s)}
                disabled={updatingStatus || match.status === s}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Status changes are broadcast to all viewers in real-time.
          </p>
        </section>
      </main>
    </div>
  );
}
