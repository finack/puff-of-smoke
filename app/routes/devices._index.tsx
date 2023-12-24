import { Link } from "@remix-run/react";

export default function DevicesIndexPage() {
  return (
    <p>
      No note selected. Select a device on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new device.
      </Link>
    </p>
  );
}
