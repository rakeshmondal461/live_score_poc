import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import type { Match } from "../../types.ts";
import { socket } from "../../socket/socket.ts";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Create form state
  const [name, setName] = useState("");
  const [sport, setSport] = useState<"football" | "basketball">("football");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const data = await api.matches.list();
      setMatches(data);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to load matches",
      );
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.matches.list()
      .then((data) => {
        if (!ignore) {
          setMatches(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setFetchError(
            err instanceof Error ? err.message : "Failed to load matches",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingMatches(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      await api.matches.create({ name, sport, teamA, teamB });
      setName("");
      setTeamA("");
      setTeamB("");
      setSport("football");
      await fetchMatches();
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create match",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await api.matches.delete(id);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete match");
    }
  };

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

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>🏆 LiveScore — Admin</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button className="btn btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="container">
        {/* Create Match */}
        <section className="card">
          <h2>Create New Match</h2>
          {createError && (
            <div className="alert alert-error">{createError}</div>
          )}
          <form onSubmit={handleCreate} className="create-form">
            <div className="form-group">
              <label htmlFor="match-name">Match Name</label>
              <input
                id="match-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Quarter Finals"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sport">Sport</label>
                <select
                  id="sport"
                  value={sport}
                  onChange={(e) =>
                    setSport(e.target.value as "football" | "basketball")
                  }
                >
                  <option value="football">⚽ Football</option>
                  <option value="basketball">🏀 Basketball</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="team-a">Team A</label>
                <input
                  id="team-a"
                  type="text"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder="Team name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="team-b">Team B</label>
                <input
                  id="team-b"
                  type="text"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder="Team name"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? "Creating..." : "+ Create Match"}
            </button>
          </form>
        </section>

        {/* Match List */}
        <section className="card">
          <h2>All Matches</h2>
          {loadingMatches && <p className="muted">Loading matches...</p>}
          {fetchError && <div className="alert alert-error">{fetchError}</div>}
          {!loadingMatches && matches.length === 0 && (
            <p className="muted">No matches yet. Create one above.</p>
          )}
          <div className="match-list">
            {matches.map((match) => (
              <div key={match._id} className="match-item">
                <div className="match-info">
                  <span className="match-sport">
                    {match.sport === "football" ? "⚽" : "🏀"}
                  </span>
                  <div>
                    <strong>{match.name}</strong>
                    <div className="match-teams">
                      {match.teamA.name} vs {match.teamB.name}
                    </div>
                  </div>
                  {statusBadge(match.status)}
                </div>
                <div className="match-actions">
                  <Link
                    to={`/admin/match/${match._id}`}
                    className="btn btn-sm btn-secondary"
                  >
                    Manage
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => void handleDelete(match._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
