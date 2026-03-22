const toPosix = (p: string) => p.replaceAll('\\', '/')

const stripLeadingSlash = (p: string) => p.replace(/^\/+/, '')

export type ServerFile = {
  name: string
  extension: string
  content: string
  fullPath: string
  basePath: string
}


export function fileLang(path: string) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript'
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript'
    if (path.endsWith('.css')) return 'css'
    if (path.endsWith('.html')) return 'html'
    if (path.endsWith('.json')) return 'json'
    return 'plaintext'
}

export function toRelativePath(fullPath: string, basePath: string) {
  const full = toPosix(fullPath)
  const base = toPosix(basePath)

  // si basePath est un préfixe, on coupe
  if (full.toLowerCase().startsWith(base.toLowerCase())) {
    const rel = full.slice(base.length)
    return stripLeadingSlash(rel)
  }

  // fallback: si jamais basePath ne matche pas
  const parts = full.split('/')
  return parts.slice(Math.max(0, parts.length - 2)).join('/')
}

export type FileMap = Record<string, string>

export function serverFilesToFileMap(files: ServerFile[]): FileMap {
  const map: FileMap = {}

  for (const f of files) {
    // tu peux choisir : utiliser fullPath relatif, ou directory+name+ext si tu l’as
    const relPath = toRelativePath(f.fullPath, f.basePath)

    // garantir l’extension (parfois l’API donne "ts" sans le point)
    const ext = f.extension.startsWith('.') ? f.extension : `.${f.extension}`

    // si fullPath contient déjà ".ts" tu n’as rien à ajouter
    const key = relPath.endsWith(ext) ? relPath : `${relPath}${ext}`

    map[key] = f.content ?? ''
  }

  return map
}

export function pickInitial(keys: string[]) {
  return (
    keys.find((k) => /(^|\/)index\.(ts|tsx|js|jsx)$/.test(k)) ||
    keys.find((k) => /(^|\/)main\.(ts|tsx|js|jsx)$/.test(k)) ||
    keys[0] ||
    ''
  )
}

export function baseName(p: string) {
  const parts = p.split('/')
  return parts[parts.length - 1] ?? p
}