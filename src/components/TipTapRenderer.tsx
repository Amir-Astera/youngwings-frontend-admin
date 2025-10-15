import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEffect } from "react";

interface TipTapRendererProps {
  content: string;
}

export function TipTapRenderer({ content }: TipTapRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-600 hover:underline",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: "",
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none tiptap-content",
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      try {
        const parsedContent = typeof content === "string" ? JSON.parse(content) : content;
        editor.commands.setContent(parsedContent);
      } catch (error) {
        console.error("Failed to parse content:", error);
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-renderer">
      <EditorContent editor={editor} />
    </div>
  );
}
