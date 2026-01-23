export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const sidebar: NavSection[] = [
  {
    label: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs", icon: "home" },
      { label: "Installation", href: "/docs/guides/installation", icon: "download" },
      { label: "Quick Start", href: "/docs/guides/quickstart", icon: "rocket_launch" },
    ],
  },
  {
    label: "Examples",
    items: [{ label: "Container", href: "/docs/examples/container", icon: "crop_free" }],
  },
];

export const mainNav: NavItem[] = [
  { label: "Guide", href: "/docs" },
  { label: "Components", href: "/docs/guides/quickstart" },
  { label: "Examples", href: "/docs/examples/container" },
];
