import {
	Sidebar,
	SidebarBody,
	SidebarItem,
	SidebarSection,
} from "~/components/sidebar";

export function SideBar() {
	return (
		<Sidebar>
			<SidebarBody>
				<SidebarSection>
					<SidebarItem href="/">Home</SidebarItem>
					<SidebarItem href="/devices">Devices</SidebarItem>
					<SidebarItem href="/wires">Wires</SidebarItem>
					<SidebarItem href="/settings">Settings</SidebarItem>
				</SidebarSection>
			</SidebarBody>
		</Sidebar>
	);
}
