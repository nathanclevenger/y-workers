// Browser Entry Point

import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { WebsocketProvider } from "./provider";

import { createRoot } from "react-dom/client";

// @ts-ignore
const root = createRoot(document.getElementById("root"));
root.render(<Editor />);

function Editor() {
  const initialConfig = {
    namespace: "oops",
    onError(error: Error) {
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
      />
      <CollaborationPlugin
        id="yjs-plugin"
        providerFactory={(id, yjsDocMap) => {
          const doc = new Y.Doc();
          yjsDocMap.set(id, doc);

          const provider = new WebsocketProvider(
            "ws://localhost:8787",
            id,
            doc
          );

          return provider;
        }}
        shouldBootstrap={true}
      />
    </LexicalComposer>
  );
}
