/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Input, Select } from "@/components/ui"

type JsonSchema =
  | string
  | {
      type?: string
      properties?: Record<string, any>
      required?: string[]
    }

type Props = {
  schema: JsonSchema
  title?: string
  value: Record<string, any>
  onChange: (next: Record<string, any>) => void
  readOnly?: boolean
}

function safeParseSchema(schema: JsonSchema) {
  if (!schema) return null

  if (typeof schema === "string") {
    try {
      return JSON.parse(schema)
    } catch {
      return null
    }
  }

  return schema
}

export default function JsonSchemaVisualForm({
  schema,
  title,
  value,
  onChange,
  readOnly = false,
}: Props) {
  const parsed = safeParseSchema(schema)

  if (!parsed) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        Invalid JSON schema.
      </div>
    )
  }

  if (parsed.type !== "object" || !parsed.properties) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        Only object schemas with properties are supported for now.
      </div>
    )
  }

  const required = parsed.required ?? []

  const setField = (key: string, fieldValue: any) => {
    onChange({
      ...value,
      [key]: fieldValue,
    })
  }

  const renderField = (key: string, config: any) => {
    const isRequired = required.includes(key)
    const fieldValue = value?.[key]

    if (config.enum && Array.isArray(config.enum)) {
      return (
        <div key={key} className="space-y-1">
          <label className="text-sm font-medium">
            {key}
            {isRequired ? " *" : ""}
          </label>
          <Select
            options={config.enum.map((v: string) => ({ label: v, value: v }))}
            value={
              fieldValue !== undefined
                ? { label: String(fieldValue), value: fieldValue }
                : null
            }
            onChange={(option: any) => setField(key, option?.value)}
            isDisabled={readOnly}
          />
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
      )
    }

    switch (config.type) {
      case "string":
        return (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium">
              {key}
              {isRequired ? " *" : ""}
            </label>
            <Input
              value={fieldValue ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField(key, e.target.value)}
              placeholder={config.description || key}
              disabled={readOnly}
            />
            {config.description && (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
        )

      case "number":
      case "integer":
        return (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium">
              {key}
              {isRequired ? " *" : ""}
            </label>
            <Input
              type="number"
              value={fieldValue ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setField(
                  key,
                  e.target.value === ""
                    ? undefined
                    : config.type === "integer"
                      ? parseInt(e.target.value, 10)
                      : Number(e.target.value)
                )
              }
              disabled={readOnly}
            />
            {config.description && (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
        )

      case "boolean":
        return (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium">
              {key}
              {isRequired ? " *" : ""}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!fieldValue}
                onChange={(e) => setField(key, e.target.checked)}
                disabled={readOnly}
              />
              {config.description || key}
            </label>
          </div>
        )

      default:
        return (
          <div key={key} className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Field <span className="font-mono">{key}</span> with type{" "}
            <span className="font-mono">{String(config.type ?? "unknown")}</span>{" "}
            is not supported yet.
          </div>
        )
    }
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      {title && <h4 className="font-medium">{title}</h4>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(parsed.properties).map(([key, config]) =>
          renderField(key, config)
        )}
      </div>

      <div className="pt-2">
        <p className="text-xs font-medium text-muted-foreground mb-2">Generated JSON</p>
        <pre className="rounded-lg bg-muted p-3 text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}