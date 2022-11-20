import ReactQueryWrapper from "../../components/ReactQueryWrapper";
import Editor from "./editor";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ReactQueryWrapper>
        <Editor />
      </ReactQueryWrapper>
    </div>
  );
}
