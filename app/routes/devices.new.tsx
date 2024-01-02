import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";

import { createDevice } from "~/models/device.server";
import { requireUserId } from "~/session.server";

const schema = z.object({
  name: z.string({ required_error: "Name is required" }),
  description: z
    .string()
    .optional()
    .transform((val) => val ?? null),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 });
  }

  const userId = await requireUserId(request);
  const { name, description } = submission.value;

  const device = await createDevice({ description, name, userId });

  return redirect(`/devices/${device.id}`);
}

export default function NewDevicePage() {
  const lastSubmission = useActionData<typeof action>();
  const [form, { name, description }] = useForm({
    lastSubmission,
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
      {...form.props}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Name: </span>
          <input
            name={name.name}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
          <div className="pt-1 text-red-700" id="name-error">
            {name.error}
          </div>
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Description: </span>
          <textarea
            name={description.name}
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
          />
          <div className="pt-1 text-red-700" id="description-error">
            {description.error}
          </div>
        </label>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
