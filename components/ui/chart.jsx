"use client"
import { createContext, useContext } from "react"

const ChartContext = createContext({})

export function ChartContainer({ config, children }) {
  const colors = {}
  const labels = {}

  for (const [key, value] of Object.entries(config)) {
    colors[key] = value.color
    labels[key] = value.label
  }

  const contextValue = {
    colors,
    labels,
  }

  return (
    <ChartContext.Provider value={contextValue}>
      <style jsx global>{`
        :root {
          ${Object.entries(colors).map(([key, value]) => `--color-${key}: ${value};`)}
        }
      `}</style>
      {children}
    </ChartContext.Provider>
  )
}

export function ChartTooltip({ children, ...props }) {
  return (
    <div
      style={{
        background: "white",
        padding: "0.5rem",
        border: "1px solid #ddd",
        borderRadius: "0.25rem",
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function ChartTooltipContent({ active, payload, label }) {
  const { labels } = useContext(ChartContext)

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">日期</span>
          <span className="font-bold text-muted-foreground">{label}</span>
        </div>
        {payload.map((data) => (
          <div key={data.dataKey} className="flex flex-col">
            <span
              className="text-[0.70rem] uppercase"
              style={{
                color: data.color,
              }}
            >
              {labels[data.dataKey]}
            </span>
            <span className="font-bold" style={{ color: data.color }}>
              {data.dataKey === "timeValue" ? data.payload.completionTime : data.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

