import type { ActionFunctionArgs } from "@remix-run/node";
import { useEffect } from "react";

import { logout } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) =>
  logout(request);

export default function Logout() {
  useEffect(() => {
    fetch(window.location.href, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/";
        } else {
          console.error("Logout failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return <div>Logging out...</div>;
}
