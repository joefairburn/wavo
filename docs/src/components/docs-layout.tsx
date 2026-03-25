"use client";

import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Root } from "fumadocs-core/page-tree";

export function DocsLayoutClient({ tree, children }: { tree: Root; children: ReactNode }) {
  return (
    <DocsLayout
      tree={tree}
      nav={{ title: "Wavo", url: "/" }}
      githubUrl="https://github.com/spectrachrome/wavo"
    >
      {children}
    </DocsLayout>
  );
}
