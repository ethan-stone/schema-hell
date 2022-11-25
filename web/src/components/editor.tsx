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
      className={`flex max-h-screen min-h-screen flex-grow bg-neutral-800 ${props.className}`}
      ref={refContainer}
    />
  );
};
