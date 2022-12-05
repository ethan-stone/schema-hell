import rehypeReact from "rehype-react";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { createElement } from "react";
import remarkToc from "remark-toc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

export async function markdownToHtml(markdown: string) {
  const md = await unified()
    .use(remarkParse)
    .use(remarkToc, { tight: true, heading: "Contents" })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeReact, {
      createElement,
    })
    .process(markdown);

  return md.result;
}
