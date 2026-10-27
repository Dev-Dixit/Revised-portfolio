import bodyNodes from "@/content/body.json";
import headStyles from "@/content/head-styles.json";

type Attrs = Record<string, string | boolean>;
type BodyNode =
  | { type: "html"; html: string }
  | { type: "script"; attrs: Attrs; code: string }
  | { type: "link"; attrs: Attrs };

const REACT_ATTR_NAMES: Record<string, string> = {
  class: "className",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
};

function toProps(attrs: Attrs) {
  const props: Record<string, string | boolean> = {};
  for (const [name, value] of Object.entries(attrs)) {
    props[REACT_ATTR_NAMES[name] ?? name] = value;
  }
  return props;
}

export function FramerHeadStyles() {
  return (
    <>
      {(headStyles as { attrs: Attrs; css: string }[]).map((style, i) => (
        <style key={i} {...toProps(style.attrs)} dangerouslySetInnerHTML={{ __html: style.css }} />
      ))}
    </>
  );
}

// Renders the Framer page body in its original order. Inline scripts are emitted as real <script>
// tags so the browser runs them during the initial HTML parse, exactly as on the Framer-hosted site.
export function FramerBody() {
  return (
    <>
      {(bodyNodes as BodyNode[]).map((node, i) => {
        if (node.type === "html") {
          return (
            <div
              key={i}
              style={{ display: "contents" }}
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: node.html }}
            />
          );
        }
        if (node.type === "link") {
          return <link key={i} {...toProps(node.attrs)} />;
        }
        const { async: _async, ...attrs } = node.attrs;
        // Module scripts are deferred by default; dropping `async` keeps the Framer bundle running
        // after the markup above has been parsed (React would otherwise hoist it into <head>).
        if (attrs.src) {
          return <script key={i} {...toProps(attrs)} />;
        }
        return <script key={i} {...toProps(attrs)} dangerouslySetInnerHTML={{ __html: node.code }} />;
      })}
    </>
  );
}
