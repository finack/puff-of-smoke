import { Button } from '~/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '~/components/catalyst/dialog'
import { Field, Label } from '~/components/catalyst/fieldset'
import { Input } from '~/components/catalyst/input'
import { useEffect } from 'react';

import type { Project } from '~/db/schema';

interface ProjectEditorProps {
  project: Project | null,
  projectEditorOpen: boolean,
  setProjectEditorOpen: (open: boolean) => void,
  setSidebarOpen: (open: boolean) => void,
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, setProjectEditorOpen, projectEditorOpen, setSidebarOpen }) => {

  useEffect(() => {
    if (projectEditorOpen === true) {
      setSidebarOpen(false)
    }
  }, [projectEditorOpen, setSidebarOpen]);

  console.log("ProjectEditor", project);

  return (
    <>
      <Dialog open={projectEditorOpen} onClose={setProjectEditorOpen}>
        <DialogTitle>Refund payment</DialogTitle>
        <DialogDescription>
          The refund will be reflected in the customer’s bank account 2 to 3 business days after processing.
        </DialogDescription>
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
          <Button onClick={() => setProjectEditorOpen(false)}>Refund</Button>
        </DialogActions>
      </Dialog>
    </>
  )
};
