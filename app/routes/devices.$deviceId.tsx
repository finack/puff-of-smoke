import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteDevice, getDevice } from "~/models/device.server";
import { requireUserId } from "~/session.server";
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deviceId, "deviceId not found");

  const device = await getDevice({ id: params.deviceId, userId });
  if (!device) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ device });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deviceId, "deviceId not found");

  await deleteDevice({ id: params.deviceId, userId });

  return redirect("/devices");
};

export default function DeviceDetailsPage() {
  const data = useLoaderData<typeof loader>()

  const handleDelete = (e: { preventDefault: () => void; }) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this device?");
    if (!isConfirmed) {
      e.preventDefault(); // Prevents the form from submitting if the user cancels
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">{data.device.name}</h3>
        <Form method="post" className="flex items-center" onSubmit={handleDelete}>
          <button
            type="submit"
            className="bg-transparent text-red-500 hover:text-red-600 focus:text-red-400 text-2xl"
          >
            &minus;
          </button>
        </Form>
      </div>
      <p className="text-sm py-2">{data.device.description}</p>
      <hr className="my-4" />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}