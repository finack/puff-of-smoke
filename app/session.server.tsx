import { createCookie, redirect } from "@remix-run/node";

import {
  type Project,
  getDefaultOrLatestProject,
  getProjectById,
} from "~/models/project.server";
import { createDataBaseSessionStorage } from "~/models/user-session.server";
import { type User, getUserById } from "~/models/user.server";

import config from "~/config";

const USER_SESSION_KEY = "userId";
const PROJECT_KEY = "projectId";

const sessionCookie = createCookie("__session", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [config.SESSION_SECRET],
  secure: config.isProduction,
});

const { getSession, commitSession, destroySession } =
  createDataBaseSessionStorage(sessionCookie);

export async function getProject(request: Request): Promise<Project> {
  const projectId = await getProjectId(request);
  const project = await getProjectById(projectId);
  if (!project) throw new Error("getProject: Could not find project");
  return project;
}
export async function getProjectId(request: Request): Promise<Project["id"]> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get(USER_SESSION_KEY);
  const projectId = session.get(PROJECT_KEY);

  if (projectId) {
    return projectId;
  }

  const project = await getDefaultOrLatestProject(userId);

  if (!project) {
    throw new Error("getProjectId: Could not find default project");
  }
  return project.id;
}

export async function getUserIdFromSession(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserIdFromSession(request);

  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserIdFromSession(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  console.log("requireUser:", request.url);

  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  redirectTo,
}: {
  request: Request;
  userId: string;
  redirectTo: string;
}) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(USER_SESSION_KEY, userId);
  session.flash("globalMessage", "Welcome");
  console.log("createUserSession: userId:", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

/**
 * This function retrieves and deletes a flash message from the session.
 *
 * @param {Request} request - The request object.
 * @param {string} key - The key of the flash message to retrieve.
 * @returns {Promise<string | undefined>} The flash message, or undefined if no message is found.
 *
 * @example
 * const message = await getFlash(request, "globalMessage");
 */
export async function getFlash(
  request: Request,
  key: string,
): Promise<string | undefined> {
  const session = await getSession(request.headers.get("Cookie"));
  const message = session.get(key);
  console.log("getFlash: Key & Message:", key, message);
  await commitSession(session);
  return message;
}

export async function logout(request: Request) {
  console.log("logout: enter");
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
