/**
 * Seed script — creates/updates the single admin user.
 * Run once with: pnpm seed
 * Reads credentials from .env: ADMIN_EMAIL, ADMIN_PASSWORD
 */
// Node 18 polyfill: MongoDB driver requires globalThis.crypto
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto = webcrypto;
}
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

const seed = async (): Promise<void> => {
  const uri = process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/live_score';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const email = process.env['ADMIN_EMAIL'] ?? 'admin@score.com';
  const password = process.env['ADMIN_PASSWORD'] ?? 'admin123';
  const name = 'Admin';

  const hashed = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), password: hashed, name, role: 'admin' },
    { upsert: true, new: true }
  );

  console.log(`✅ Admin user seeded: ${email}`);
  console.log(`   Password: ${password}`);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
