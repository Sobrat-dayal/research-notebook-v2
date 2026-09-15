import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Summary } from "./types";
export default function Charts({ metrics }: { metrics: Summary["metrics"] }) {
  const [unit, setUnit] = useState(metrics[0]?.unit || "");
  const [table, setTable] = useState(false);
  const activeUnit = metrics.some((m) => m.unit === unit) ? unit : metrics[0]?.unit || "";
  const data = metrics.filter((m) => m.unit === activeUnit);
  if (!metrics.length) return null;
  return (
    <section className="finding-section">
      <div className="section-title">
        <h2>Explore reported data</h2>
        <button className="text-btn" onClick={() => setTable(!table)}>
          {table ? "Show chart" : "Show data table"}
        </button>
      </div>
      <label className="small">
        Unit{" "}
        <select value={activeUnit} onChange={(e) => setUnit(e.target.value)}>
          {Array.from(new Set(metrics.map((m) => m.unit))).map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </label>
      <p className="small muted">
        Only values with matching source excerpts appear. Sharing a unit does
        not make separate experiments directly comparable.
      </p>
      {table ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Observation</th>
                <th>Value</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={i}>
                  <td>{m.label}</td>
                  <td>
                    {m.value} {m.unit}
                  </td>
                  <td>{m.quote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height: 280, width: "100%" }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 65 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                interval={0}
                angle={-20}
                textAnchor="end"
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                }}
              />
              <Bar dataKey="value" fill="#8b7add" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
