import { json, type LoaderFunction, } from '@remix-run/node';
import { useNavigate, useLoaderData } from '@remix-run/react';
import React from 'react';

import { getDefaultOrLatestProject } from "~/models/project.server"

export const loader: LoaderFunction = async () => {
  const userId = "2258aded-43b7-474c-b1a4-93ca9a478bee"
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
