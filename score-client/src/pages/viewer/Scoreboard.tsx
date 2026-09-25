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
    // [EMIT] join-room
    // Tells the server to subscribe this socket to a match-specific room
    // so that targeted "match-update" events (score changes) are delivered
    // only to sockets watching this particular match.
    socket.emit("join-room", id);
    api.matches
      .get(id)
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
    interface MatchUpdatePayload {
      roomId: string;
      payload: {
        teamA: Match["teamA"];
        teamB: Match["teamB"];
      };
    }

    // [LISTENER] match-update
    // Emitted by the server when the admin updates the score of this match.
    // Payload: { roomId: string, payload: { name, sport, teamA, teamB } }
    // Action: Merges the new teamA / teamB scores into local state so the
    //         scoreboard reflects the change instantly without a page refresh.
    const handleMatchUpdate = (data: MatchUpdatePayload) => {
      if (id === data.roomId) {
        setMatch((old) => {
          if (!old) return old;
          return {
            ...old,
            teamA: data.payload.teamA,
            teamB: data.payload.teamB,
          };
        });
      }
    };
    socket.on("match-update", handleMatchUpdate);

    // [LISTENER] match:status:update
    // Emitted by the server when an admin changes this match's status.
    // Payload: { id: string, status: 'upcoming' | 'live' | 'finished' }
    // Action: Updates the status banner on the scoreboard (e.g. shows LIVE indicator,
    //         reveals the result banner when the match is finished).
    const handleStatusUpadte = (data: {
      id: string;
      status: Match["status"];
    }) => {
      const { id, status } = data;

      setMatch((prev) => {
        if (!prev || prev._id !== id) return prev;
        return { ...prev, status };
      });
    };

    socket.on("match:status:update", handleStatusUpadte);

    return () => {
      // Remove listeners on cleanup to avoid stale handlers accumulating on re-mount.
      socket.off("match-update", handleMatchUpdate);
      socket.off("match:status:update", handleStatusUpadte);
    };
  }, []);

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
