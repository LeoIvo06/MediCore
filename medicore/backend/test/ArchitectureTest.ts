import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const source = fileURLToPath(new URL('../src/', import.meta.url))
const consumer = 'incidencias/application/internal/outboundservices/acl/ExternalOperationalReferencesService.ts'
const facade = 'referencias-operativas/interfaces/acl/OperationalReferencesContextFacade.js'

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(join(path, entry.name))
    return entry.name.endsWith('.ts') ? [join(path, entry.name)] : []
  })
}

function sourcePath(path: string) {
  return relative(source, path).split(sep).join('/')
}

test('el dominio y los contextos respetan sus límites de dependencias', () => {
  const violations: string[] = []
  for (const file of sourceFiles(source)) {
    const from = sourcePath(file)
    const [context, layer] = from.split('/')
    const { importedFiles } = ts.preProcessFile(readFileSync(file, 'utf8'), true)
    for (const { fileName } of importedFiles) {
      const to = fileName.startsWith('.') ? sourcePath(resolve(dirname(file), fileName)) : fileName
      const [targetContext, targetLayer] = to.split('/')
      const violation =
        (layer === 'domain' && (targetLayer !== 'domain' ||
          (targetContext !== context && targetContext !== 'shared'))) ||
        (context === 'referencias-operativas' && targetContext === 'incidencias') ||
        (context === 'incidencias' && targetContext === 'referencias-operativas' &&
          (from !== consumer || to !== facade)) ||
        ((fileName.startsWith('@prisma/') || to.includes('/prisma/generated/')) &&
          layer !== 'infrastructure' && from !== 'app.ts')
      if (violation) violations.push(`${from} → ${to}`)
    }
  }
  assert.deepEqual(violations, [])
})
