import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { fromJson } from "~/db/schema";
import { type Project, getProjects } from "~/models/project.server";
import { requireUserId } from "~/session.server";

import { StackedLayout } from "~/components/stacked-layout";
import { NavBar } from "./navbar";
import { SideBar } from "./sidebar";

export const meta: MetaFunction = () => {
  return [
    { title: "Puff of Smoke" },
    { name: "description", content: "Wire management for experimental planes" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // const userId: string = "2258aded-43b7-474c-b1a4-93ca9a478bee";
  const userId = await requireUserId(request);

  console.log("userId", userId);
  const projects: Project[] = await getProjects({ ownerId: userId });
  return json({ projects: projects });
};

export default function ProjectIndex() {
  const data = useLoaderData<typeof loader>();
  const projects: Project[] = fromJson(data.projects);

  return (
    <div className="w-screen">
      <StackedLayout navbar={<NavBar />} sidebar={<SideBar />}>
        <Outlet />
      </StackedLayout>
    </div>
  );
}
