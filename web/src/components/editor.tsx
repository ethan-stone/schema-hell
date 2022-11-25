import { useCodeMirror } from "./use-code-mirror";
import { useCallback, useEffect } from "react";
import type { ViewUpdate } from "@codemirror/view";

type Props = {
  className?: string;
  doc: string;
  onChange: (update: ViewUpdate) => void;
};

export const CMEditor: React.FC<Props> = (props) => {
  const onChange = useCallback(
    (update: ViewUpdate) => props.onChange(update),
    [props]
  );
  const [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: props.doc,
    onChange: onChange,
  });

  useEffect(() => {
    if (editorView) {
      // do nothing for now
    }
  }, [editorView]);

  return (
    <div
      className={`flex min-w-full flex-grow rounded bg-neutral-900 p-2 ${props.className}`}
      ref={refContainer}
    />
  );
};
