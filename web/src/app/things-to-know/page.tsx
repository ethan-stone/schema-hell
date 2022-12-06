import { readFileSync } from "fs";
import { join } from "path";
import { markdownToHtml } from "../../utils/markdown-to-html";

export default async function Page() {
  const markdown = readFileSync(
    join(process.cwd(), "src/markdown/things-to-know/page.md")
  ).toString();

  const html = await markdownToHtml(markdown);

  return (
    <div className="flex min-h-screen justify-center py-10 dark:bg-neutral-900">
      <article className="prose prose-neutral w-1/2 max-w-none dark:prose-invert">
        {html}
      </article>
    </div>
  );
}
