"use client"

import * as React from "react"
import {
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    LineChart as RechartsLineChart,
    Line
} from "recharts"

import { cn } from "@/lib/utils"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: any[]
    type?: "bar" | "pie" | "radar" | "line"
    xAxisKey?: string
    series?: {
        key: string
        name: string
        color?: string
    }[]
    height?: number
    width?: number
    colors?: string[]
    className?: string
    accessibilityLayer?: boolean
}

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "#22c55e", // Additional green
    "#3b82f6", // Additional blue
    "#f59e0b", // Additional amber
    "#8b5cf6", // Additional purple
]

export function Chart({
    data,
    type = "bar",
    xAxisKey = "name",
    series,
    height = 300,
    width,
    colors = CHART_COLORS,
    className,
    accessibilityLayer = false,
    ...props
}: ChartProps) {
    if (!data?.length) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-md border border-dashed p-8 text-sm",
                    className
                )}
                {...props}
            >
                No data to display
            </div>
        )
    }

    const renderChart = () => {
        switch (type) {
            case "bar":
                return (
                    <RechartsBarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "var(--border)" }}
                            axisLine={{ stroke: "var(--border)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "var(--border)" }}
                            axisLine={{ stroke: "var(--border)" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--background)",
                                borderColor: "var(--border)",
                                borderRadius: "var(--radius)",
                                fontSize: "12px"
                            }}
                        />
                        {series?.map(({ key, name, color }, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={name}
                                fill={color || colors[index % colors.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </RechartsBarChart>
                )
            case "pie":
                return (
                    <RechartsPieChart>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--background)",
                                borderColor: "var(--border)",
                                borderRadius: "var(--radius)",
                                fontSize: "12px"
                            }}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey={series?.[0].key || "value"}
                            nameKey={xAxisKey}
                            label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                />
                            ))}
                        </Pie>
                        <Legend />
                    </RechartsPieChart>
                )
            case "radar":
                return (
                    <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%">
                        <PolarGrid strokeDasharray="3 3" opacity={0.2} />
                        <PolarAngleAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                        {series?.map(({ key, name, color }, index) => (
                            <Radar
                                key={key}
                                name={name}
                                dataKey={key}
                                stroke={color || colors[index % colors.length]}
                                fill={color || colors[index % colors.length]}
                                fillOpacity={0.5}
                            />
                        ))}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--background)",
                                borderColor: "var(--border)",
                                borderRadius: "var(--radius)",
                                fontSize: "12px"
                            }}
                        />
                        <Legend />
                    </RechartsRadarChart>
                )
            case "line":
                return (
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "var(--border)" }}
                            axisLine={{ stroke: "var(--border)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "var(--border)" }}
                            axisLine={{ stroke: "var(--border)" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--background)",
                                borderColor: "var(--border)",
                                borderRadius: "var(--radius)",
                                fontSize: "12px"
                            }}
                        />
                        {series?.map(({ key, name, color }, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={color || colors[index % colors.length]}
                                name={name}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                        <Legend />
                    </RechartsLineChart>
                )
            default:
                return <div>Unsupported chart type</div>
        }
    }

    // Accessibility layer for screen readers and keyboard navigation
    const renderAccessibleTable = () => {
        if (!accessibilityLayer) return null

        return (
            <div className="sr-only">
                <table>
                    <caption>Chart data visualization</caption>
                    <thead>
                        <tr>
                            <th scope="col">{xAxisKey}</th>
                            {series?.map(s => (
                                <th key={s.key} scope="col">{s.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i}>
                                <th scope="row">{item[xAxisKey]}</th>
                                {series?.map(s => (
                                    <td key={s.key}>{item[s.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div
            className={cn("w-full", className)}
            {...props}
        >
            <ResponsiveContainer width={width || "100%"} height={height}>
                {renderChart()}
            </ResponsiveContainer>
            {renderAccessibleTable()}
        </div>
    )
}