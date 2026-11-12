"use client";

import React from "react";
import { Card, Link, Table } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LuChartBar, LuTable as TableIcon, LuExternalLink } from "react-icons/lu";
import { cn } from "@heroui/react";

export interface AnalyticsItem {
  slug: string;
  url: string;
  title: string;
  views: number;
  readingTime?: string;
  tags?: string[];
  tools?: string[];
  category?: string;
  createdAt?: string;
}

export interface ContentAnalyticsSectionProps {
  title: string;
  description: string;
  badgeLabel: string;
  color: string;
  icon: React.ReactNode;
  data: AnalyticsItem[];
  type: "blog" | "project";
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  totalViews: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  totalViews,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as AnalyticsItem & { shortTitle: string };
    const percentage =
      totalViews > 0 ? ((item.views / totalViews) * 100).toFixed(1) : "0";

    return (
      <div className="bg-neutral-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl text-left min-w-50">
        <p className="text-xs font-semibold text-white tracking-tight line-clamp-2">
          {item.title}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-400">Total Views:</span>
          <span className="font-bold text-white font-rethink">
            {item.views.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-400">Share of Total:</span>
          <span className="font-medium text-accent">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ContentAnalyticsSection: React.FC<
  ContentAnalyticsSectionProps
> = ({ title, description, badgeLabel, color, icon, data, type }) => {
  const [mounted, setMounted] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<"chart" | "table">(
    "chart",
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalViews = React.useMemo(
    () => data.reduce((acc, curr) => acc + (curr.views || 0), 0),
    [data],
  );

  const displayData = React.useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      rank: i + 1,
      shortTitle: d.title.length > 22 ? d.title.slice(0, 20) + "…" : d.title,
    }));
  }, [data]);

  return (
    <Card className="bg-muted/30 border border-white/8 rounded-2xl overflow-hidden shadow-md p-0! gap-0!">
      {/* Header: Title + Description on Left, Total + Mode Toggle on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/6">
        {/* Left Info */}
        <div className="flex items-start gap-3.5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-rethink">
              {title}
            </h3>
            <p className="text-xs text-neutral-400 font-inter mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Right Controls: Views Stat + Clean Segmented Switcher */}
        <div className="flex items-center gap-4 sm:gap-6 not-sm:justify-between not-sm:w-full self-start sm:self-center">
          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
              Total Views
            </span>
            <span className="text-2xl font-bold text-white font-rethink tracking-tight">
              {totalViews.toLocaleString()}
            </span>
          </div>

          {/* Segmented Switcher */}
          <div className="flex items-center rounded-xl bg-white/4 p-1 border border-white/6 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedTab("chart")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                selectedTab === "chart"
                  ? "bg-white/1 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              <LuChartBar className="w-3.5 h-3.5 shrink-0" />
              <span className="not-sm:hidden">Graph View</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                selectedTab === "table"
                  ? "bg-white/1 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              <TableIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="not-sm:hidden">Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        {selectedTab === "chart" ? (
          displayData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-neutral-400 text-sm">
              No data available yet.
            </div>
          ) : !mounted ? (
            <div className="h-67.5 w-full rounded-xl bg-white/2 animate-pulse flex items-center justify-center">
              <span className="text-xs text-neutral-500">Loading chart...</span>
            </div>
          ) : (
            <div className="w-full h-67.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id={`gradient-${type}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0.35}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortTitle"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip totalViews={totalViews} />}
                    cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                  />
                  <Bar
                    dataKey="views"
                    fill={`url(#gradient-${type})`}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={52}
                    background={{
                      fill: "rgba(255, 255, 255, 0.025)",
                      radius: 6,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        ) : (
          /* Table View */
          <div className="rounded-xl border border-white/6 overflow-hidden bg-white/1">
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label={`${title} Table`}
                  className="min-w-162.5 w-full text-left"
                >
                  <Table.Header className="bg-white/3 text-neutral-400 text-xs border-b border-white/6">
                    <Table.Column className="py-3 px-4 w-14 font-medium">
                      #
                    </Table.Column>
                    <Table.Column isRowHeader className="py-3 px-4 font-medium">
                      Title
                    </Table.Column>
                    <Table.Column className="py-3 px-4 font-medium w-40">
                      {type === "blog" ? "Reading Time" : "Category / Tools"}
                    </Table.Column>
                    <Table.Column className="py-3 px-4 font-medium w-24 text-right">
                      Action
                    </Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {displayData.map((item) => (
                      <Table.Row
                        key={item.slug}
                        id={item.slug}
                        className="border-b border-white/4 hover:bg-white/2 transition-colors"
                      >
                        {/* Rank */}
                        <Table.Cell className="py-3 px-4 text-xs">
                          {item.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold">
                              1
                            </span>
                          ) : item.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">
                              2
                            </span>
                          ) : item.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/15 text-sky-400 text-xs font-bold">
                              3
                            </span>
                          ) : (
                            <span className="text-neutral-500 pl-1.5 font-mono">
                              {item.rank}
                            </span>
                          )}
                        </Table.Cell>

                        {/* Title */}
                        <Table.Cell className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white line-clamp-1 hover:text-accent transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-neutral-500 font-mono truncate max-w-70">
                              /{type === "blog" ? "blogs" : "projects"}/
                              {item.slug}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Views */}
                        <Table.Cell className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-white font-rethink">
                            {item.views.toLocaleString()}
                          </span>
                        </Table.Cell>

                        {/* Action */}
                        <Table.Cell className="py-3 px-4 text-right">
                          <Link
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-accent transition-colors p-1"
                          >
                            <span>View</span>
                            <LuExternalLink className="w-3 h-3" />
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContentAnalyticsSection;
