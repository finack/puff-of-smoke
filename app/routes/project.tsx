import type { MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from 'react'
import { json } from "@remix-run/node";

import {
  Bars3Icon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'

import { clsx } from 'clsx'

import { getProjects, type Project } from "~/models/project.server"

import { fromJson } from "~/db/schema"

import { Text } from "~/components/catalyst/text"
import Navbar from "~/components/navbar"
import SearchBar from "~/components/search"

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
