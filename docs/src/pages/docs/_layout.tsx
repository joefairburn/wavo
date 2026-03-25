import { DocsLayoutClient } from "../../components/docs-layout";
import { source } from "../../lib/source";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayoutClient tree={source.getPageTree()}>{children}</DocsLayoutClient>;
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
