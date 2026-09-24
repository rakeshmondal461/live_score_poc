export interface Team {
  name: string;
  score: number;
}

export interface Match {
  _id: string;
  name: string;
  sport: 'football' | 'basketball';
  status: 'upcoming' | 'live' | 'finished';
  teamA: Team;
  teamB: Team;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ScoreUpdatePayload {
  matchId: string;
  teamA: Team;
  teamB: Team;
}

export interface StatusUpdatePayload {
  matchId: string;
  status: Match['status'];
}
