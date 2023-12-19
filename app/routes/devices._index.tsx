import { Link } from "@remix-run/react";

export default function DeviceIndexPage() {
  return (
    <p>
      No device selected. Select a device on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new note.
      </Link>
    </p>
  );
}
