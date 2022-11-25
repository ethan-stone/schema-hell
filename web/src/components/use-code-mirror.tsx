import { EditorState } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { json, jsonLanguage } from "@codemirror/lang-json";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { defaultKeymap } from "@codemirror/commands";
import { syntaxHighlighting } from "@codemirror/language";
import { oneDarkHighlightStyle } from "./one-dark-highlight";

const cursor = "#ffffff";
const background = "transparent";
const darkBackground = "#171717";
const highlightBackground = "#171717";
const tooltipBackground = "#353a42";
const selection = "#404040";
const ivory = "#abb2bf";
const stone = "#525252";

const theme = EditorView.theme(
  {
    "&": {
      color: ivory,
      backgroundColor: background,
      height: "100%",
      fontWeight: "bold",
      fontSize: "1rem",
      flex: 1,
    },
    ".cm-content": { caretColor: cursor },
    "&.cm-editor.cm-focused": {
      outline: "none",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: selection },
    ".cm-panels": { backgroundColor: darkBackground, color: ivory },
    ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
    ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },
    ".cm-searchMatch": {
      backgroundColor: "#72a1ff59",
      outline: "1px solid #457dff",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#6199ff2f",
    },
    ".cm-activeLine": { backgroundColor: highlightBackground },
    ".cm-selectionMatch": { backgroundColor: "#aafe661a" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#bad0f847",
      outline: "1px solid #515a6b",
    },

    ".cm-gutters": {
      backgroundColor: background,
      color: stone,
      border: "none",
    },

    ".cm-activeLineGutter": {
      backgroundColor: highlightBackground,
    },

    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "#ddd",
    },

    ".cm-tooltip": {
      border: "none",
      backgroundColor: tooltipBackground,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: highlightBackground,
        color: ivory,
      },
    },
  },
  { dark: true }
);

type Props = {
  initialDoc: string;
  onChange?: (update: ViewUpdate) => void;
};

export const useCodeMirror = <T extends Element>(
  props: Props
): [React.MutableRefObject<T | null>, EditorView?] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const { onChange } = props;

  useEffect(() => {
    if (!refContainer.current) return;

    const startState = EditorState.create({
      doc: props.initialDoc,
      extensions: [
        keymap.of(defaultKeymap),
        json(),
        jsonLanguage,
        theme,
        basicSetup,
        syntaxHighlighting(oneDarkHighlightStyle),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.changes) [onChange && onChange(update)];
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: refContainer.current,
    });

    setEditorView(view);

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refContainer]);

  return [refContainer, editorView];
};
