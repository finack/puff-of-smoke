import { asc, desc, eq } from "drizzle-orm";

import db from "~/db/db.server";
import { type Project, projects } from "~/db/schema";

export type { Project };

export async function getProjectById(
  projectId: string,
): Promise<Project | undefined> {
  return await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
}

export async function getProjects(
  ownerId: Project["ownerId"],
): Promise<Project[]> {
  return await db.query.projects.findMany({
    where: eq(projects.ownerId, ownerId),
    orderBy: [asc(projects.isDefault), asc(projects.name)],
  });
}

export async function getDefaultOrLatestProject(
  ownerId: Project["ownerId"],
): Promise<Project | undefined> {
  console.log("getDefaultOrLatestProject: ownerId:", ownerId);
  return await db.query.projects.findFirst({
    where: eq(projects.ownerId, ownerId),
    orderBy: [desc(projects.isDefault), desc(projects.createdAt)],
  });
}
