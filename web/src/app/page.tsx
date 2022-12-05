import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 font-mono text-white">
      <div className="text-9xl">SCHEMA HELL</div>
      <div className="text-3xl">
        Schema evolution and compatibility is hard. This helps to make it easier
      </div>
      <div className="flex flex-row gap-6">
        <Link href="/compatibility-checker">/compatibility-checker</Link>
        <Link href="/things-to-know">/things-to-know</Link>
      </div>
    </div>
  );
}
