import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from 'react'

import { type Project, getProjects } from "~/models/project.server"

import { fromJson } from "~/db/schema"

import Navbar from "~/routes/project/navbar"
import SearchBar from "~/routes/project/search"

export const meta: MetaFunction = () => {
  return [
    { title: "Puff of Smoke" },
    { name: "description", content: "Wire management for experimental planes" },
  ];
};

export const loader = async () => {
  const userId: string = "2258aded-43b7-474c-b1a4-93ca9a478bee"
  const projects: Project[] = await getProjects({ ownerId: userId })
  return json({ projects: projects })
};

export default function ProjectIndex() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const data = useLoaderData<typeof loader>()
  const projects: Project[] = fromJson(data.projects);

  return (
    <div>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} projects={projects} />
      <SearchBar setSidebarOpen={setSidebarOpen} />

      <div className="xl:pl-72">

        <Outlet />
      </div>
    </div>
  )
}
