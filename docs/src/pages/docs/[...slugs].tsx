import { source } from "../../lib/source";
import type { PageProps } from "waku/router";
import { getMDXComponents } from "../../components/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

export default function DocPage({ slugs }: PageProps<"/docs/[...slugs]">) {
  const page = source.getPage(slugs);

  if (!page) {
    return <div>Page not found</div>;
  }

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function getConfig() {
  const pages = source.generateParams();
  return {
    render: "static" as const,
    staticPaths: pages.map((item) => item.slug),
  } as const;
}
