import { AgentManifest, AgentExecutionPlan, RunnableLambdaSnapshot, ToolArtifactSnapshot } from "@Damba/core/AgentDefType";
import { RunnableLambda, ToolArtifact } from "@Database/entities/agents/contracts/ToolArtifactAndRunnableLambda";


export async function buildAgentExecutionPlan(
  api: any,
  manifest: AgentManifest
): Promise<AgentExecutionPlan> {
  const repo = api.DRepository();

  const runnableLambdas: RunnableLambdaSnapshot[] = [];
  const tools: ToolArtifactSnapshot[] = [];

  // -----------------------------
  // Resolve runnable lambdas
  // -----------------------------
  for (const lambdaRef of manifest.runnableLambdas ?? []) {
    const lambda = await repo.DGet1(RunnableLambda, {
      where: { id: lambdaRef.runnableLambdaId },
    });

    if (!lambda) {
      throw new Error(`RunnableLambda not found: ${lambdaRef.runnableLambdaId}`);
    }

    runnableLambdas.push({
      id: lambdaRef.id,
      runnableLambdaId: lambda.id,
      name: lambda.name,
      version: lambda.version,
      kind: lambda.kind,
      runtime: lambda.runtime,
      code: lambda.code,
      timeoutMs: lambda.timeoutMs ?? 1000,
      inputSchema: lambda.inputSchema ?? null,
      outputSchema: lambda.outputSchema ?? null,
      permissionsRequested: lambda.permissionsRequested ?? [],
      contentHash: lambda.contentHash,
    });
  }

  // -----------------------------
  // Resolve custom tools
  // -----------------------------
  for (const tool of manifest.tools ?? []) {
    if (tool.enabled === false) continue;
    if (tool.type !== "custom_plugin") continue;

    const toolArtifactId = tool.config?.toolArtifactId;

    if (!toolArtifactId || typeof toolArtifactId !== "string") {
      throw new Error(
        `Tool "${tool.name}" of type custom_plugin requires config.toolArtifactId`
      );
    }

    const artifact = await repo.DGet1(ToolArtifact, {
      where: { id: toolArtifactId },
    });

    if (!artifact) {
      throw new Error(`ToolArtifact not found: ${toolArtifactId}`);
    }

    tools.push({
      name: tool.name,
      toolArtifactId: artifact.id,
      version: artifact.version,
      runtime: artifact.runtime,
      sourceType: artifact.sourceType,
      code: artifact.code ?? null,
      artifactRef: artifact.artifactRef ?? null,
      inputSchema: artifact.inputSchema ?? null,
      outputSchema: artifact.outputSchema ?? null,
      permissionsRequested: artifact.permissionsRequested ?? [],
      limits: artifact.limits ?? null,
      env: artifact.env ?? null,
      contentHash: artifact.contentHash,
    });
  }

  return {
    manifest,
    runnableLambdas,
    tools,
  };
}