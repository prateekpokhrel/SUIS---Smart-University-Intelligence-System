import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { w: "W1", score: 60 },
  { w: "W2", score: 65 },
  { w: "W3", score: 70 },
  { w: "W4", score: 78 },
  { w: "W5", score: 85 },
];

export default function StudentCharts() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow h-72">
      <h3 className="font-semibold mb-4">Performance Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="w" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
