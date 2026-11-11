"use client";

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LuEye, LuUsers } from "react-icons/lu";
import { getBlogStatsAction, BlogStats } from "../actions";

interface BlogAnalyticsProps {
  slug: string;
}

const EMPTY: BlogStats = {
  totalViews: 0,
  uniqueVisitors: 0,
  countries: [],
  daily: [],
};

const ACCENT = "var(--accent, #70ffc3)";
const GRID = "rgba(255,255,255,0.06)";
const AXIS = "rgba(255,255,255,0.35)";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryLabel(label: string) {
  // Labels are stored as "CODE flag" — split and map code -> full name.
  const [code, flag] = label.trim().split(/\s+/);
  if (code && flag) {
    try {
      return {
        label: `${code} ${flag}`,
        name: regionNames.of(code),
        flag: flag,
      };
    } catch {
      return { label };
    }
  }
  return { label };
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const { fullDate, flag, name, label } = data;
  const value = payload[0].value;
  const date = fullDate
    ? new Date(fullDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : undefined;

  const hasFlagAndName = flag && name;
  const headerText = date || (hasFlagAndName ? `${flag} ${name}` : label || "");

  return (
    <div className="rounded-xl border border-white/5 bg-muted px-3 py-2 text-[13px] shadow-xl">
      <p className="mb-0.5 font-semibold text-neutral-400">{headerText}</p>
      <p className="font-medium text-foreground">
        {value.toLocaleString()} views
      </p>
    </div>
  );
}

export const BlogAnalytics: React.FC<BlogAnalyticsProps> = ({ slug }) => {
  const [stats, setStats] = useState<BlogStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getBlogStatsAction(slug)
      .then((s) => {
        if (alive) setStats(s);
      })
      .catch(() => {
        if (alive) setStats(EMPTY);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const countryData = stats.countries.slice(0, 8).map((c) => {
    const l = countryLabel(c.country);
    return { label: l.label, views: c.views, name: l.name, flag: l.flag };
  });

  return (
    <div className="border-t border-white/6 pt-5 mt-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500 mb-4">
        Analytics
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="sm" color="current" className="text-accent" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/3 bg-white/3 p-3.5">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <LuEye className="size-3.5" /> Total views
              </p>
              <p className="mt-1 text-xl font-bold text-white font-rethink">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-white/3 bg-white/3 p-3.5">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <LuUsers className="size-3.5" /> Unique visitors
              </p>
              <p className="mt-1 text-xl font-bold text-white font-rethink">
                {stats.uniqueVisitors.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Daily views */}
          {stats.daily.length > 0 && (
            <div>
              <p className="text-[11px] text-neutral-500 mb-2.5">
                Views — last 14 days
              </p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.daily.map((d) => ({
                      date: d.date.slice(5),
                      fullDate: d.date,
                      views: d.views,
                    }))}
                    margin={{ top: 6, right: 4, bottom: 0, left: -18 }}
                  >
                    <defs>
                      <linearGradient
                        id="blogViewsFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={ACCENT}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor={ACCENT}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: AXIS, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: AXIS, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ stroke: GRID }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={ACCENT}
                      strokeWidth={2}
                      fill="url(#blogViewsFill)"
                      dot={false}
                      activeDot={{ r: 3.5, fill: ACCENT }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top countries */}
          {countryData.length > 0 && (
            <div>
              <p className="text-[11px] text-neutral-500 mb-2.5">
                Where views come from
              </p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={countryData}
                    layout="vertical"
                    margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: AXIS, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={70}
                      tick={{ fill: AXIS, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="views" radius={[0, 6, 6, 0]} barSize={14}>
                      {countryData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={ACCENT}
                          fillOpacity={0.85 - i * 0.07}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {stats.totalViews === 0 && (
            <p className="text-center text-sm text-neutral-500 py-6">
              No views recorded yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogAnalytics;
