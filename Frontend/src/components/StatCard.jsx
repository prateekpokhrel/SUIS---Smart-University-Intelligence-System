export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="
      bg-surfaceLight dark:bg-slate-900
      rounded-2xl p-6 shadow-soft
      transition-all
    ">
      <p className="text-sm text-mutedLight dark:text-mutedDark mb-1">
        {title}
      </p>

      <h2 className="text-3xl font-semibold text-primary">
        {value}
      </h2>

      {subtitle && (
        <p className="text-xs text-mutedLight dark:text-mutedDark mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
