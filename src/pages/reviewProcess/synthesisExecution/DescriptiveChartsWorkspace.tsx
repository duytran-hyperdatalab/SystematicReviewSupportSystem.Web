import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Sigma, Sparkles } from "lucide-react";
import type { SourceDataGroupDto } from "../../../types/synthesisExecution";

type ChartView = "bar" | "pie";

interface ChartCategory {
  name: string;
  count: number;
}

interface DescriptiveChartsWorkspaceProps {
  sourceDataGroups: SourceDataGroupDto[];
}

const PIE_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#6366f1", "#4f46e5", "#0f766e", "#0891b2", "#7c3aed"];

function isChartFriendlyGroup(group: SourceDataGroupDto): boolean {
  if (group.values.length === 0) {
    return false;
  }

  if (group.values.some((value) => value.optionId || value.booleanValue !== null || value.numericValue !== null)) {
    return true;
  }

  const averageLength = group.values.reduce((total, value) => total + value.displayValue.trim().length, 0) / group.values.length;
  return averageLength <= 80;
}

export default function DescriptiveChartsWorkspace({ sourceDataGroups }: DescriptiveChartsWorkspaceProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [chartView, setChartView] = useState<ChartView>("bar");

  const chartableGroups = useMemo(() => {
    const filteredGroups = sourceDataGroups.filter(isChartFriendlyGroup);
    if (filteredGroups.length > 0) {
      return filteredGroups;
    }

    return sourceDataGroups.filter((group) => group.values.length > 0);
  }, [sourceDataGroups]);

  useEffect(() => {
    if (chartableGroups.length === 0) {
      if (selectedFieldId !== "") {
        setSelectedFieldId("");
      }

      return;
    }

    const hasSelectedField = chartableGroups.some((group) => group.fieldId === selectedFieldId);
    if (!hasSelectedField) {
      setSelectedFieldId(chartableGroups[0].fieldId);
    }
  }, [chartableGroups, selectedFieldId]);

  const selectedGroup = useMemo(() => {
    if (chartableGroups.length === 0) {
      return null;
    }

    return chartableGroups.find((group) => group.fieldId === selectedFieldId) ?? chartableGroups[0];
  }, [chartableGroups, selectedFieldId]);

  const chartData = useMemo<ChartCategory[]>(() => {
    if (!selectedGroup) {
      return [];
    }

    const counts = new Map<string, number>();

    for (const value of selectedGroup.values) {
      const key = value.displayValue.trim() || "Unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
  }, [selectedGroup]);

  const topCategory = useMemo(() => {
    if (chartData.length === 0) {
      return null;
    }

    return chartData[0];
  }, [chartData]);

  const totalStudies = useMemo(() => {
    return chartData.reduce((total, category) => total + category.count, 0);
  }, [chartData]);

  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Descriptive Statistics</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Descriptive Charts</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Explore categorical and demographic extracted data using auto-generated charts to understand the study profile before synthesis coding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
              {chartableGroups.length} fields
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
              {totalStudies} studies
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-900" htmlFor="chart-field-select">
                Select Field
              </label>
              <p className="mt-1 text-sm text-gray-500">Choose the extracted field you want to visualize.</p>
              <select
                id="chart-field-select"
                value={selectedFieldId}
                onChange={(event) => setSelectedFieldId(event.target.value)}
                disabled={chartableGroups.length === 0}
                className="mt-3 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                {chartableGroups.length === 0 ? <option value="">No chartable fields available</option> : null}
                {chartableGroups.map((group) => (
                  <option key={group.fieldId} value={group.fieldId}>
                    {group.fieldName} ({group.values.length})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">View Mode</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChartView("bar")}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    chartView === "bar"
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Bar
                </button>
                <button
                  type="button"
                  onClick={() => setChartView("pie")}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    chartView === "pie"
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <PieChartIcon className="h-4 w-4" />
                  Pie
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Top {selectedGroup?.fieldName ?? "field"}</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900">{topCategory ? topCategory.name : "No chart data"}</p>
              <p className="mt-1 text-sm text-gray-600">
                {topCategory
                  ? `${topCategory.count} studies are represented in the leading category for ${selectedGroup?.fieldName ?? "this field"}.`
                  : "Select a field with categorical values to generate a summary."}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Sigma className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Field detail</span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">{selectedGroup?.fieldName ?? "No field selected"}</p>
              <p className="mt-1 text-sm text-gray-600">
                {selectedGroup ? `${selectedGroup.values.length} extracted values available for aggregation.` : "No extracted values were found."}
              </p>
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribution View</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedGroup ? `Aggregated by ${selectedGroup.fieldName}` : "Choose a field to see its distribution."}
              </p>
            </div>

            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
              {chartView === "bar" ? "Bar chart" : "Pie chart"}
            </span>
          </div>

          {hasChartData && selectedGroup ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
              <div className="h-[420px] rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <ResponsiveContainer key={selectedFieldId} width="100%" height="100%">
                  {chartView === "bar" ? (
                    <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" allowDecimals={false} stroke="#94a3b8" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        stroke="#94a3b8"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                        contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Studies" fill="#2563eb" radius={[0, 12, 12, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }} />
                      <Legend />
                      <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={2}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Summary</p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Top {selectedGroup?.fieldName ?? "field"}: <span className="font-semibold text-gray-900">{topCategory?.name}</span> with <span className="font-semibold text-gray-900">{topCategory?.count ?? 0}</span> studies.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Method note</p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Values are grouped by display label so the chart reflects the number of studies contributing each category.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <div className="max-w-md">
                <BarChart3 className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-4 text-sm font-medium text-gray-700">No chart data available for the selected field.</p>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Try another field from the dropdown. Long-form narrative fields are hidden from the chart list when possible.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}