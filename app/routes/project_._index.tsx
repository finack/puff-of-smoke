import {
  type LoaderFunction,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import React from "react";

import { getDefaultOrLatestProject } from "~/models/project.server";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const defaultProject = await getDefaultOrLatestProject({ ownerId: userId });
  if (!defaultProject) {
    // TODO - Create a new project
    throw new Error("No projects found");
  }
  return json({ defaultProjectId: defaultProject.id });
};

export default function RedirectComponent() {
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();

  React.useEffect(() => {
    navigate(`/project/${data.defaultProjectId}/devices`);
  }, [navigate, data]);

  return null;
}
