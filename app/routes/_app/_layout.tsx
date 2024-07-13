import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { type Project, getProjects } from "~/models/project.server";
import { getProject, requireUser } from "~/session.server";

import { StackedLayout } from "~/components/stacked-layout";
import { NavBar } from "./navbar";
import { SideBar } from "./sidebar";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const currentProject = await getProject(request);
  const projects = await getProjects(user.id);
  return json({ projects, currentProject });
};

export default function AppLayout() {
  const { currentProject: jsonCurrentProject, projects: jsonProjects } =
    useLoaderData<typeof loader>();

  //biome-ignore lint/suspicious/noExplicitAny:
  const projects: Project[] = (jsonProjects as any[]).map((project) => ({
    ...project,
    createdAt: project.createdAt ? new Date(project.createdAt) : null,
    updatedAt: project.updatedAt ? new Date(project.updatedAt) : null,
  }));

  const currentProject: Project = {
    ...jsonCurrentProject,
    createdAt: jsonCurrentProject.createdAt
      ? new Date(jsonCurrentProject.createdAt)
      : null,
    updatedAt: jsonCurrentProject.updatedAt
      ? new Date(jsonCurrentProject.updatedAt)
      : null,
  };
  return (
    <div>
      <StackedLayout
        navbar={<NavBar projects={projects} currentProject={currentProject} />}
        sidebar={<SideBar />}
      >
        <Outlet />
      </StackedLayout>
    </div>
  );
}
