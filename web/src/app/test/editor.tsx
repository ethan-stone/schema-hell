"use client";

import { useState } from "react";
import { CMEditor } from "../../components/editor";

export default function Editor() {
  const [nextDefinition, setNextDefinition] = useState<string>("");
  const [currentDefinition, setCurrentDefinition] = useState<string>("");

  return (
    <div className="flex flex-row">
      <CMEditor
        className="w-1/2"
        doc={currentDefinition}
        onChange={(update) => {
          setCurrentDefinition(update.state.doc.toJSON().join("\n"));
        }}
      />
      <CMEditor
        className="w-1/2"
        doc={nextDefinition}
        onChange={(update) => {
          setNextDefinition(update.state.doc.toJSON().join("\n"));
        }}
      />
    </div>
  );
}
