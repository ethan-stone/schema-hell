import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-neutral-900 bg-gradient-to-b text-center font-mono text-white">
      <div className="text-9xl">SCHEMA HELL</div>
      <div className="flex flex-col items-center gap-6 md:w-3/4 lg:w-1/3 lg:flex-row lg:items-stretch">
        <div className="flex w-1/2 flex-grow flex-col items-center justify-between gap-10 rounded border border-neutral-200 p-10 text-center">
          <p>Easily test JSON Schema compatibility</p>
          <Link href="/compatibility-checker">/compatibility-checker</Link>
        </div>
        <div className="flex w-1/2 flex-grow flex-col items-center justify-between gap-10 rounded border border-neutral-200 p-10 text-center">
          <p>
            An article/blog post about things I&apos;ve learned and mistakes
            I&apos;ve made developing schemas to help prevent you from making
            those mistakes too
          </p>
          <Link href="/things-to-know">/things-to-know</Link>
        </div>
      </div>
    </div>
  );
}
