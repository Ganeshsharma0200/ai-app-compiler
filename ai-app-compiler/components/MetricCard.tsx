interface MetricCardProps {
  label: string;
  value: string | number;
  caption?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}

const toneClasses = {
  neutral: "border-line bg-white text-ink",
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900"
};

export function MetricCard({ label, value, caption, tone = "neutral" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {caption ? <p className="mt-1 text-sm text-slate-600">{caption}</p> : null}
    </div>
  );
}
