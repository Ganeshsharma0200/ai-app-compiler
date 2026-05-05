interface JsonViewerProps {
  data: unknown;
}

export function JsonViewer({ data }: JsonViewerProps) {
  return (
    <pre className="max-h-[640px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 shadow-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
