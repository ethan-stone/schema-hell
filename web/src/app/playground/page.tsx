import ReactQueryWrapper from "../../components/ReactQueryWrapper";
import Editor from "./editor";

export default function Page() {
  return (
    <div className="h-full max-h-screen">
      <ReactQueryWrapper>
        <Editor />
      </ReactQueryWrapper>
    </div>
  );
}
