type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // Inject the <script> as a raw HTML string instead of a React <script>
  // element. React 19 treats rendered <script> tags as hoistable resources and
  // streams inline JSON-LD via the Flight payload (added to the DOM only after
  // client hydration), so it never appears in the static SSR HTML. Wrapping it
  // in dangerouslySetInnerHTML keeps the structured data in the server-rendered
  // HTML where every crawler — including those that don't execute JS — sees it.
  return (
    <div
      style={{ display: 'none' }}
      dangerouslySetInnerHTML={{
        __html: `<script type="application/ld+json">${json}</script>`,
      }}
    />
  );
}
