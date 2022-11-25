import ReactQueryWrapper from "../../components/ReactQueryWrapper";
import Editor from "./editor";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-neutral-300">
      <ReactQueryWrapper>
        <Editor />
      </ReactQueryWrapper>
    </div>
  );
}
