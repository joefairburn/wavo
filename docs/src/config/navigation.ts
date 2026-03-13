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
    label: "Components",
    items: [
      { label: "Container", href: "/docs/components/container", icon: "crop_free" },
      { label: "Bars", href: "/docs/components/bars", icon: "bar_chart" },
      { label: "Path", href: "/docs/components/path", icon: "show_chart" },
      { label: "Progress", href: "/docs/components/progress", icon: "linear_scale" },
    ],
  },
  {
    label: "Hooks",
    items: [{ label: "useAudioProgress", href: "/docs/hooks/use-audio-progress", icon: "speed" }],
  },
  {
    label: "Advanced",
    items: [
      { label: "Styling", href: "/docs/advanced/styling", icon: "brush" },
      { label: "CSS Variables", href: "/docs/advanced/css-variables", icon: "tune" },
      { label: "Performance", href: "/docs/advanced/performance", icon: "bolt" },
      { label: "Imperative API", href: "/docs/advanced/imperative-api", icon: "api" },
      { label: "Custom Audio", href: "/docs/advanced/custom-audio-sources", icon: "mic" },
    ],
  },
  {
    label: "API Reference",
    items: [
      { label: "Types", href: "/docs/api/types", icon: "data_object" },
      { label: "Utilities", href: "/docs/api/utilities", icon: "build" },
    ],
  },
  {
    label: "Examples",
    items: [
      { label: "Audio Player", href: "/docs/examples/audio-player", icon: "play_circle" },
      { label: "Voice Message", href: "/docs/examples/voice-message", icon: "record_voice_over" },
      { label: "Real-time", href: "/docs/examples/realtime", icon: "graphic_eq" },
      { label: "Accessibility", href: "/docs/examples/accessibility", icon: "accessibility" },
    ],
  },
];

export const mainNav: NavItem[] = [
  { label: "Guide", href: "/docs" },
  { label: "Components", href: "/docs/components/container" },
  { label: "Examples", href: "/docs/examples/audio-player" },
];
