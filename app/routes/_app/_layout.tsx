import type { MetaFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

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
  await requireUserId(request);
  return null;
};

export default function ProjectIndex() {
  return (
    <div className="w-screen">
      <StackedLayout navbar={<NavBar />} sidebar={<SideBar />}>
        <Outlet />
      </StackedLayout>
    </div>
  );
}
