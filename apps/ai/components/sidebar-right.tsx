import * as React from "react"
import { Plus, Search } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { SidebarHistory } from "./sidebar-history"
import { useRouter } from "next/navigation"

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	calendars: [
		{
			name: "My Calendars",
			items: ["Personal", "Work", "Family"],
		},
		{
			name: "Favorites",
			items: ["Holidays", "Birthdays"],
		},
		{
			name: "Other",
			items: ["Travel", "Reminders", "Deadlines"],
		},
	],
}

export function SidebarRight({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const router = useRouter();

	return (
		<Sidebar
			collapsible="none"
			{...props}
		>
			<SidebarHeader>
				<Button onClick={() => router.push("/chat")}>New Chat</Button>
				<div className="flex items-center border-b">
					<Search className="text-muted-foreground size-4" />
					<Input placeholder="Search" className="border-none rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarHistory />
			</SidebarContent>
		</Sidebar>
	)
}
