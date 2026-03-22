/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Controller, useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, Button, Input, Select } from "@/components/ui"
import {
  RunnableLambdaFormSchema,
  RunnableLambdaFormValues,
} from "@/validators/runnableLambdaSchema"
import ToolArtifactCodeEditor from "../../FormUtil/ToolArtifactCodeEditor"
import ToolArtifactJsonSchemaEditor from "../../FormUtil/ToolArtifactJsonSchemaEditor"
import JsonSchemaBuilder from "../../FormUtil/JsonSchemaBuilder"

const runtimeOptions = ["node_vm"].map((v) => ({ value: v, label: v }))

const kindOptions = [
  "inline_transform",
  "inline_predicate",
  "inline_mapper",
  "inline_reducer",
].map((v) => ({ value: v, label: v }))

const statusOptions = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "delisted",
].map((v) => ({ value: v, label: v }))

const visibilityOptions = [
  "private",
  "org",
  "public",
  "unlisted",
].map((v) => ({ value: v, label: v }))

type Props = {
  initialValues: RunnableLambdaFormValues
  saving?: boolean
  onSave: (v: RunnableLambdaFormValues) => Promise<void> | void
}

function flattenErrors(errors: FieldErrors, prefix = ""): { path: string; message: string }[] {
  const out: { path: string; message: string }[] = []

  for (const [key, val] of Object.entries(errors ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key
    if (!val) continue

    const maybeMsg = (val as any).message
    if (typeof maybeMsg === "string" && maybeMsg.trim()) {
      out.push({ path, message: maybeMsg })
      continue
    }

    if (typeof val === "object") {
      out.push(...flattenErrors(val as any, path))
    }
  }

  return out
}

export default function RunnableLambdaForm({ initialValues, saving, onSave }: Props) {
  const form = useForm<RunnableLambdaFormValues>({
    resolver: zodResolver(RunnableLambdaFormSchema),
    defaultValues: initialValues,
    mode: "onChange",
  })

  const { control, register, handleSubmit, watch, formState } = form

  const permissions = watch("permissionsRequested") ?? []
  const allErrors = flattenErrors(formState.errors)

  // ✅ IMPORTANT: sécuriser pour éviter undefined + crash Monaco
  const inputSchema = watch("inputSchema") ?? ""
  const outputSchema = watch("outputSchema") ?? ""

  const addPermission = (p: string) => {
    const v = p.trim()
    if (!v) return
    if (permissions.includes(v)) return

    form.setValue("permissionsRequested", [...permissions, v], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const removePermission = (p: string) => {
    form.setValue(
      "permissionsRequested",
      permissions.filter((x: string) => x !== p),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const submit = handleSubmit(async (values) => {
    await onSave(values)
  })

  return (
    <form onSubmit={submit} className="space-y-4">

      {/* Meta */}
      <Card className="p-4 rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  options={statusOptions}
                  value={statusOptions.find((o) => o.value === field.value)}
                  onChange={(o: any) => field.onChange(o?.value)}
                />
              )}
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-sm font-medium">Description</label>
            <Input textArea {...register("description")} />
          </div>

          <div>
            <label className="text-sm font-medium">Version</label>
            <Input {...register("version")} />
          </div>

          <div>
            <label className="text-sm font-medium">Runtime</label>
            <Controller
              control={control}
              name="runtime"
              render={({ field }) => (
                <Select
                  options={runtimeOptions}
                  value={runtimeOptions.find((o) => o.value === field.value)}
                  onChange={(o: any) => field.onChange(o?.value)}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Kind</label>
            <Controller
              control={control}
              name="kind"
              render={({ field }) => (
                <Select
                  options={kindOptions}
                  value={kindOptions.find((o) => o.value === field.value)}
                  onChange={(o: any) => field.onChange(o?.value)}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Visibility</label>
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <Select
                  options={visibilityOptions}
                  value={visibilityOptions.find((o) => o.value === field.value)}
                  onChange={(o: any) => field.onChange(o?.value)}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium">timeoutMs</label>
            <Input type="number" {...register("timeoutMs", { valueAsNumber: true })} />
          </div>

        </div>
      </Card>

      {/* Code */}
      <Card className="p-4 rounded-2xl shadow-sm space-y-3">
        <h3 className="font-medium">Implementation</h3>

        <ToolArtifactCodeEditor
          control={control as any}
          form={form as any}
          runtime="node_vm"
        />
      </Card>

      {/* Contract */}
      <Card className="p-4 rounded-2xl shadow-sm space-y-3">
        <h3 className="font-medium">Contract (Schemas)</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
          {/* INPUT */}
          <div className="space-y-3">
            <JsonSchemaBuilder
              label="Input schema builder"
              value={inputSchema}
              onChange={(schema) =>
                form.setValue(
                  "inputSchema",
                  JSON.stringify(schema, null, 2),
                  { shouldDirty: true, shouldValidate: true }
                )
              }
            />

            <ToolArtifactJsonSchemaEditor
              control={control}
              form={form}
              name={"inputSchema"}
              label="inputSchema (JSON)"
              height={260}
              template={`{
                          "type": "object",
                          "properties": {
                            "query": { "type": "string" }
                          },
                          "required": ["query"]
                        }`}
            />
          </div>
          {/* OUTPUT */}
          <div className="space-y-3">
            <JsonSchemaBuilder
              label="Output schema builder"
              value={outputSchema}
              onChange={(schema) =>
                form.setValue(
                  "outputSchema",
                  JSON.stringify(schema, null, 2),
                  { shouldDirty: true, shouldValidate: true }
                )
              }
            />

            <ToolArtifactJsonSchemaEditor
              control={control}
              form={form}
              name={"outputSchema"}
              label="outputSchema (JSON)"
              height={260}
              template={`{
  "type": "object",
  "properties": {
    "result": { "type": "string" }
  },
  "required": ["result"]
}`}
            />
          </div>
        </div>
      </Card>

      {/* Permissions */}
      <Card className="p-4 rounded-2xl shadow-sm space-y-3">
        <h3 className="font-medium">Permissions</h3>

        <div className="flex gap-2">
          <Input id="runnableLambdaPermInput" />
          <Button
            type="button"
            onClick={() => {
              const el = document.getElementById("runnableLambdaPermInput") as HTMLInputElement
              addPermission(el.value)
              el.value = ""
            }}
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {permissions.map((p: string) => (
            <span key={p} className="px-2 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-2">
              {p}
              <button type="button" onClick={() => removePermission(p)}>✕</button>
            </span>
          ))}
        </div>
      </Card>
      {/* Submit */}
      <Card className="p-4 rounded-2xl shadow-sm flex justify-end">
        <Button type="button"  className="mr-4" onClick={() => form.trigger()}>
          Validate
        </Button>
        <Button type="submit" className="mr-4" loading={!!saving}>
          Save
        </Button>
      </Card>

    </form>
  )
}