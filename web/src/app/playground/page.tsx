import ReactQueryWrapper from "../../components/ReactQueryWrapper";
import Editor from "./editor";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-300">
      <ReactQueryWrapper>
        <Editor />
      </ReactQueryWrapper>
    </div>
  );
}
