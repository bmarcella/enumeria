/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Button, Card, Input, Select } from "@/components/ui"

type PropertyType = "string" | "number" | "integer" | "boolean"

type SchemaProperty = {
  id: string
  name: string
  type: PropertyType
  required: boolean
}

type Props = {
  label?: string
  value?: string | Record<string, any>
  onChange: (schema: Record<string, any>) => void
}

const typeOptions = ["string", "number", "integer", "boolean"].map((v) => ({
  label: v,
  value: v,
}))

function buildSchema(properties: SchemaProperty[]) {
  const valid = properties.filter((p) => p.name.trim())

  return {
    type: "object",
    properties: Object.fromEntries(
      valid.map((p) => [
        p.name.trim(),
        {
          type: p.type,
        },
      ])
    ),
    required: valid.filter((p) => p.required).map((p) => p.name.trim()),
  }
}

function parseInitialProperties(value?: string | Record<string, any>): SchemaProperty[] {
  if (!value) return []

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value
    const props = parsed?.properties ?? {}
    const requiredList: string[] = parsed?.required ?? []

    return Object.entries(props).map(([name, config]: [string, any], index) => ({
      id: `${name}-${index}`,
      name,
      type: (config?.type ?? "string") as PropertyType,
      required: requiredList.includes(name),
    }))
  } catch {
    return []
  }
}

export default function JsonSchemaBuilder({ label, value, onChange }: Props) {
  const [properties, setProperties] = React.useState<SchemaProperty[]>(() =>
    parseInitialProperties(value)
  )

  const initializedRef = React.useRef(false)

  React.useEffect(() => {
    if (initializedRef.current) return
    setProperties(parseInitialProperties(value))
    initializedRef.current = true
  }, [value])

  const updateAndEmit = (next: SchemaProperty[]) => {
    setProperties(next)
    onChange(buildSchema(next))
  }

  const addProperty = () => {
    const next = [
      ...properties,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: "",
        type: "string" as PropertyType,
        required: false,
      },
    ]
    updateAndEmit(next)
  }

  const updateProperty = (id: string, patch: Partial<SchemaProperty>) => {
    const next = properties.map((p) => (p.id === id ? { ...p, ...patch } : p))
    updateAndEmit(next)
  }

  const removeProperty = (id: string) => {
    const next = properties.filter((p) => p.id !== id)
    updateAndEmit(next)
  }

  const generated = buildSchema(properties)

  return (
    <Card className="p-4 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{label ?? "Schema Builder"}</h3>
        <Button type="button" onClick={addProperty}>
          Add property
        </Button>
      </div>

      {properties.length === 0 && (
        <p className="text-sm text-muted-foreground">No properties added yet.</p>
      )}

    
      <div className="space-y-3">
        {properties.map((prop) => (
          <div
            key={prop.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end rounded-xl border p-3"
          >
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={prop.name}
                onChange={(e) => updateProperty(prop.id, { name: e.target.value })}
                placeholder="ex: query"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                options={typeOptions}
                value={typeOptions.find((o) => o.value === prop.type)}
                onChange={(o: any) =>
                  updateProperty(prop.id, { type: (o?.value ?? "string") as PropertyType })
                }
              />
            </div>

            <div className="flex items-center gap-2 h-10">
              <input
                id={`required-${prop.id}`}
                type="checkbox"
                checked={prop.required}
                onChange={(e) =>
                  updateProperty(prop.id, { required: e.target.checked })
                }
              />
              <label htmlFor={`required-${prop.id}`} className="text-sm font-medium">
                Required
              </label>
            </div>

            <div>
              <Button
                type="button"
                variant="plain"
                onClick={() => removeProperty(prop.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}