import { hashSync, compareSync } from "bcryptjs";

export function hashPassword(password: string): string {
  const saltRounds = 12;
  return hashSync(password, saltRounds);
}

export function verifyPassword(password: string, hashed: string): boolean {
  return compareSync(password, hashed);
}
