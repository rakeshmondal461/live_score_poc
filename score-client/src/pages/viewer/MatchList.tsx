import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import type { Match } from "../../types.ts";
import { socket } from "../../socket/socket.ts";

export default function ViewerMatchList() {
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState<Match>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      const data = (await api.matches.list()) as Match[];
      setMatches(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (api.matches.list() as Promise<Match[]>)
      .then((data) => {
        if (!ignore) {
          setMatches(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load matches",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    // Auto-refresh every 30 seconds
    // const interval = setInterval(() => {
    //   void fetchMatches();
    // }, 30000);

    return () => {
      ignore = true;
      //clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    socket.on("match:created", (data) => {
      console.log("created match", data);
      setMatches((prev) => [data, ...prev]);
    });
  }, []);

  useEffect(() => {
    console.log("matches", matches);
  }, [matches]);

  const statusBadge = (status: Match["status"]) => {
    const map: Record<Match["status"], string> = {
      upcoming: "badge-upcoming",
      live: "badge-live",
      finished: "badge-finished",
    };
    return (
      <span className={`badge ${map[status]}`}>{status.toUpperCase()}</span>
    );
  };

  const sportIcon = (sport: Match["sport"]) =>
    sport === "football" ? "⚽" : "🏀";

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>🏆 LiveScore</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button className="btn btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="container">
        <section className="card">
          <div className="section-header">
            <h2>Matches</h2>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => void fetchMatches()}
            >
              Refresh
            </button>
          </div>

          {loading && <p className="muted">Loading matches...</p>}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && matches.length === 0 && (
            <p className="muted">No matches available yet. Check back later.</p>
          )}

          <div className="match-list">
            {matches.map((match) => (
              <Link
                key={match._id}
                to={`/viewer/match/${match._id}`}
                className="match-item match-item-link"
              >
                <div className="match-info">
                  <span className="match-sport">{sportIcon(match.sport)}</span>
                  <div>
                    <strong>{match.name}</strong>
                    <div className="match-teams">
                      {match.teamA.name} {match.teamA.score} —{" "}
                      {match.teamB.score} {match.teamB.name}
                    </div>
                  </div>
                  {statusBadge(match.status)}
                </div>
                <span className="arrow">›</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
