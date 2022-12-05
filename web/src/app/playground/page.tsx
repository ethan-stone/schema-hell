import ReactQueryWrapper from "../../components/react-query-wrapper";
import Editor from "./editor";

export default function Page() {
  return (
    <div className="h-full max-h-screen bg-neutral-900">
      <ReactQueryWrapper>
        <Editor />
      </ReactQueryWrapper>
    </div>
  );
}
