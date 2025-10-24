import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontFamily: {
      /** Apply font family mark to the current selection. */
      setFontFamily: (fontFamily: string) => ReturnType;
      /** Remove font family mark from the current selection. */
      unsetFontFamily: () => ReturnType;
    };
  }
}

export const FontFamily = Mark.create({
  name: "fontFamily",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fontFamily: {
        default: null as string | null,
        parseHTML: (element: HTMLElement) => {
          const font = element.style.fontFamily || element.getAttribute("data-font-family");
          return font?.trim() || null;
        },
        renderHTML: (attributes: { fontFamily?: string | null }) => {
          if (!attributes.fontFamily) {
            return {};
          }

          return {
            style: `font-family: ${attributes.fontFamily}`,
            "data-font-family": attributes.fontFamily,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          const font = (element as HTMLElement).style.fontFamily;
          if (!font) {
            const dataFont = (element as HTMLElement).getAttribute("data-font-family");
            return dataFont ? { fontFamily: dataFont } : false;
          }

          return { fontFamily: font };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ commands }) =>
          commands.setMark(this.name, { fontFamily }),
      unsetFontFamily: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },
});

export default FontFamily;
