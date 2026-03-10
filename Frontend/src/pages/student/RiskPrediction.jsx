import { motion } from "framer-motion";

export default function RiskPrediction({
  riskLevel = "Low",
  confidence = "89%",
}) {
  const explanations = {
    Low: [
      "Consistent CGPA above 8.0",
      "No sudden performance drop",
      "Strong core subject scores",
    ],
    Medium: [
      "Minor score fluctuations",
      "Weakness in 1-2 subjects",
      "Inconsistent assessment trend",
    ],
    High: [
      "CGPA below threshold",
      "Multiple subject failures",
      "Sharp downward performance trend",
    ],
  };

  const colorMap = {
    Low: "text-green-500",
    Medium: "text-yellow-500",
    High: "text-red-500",
  };

  const barMap = {
    Low: "bg-green-500 w-[25%]",
    Medium: "bg-yellow-500 w-[60%]",
    High: "bg-red-500 w-[90%]",
  };

  return (
    <div className="mt-4 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-mutedLight dark:text-mutedDark">
          Academic Risk Level
        </span>
        <span className={`font-semibold ${colorMap[riskLevel]}`}>
          {riskLevel}
        </span>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: barMap[riskLevel].split(" ")[1] }}
          transition={{ duration: 0.8 }}
          className={`h-full ${barMap[riskLevel].split(" ")[0]}`}
        />
      </div>

      {/* CONFIDENCE */}
      <p className="text-xs text-mutedLight dark:text-mutedDark">
        ML confidence: <strong>{confidence}</strong>
      </p>

      {/* EXPLAINABLE AI */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold mb-2">
          AI Explanation
        </h4>

        <ul className="text-sm space-y-1 text-mutedLight dark:text-mutedDark">
          {explanations[riskLevel].map((reason, i) => (
            <li key={i}>• {reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
