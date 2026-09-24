import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam {
  name: string;
  score: number;
}

export interface IMatch extends Document {
  name: string;
  sport: 'football' | 'basketball';
  status: 'upcoming' | 'live' | 'finished';
  teamA: ITeam;
  teamB: ITeam;
  createdAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    score: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const matchSchema = new Schema<IMatch>(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, enum: ['football', 'basketball'], required: true },
    status: { type: String, enum: ['upcoming', 'live', 'finished'], default: 'upcoming' },
    teamA: { type: teamSchema, required: true },
    teamB: { type: teamSchema, required: true },
  },
  { timestamps: true }
);

export const Match = mongoose.model<IMatch>('Match', matchSchema);
