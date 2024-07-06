import { Form } from "@remix-run/react";

import type { Project } from "~/models/project.server";

import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  MoonIcon,
} from "@heroicons/react/20/solid";
import { Avatar } from "~/components/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "~/components/dropdown";
import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "~/components/navbar";
import { toggleTheme } from "~/utils/theme";

export function NavBar(props: {
  projects: Project[];
  currentProject: Project;
}) {
  const { currentProject, projects } = props;

  return (
    <Navbar>
      <Dropdown>
        <DropdownButton as={NavbarItem}>
          <NavbarLabel>{currentProject.name}</NavbarLabel>
          <ChevronDownIcon />
        </DropdownButton>
        <DropdownMenu className="min-w-64" anchor="bottom start">
          <DropdownItem href="/teams/1/settings">
            <Cog8ToothIcon />
            <DropdownLabel>Settings</DropdownLabel>
          </DropdownItem>
          <DropdownDivider />
          {projects.map((project) => {
            return (
              <Form
                key={project.id}
                method="post"
                action={`/project/switch/${project.id}`}
              >
                <DropdownItem>
                  <DropdownLabel>{project.name}</DropdownLabel>
                </DropdownItem>
              </Form>
            );
          })}
          <DropdownDivider />
          <DropdownItem href="/project/create">
            <PlusIcon />
            <DropdownLabel>New Project&hellip;</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <NavbarDivider className="max-lg:hidden" />
      <NavbarSection className="max-lg:hidden">
        <NavbarItem href="/devices">Devices</NavbarItem>
        <NavbarItem href="/wires">Wires</NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search">
          <MagnifyingGlassIcon />
        </NavbarItem>
        <NavbarItem href="/todo" aria-label="Todo">
          <CheckCircleIcon />
        </NavbarItem>
        <NavbarItem onClick={() => toggleTheme()} aria-label="Light mode">
          <MoonIcon />
        </NavbarItem>
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <Avatar initials="XX" square />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="bottom end">
            <DropdownItem href="/my-profile">
              <UserIcon />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <Cog8ToothIcon />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/privacy-policy">
              <ShieldCheckIcon />
              <DropdownLabel>Privacy policy</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/share-feedback">
              <LightBulbIcon />
              <DropdownLabel>Share feedback</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/logout">
              <ArrowRightStartOnRectangleIcon />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}
