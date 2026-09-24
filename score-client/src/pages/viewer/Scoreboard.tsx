import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import type { Match } from "../../types.ts";
import { socket } from "../../socket/socket.ts";

export default function Scoreboard() {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load initial match data
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    socket.emit("join-room", id);
    (api.matches.get(id) as Promise<Match>)
      .then((data) => {
        if (!ignore) {
          setMatch(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load match");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    socket.on("match-update", (data) => {
      console.log("match update", data);
      if (id === data.roomId) {
        setMatch((old) => ({
          ...old,
          teamA: data.payload.teamA,
          teamB: data.payload.teamB,
        }));
      }
    });
  }, []);

  // TODO: Add socket setup here

  if (loading)
    return (
      <div className="loading-screen">
        <p>Loading scoreboard...</p>
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
            onClick={() => navigate("/viewer")}
          >
            ← Back
          </button>
          <h1>
            {sportIcon} {match.name}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {match.status === "live" && (
            <span className="live-indicator live-indicator--connected">
              <span className="live-dot" />
              LIVE
            </span>
          )}
          <button className="btn btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        <section className="card scoreboard-viewer">
          {/* Status Banner */}
          <div className="scoreboard-status">
            <span className={`badge badge-lg badge-${match.status}`}>
              {match.status === "live" && <span className="pulse-dot" />}
              {match.status.toUpperCase()}
            </span>
          </div>

          {/* Scores */}
          <div className="scoreboard-grid">
            <div className="scoreboard-team">
              <div className="team-name">{match.teamA.name}</div>
              <div className="team-score">{match.teamA.score}</div>
            </div>

            <div className="scoreboard-divider">
              <span>—</span>
            </div>

            <div className="scoreboard-team">
              <div className="team-name">{match.teamB.name}</div>
              <div className="team-score">{match.teamB.score}</div>
            </div>
          </div>

          {match.status === "finished" && (
            <div className="result-banner">
              {match.teamA.score > match.teamB.score
                ? `🏆 ${match.teamA.name} wins!`
                : match.teamB.score > match.teamA.score
                  ? `🏆 ${match.teamB.name} wins!`
                  : "🤝 It's a draw!"}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
