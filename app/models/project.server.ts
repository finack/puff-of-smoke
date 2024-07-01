import { asc, desc, eq } from "drizzle-orm";

import db from "~/db/db.server";
import { type Project, projects } from "~/db/schema";

export type { Project };

export function getProjects({
  ownerId,
}: {
  ownerId: Project["ownerId"];
}): Promise<Project[]> {
  return db.query.projects.findMany({
    where: eq(projects.ownerId, ownerId),
    orderBy: [asc(projects.isDefault), asc(projects.name)],
  });
}

export function getDefaultOrLatestProject({
  ownerId,
}: {
  ownerId: Project["ownerId"];
}): Promise<Project | undefined> {
  return db.query.projects.findFirst({
    where: eq(projects.ownerId, ownerId),
    orderBy: [desc(projects.isDefault), desc(projects.createdAt)],
  });
}
