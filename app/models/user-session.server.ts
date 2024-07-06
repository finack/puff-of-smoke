import {
  type Cookie,
  type SessionData,
  createSessionStorage,
} from "@remix-run/node";
import { eq } from "drizzle-orm";

import db from "~/db/db.server";
import { userSessions } from "~/db/schema";
export type { NewUserSession, UserSession } from "~/db/schema";

export const SESSION_DURATION = 60 * 60 * 24 * 7;

export const createDataBaseSessionStorage = (cookie: Cookie) => {
  const storage = createSessionStorage({
    cookie,

    async createData(data, _expires) {
      console.log("createData: Data: ", data);
      const [results] = await db
        .insert(userSessions)
        .values({
          id: data.userId,
          data,
        })
        .onConflictDoUpdate({
          target: userSessions.id,
          set: { data: {}, updatedAt: new Date() },
        })
        .returning();

      console.log("createData: session: ", results);
      console.log("createData: sessionId: ", results.id);
      return results.id;
    },

    async readData(id) {
      // async readData(id: string): Promise<Partial<SessionData & { [x: `__flash_${string}__`]: any; } & { [x: `__flash_${string}__`]: any;[x: `__flash___flash_${string}____`]: any; }> | null> {

      console.log("readData: id:", id);
      const session = await db.query.userSessions.findFirst({
        where: eq(userSessions.id, id),
      });
      if (!session) {
        console.log("readData: Session not found");
        return null;
      }

      // export const SESSION_DURATION = 60 * 60 * 24 * 7
      const sessionExpiration = new Date(
        session.updatedAt.getTime() + SESSION_DURATION * 1000,
      );
      console.log("readData: sessionExires", sessionExpiration);

      if (new Date() > sessionExpiration) {
        console.log("readData: Session expired");
        await db.delete(userSessions).where(eq(userSessions.id, id));
        return null;
      }

      console.log("readData: data:", session.data);
      return session.data;
    },

    async updateData(id, data, _expires) {
      console.log("updateData: id:", id);
      await db
        .update(userSessions)
        .set({
          data,
          updatedAt: new Date(),
        })
        .where(eq(userSessions.id, id));
    },

    async deleteData(id) {
      console.log("deleteData: id:", id);
      await db.delete(userSessions).where(eq(userSessions.id, id));
    },
  });

  return storage;
};
