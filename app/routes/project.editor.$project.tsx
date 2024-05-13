import { useEffect, useState } from 'react';
import { type ActionFunctionArgs, json } from "@remix-run/node"
import { Form } from '@remix-run/react';

import type { Project } from '~/db/schema';
import { insertProjectSchema } from '~/db/schema';

import { Button } from '~/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '~/components/catalyst/dialog'
import { Field, Label } from '~/components/catalyst/fieldset'
import { Input } from '~/components/catalyst/input'


export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  console.log("action", formData);
}


export default function ProjectEditor() {
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);

  // console.log("ProjectEditor", project);

  return (
    <div>
      <Form method="post">
        <DialogBody>
          <Field>
            <Label>Amount</Label>
            <Input name="amount" placeholder="$0.00" />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setProjectEditorOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Form>
    </div>
  )

};
