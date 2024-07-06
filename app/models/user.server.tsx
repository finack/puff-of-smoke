import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import db from "~/db/db.server";
import { type NewUser, type User, users } from "~/db/schema";
export type { User, NewUser } from "~/db/schema";

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function createUser(
  email: string,
  password: string,
): Promise<User[]> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: NewUser = {
    email,
    password: hashedPassword,
    status: "validating",
  };

  return db.insert(users).values(newUser).returning();
}

export async function deleteUserByEmail(email: string) {
  return db.delete(users).where(eq(users.email, email));
}

export async function verifyLogin(email: string, password: string) {
  const userWithPassword = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
