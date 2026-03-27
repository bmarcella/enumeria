/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document } from '@langchain/core/documents';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';

// Per-project document store (in-memory, lives for the duration of the worker job)
const projectDocs = new Map<string, Document[]>();

function getDocs(projectId: string): Document[] {
  if (!projectDocs.has(projectId)) projectDocs.set(projectId, []);
  return projectDocs.get(projectId)!;
}

/**
 * Store context documents for a project.
 * Appends to the in-memory store for the current job.
 */
export function storeProjectContext(projectId: string, docs: Document[]): void {
  if (docs.length === 0) return;
  getDocs(projectId).push(...docs);
}

/**
 * Retrieve relevant context from a project using BM25 keyword search.
 */
export async function retrieveProjectContext(
  projectId: string,
  query: string,
  k = 5,
): Promise<Document[]> {
  const docs = getDocs(projectId);
  if (docs.length === 0) return [];
  const retriever = BM25Retriever.fromDocuments(docs, { k });
  return retriever.invoke(query);
}

/**
 * Clear the in-memory store for a project (call after job completes).
 */
export function clearProjectContext(projectId: string): void {
  projectDocs.delete(projectId);
}

// ─── Builders ────────────────────────────────────────────────────────────────

export function makeProjectDoc(project: {
  id?: string;
  name?: string | null;
  description?: string | null;
  initialPrompt?: string | null;
}): Document {
  return new Document({
    pageContent: [
      `Project: ${project.name ?? ''}`,
      `Description: ${project.description ?? ''}`,
      `Initial prompt: ${project.initialPrompt ?? ''}`,
    ].join('\n'),
    metadata: { type: 'project', id: project.id },
  });
}

export function makeApplicationDoc(app: {
  id?: string;
  name?: string | null;
  description?: string | null;
  type_app?: string | null;
  environment?: string | null;
}): Document {
  return new Document({
    pageContent: [
      `Application: ${app.name ?? ''}`,
      `Type: ${app.type_app ?? ''}`,
      `Environment: ${app.environment ?? ''}`,
      `Description: ${app.description ?? ''}`,
    ].join('\n'),
    metadata: { type: 'application', id: app.id },
  });
}

export function makeModuleDoc(mod: {
  id?: string;
  name?: string | null;
  description?: string | null;
}): Document {
  return new Document({
    pageContent: [`Module: ${mod.name ?? ''}`, `Description: ${mod.description ?? ''}`].join('\n'),
    metadata: { type: 'module', id: mod.id },
  });
}

export function makeServiceDoc(
  svc: { id?: string; name?: string | null; description?: string | null },
  modName: string,
): Document {
  return new Document({
    pageContent: [
      `Service: ${svc.name ?? ''}`,
      `Module: ${modName}`,
      `Description: ${svc.description ?? ''}`,
    ].join('\n'),
    metadata: { type: 'service', id: svc.id },
  });
}

export function makeEntityDoc(
  entity: { id?: string; entityName?: string | null; description?: string | null },
  svcName: string,
): Document {
  return new Document({
    pageContent: [
      `Entity: ${entity.entityName ?? ''}`,
      `Service: ${svcName}`,
      `Description: ${entity.description ?? ''}`,
    ].join('\n'),
    metadata: { type: 'entity', id: entity.id },
  });
}

export function makeValidatorDoc(val: {
  id?: string;
  name?: string | null;
  description?: string | null;
  schema?: any;
}): Document {
  return new Document({
    pageContent: [
      `Validator: ${val.name ?? ''}`,
      `Description: ${val.description ?? ''}`,
      `Schema: ${JSON.stringify(val.schema ?? {})}`,
    ].join('\n'),
    metadata: { type: 'validator', id: val.id },
  });
}

export function makeMiddlewareDoc(mw: {
  id?: string;
  name?: string | null;
  description?: string | null;
}): Document {
  return new Document({
    pageContent: [`Middleware: ${mw.name ?? ''}`, `Description: ${mw.description ?? ''}`].join('\n'),
    metadata: { type: 'middleware', id: mw.id },
  });
}

export function makeBehaviorDoc(
  beh: {
    id?: string;
    name?: string | null;
    description?: string | null;
    method?: string | null;
    path?: string | null;
  },
  svcName: string,
  modName: string,
): Document {
  return new Document({
    pageContent: [
      `Behavior: ${beh.name ?? ''}`,
      `Route: ${beh.method ?? ''} ${beh.path ?? ''}`,
      `Service: ${svcName}`,
      `Module: ${modName}`,
      `Description: ${beh.description ?? ''}`,
    ].join('\n'),
    metadata: { type: 'behavior', id: beh.id },
  });
}

export function makeExtraDoc(
  extra: { id?: string; name?: string | null; description?: string | null },
  svcName: string,
): Document {
  return new Document({
    pageContent: [
      `Extra: ${extra.name ?? ''}`,
      `Service: ${svcName}`,
      `Description: ${extra.description ?? ''}`,
    ].join('\n'),
    metadata: { type: 'extra', id: extra.id },
  });
}

export function makeCodeFileDoc(file: {
  id?: string;
  name?: string | null;
  path?: string | null;
  stereotype?: string | null;
  data?: any;
}): Document {
  const content = file.data?.content ?? '';
  return new Document({
    pageContent: [
      `File: ${file.path ?? ''}/${file.name ?? ''}`,
      `Stereotype: ${file.stereotype ?? ''}`,
      content ? `Content:\n${content}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    metadata: { type: 'codefile', id: file.id, stereotype: file.stereotype },
  });
}
