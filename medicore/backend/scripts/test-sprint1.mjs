import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'dotenv'

const cwd = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const prismaCli = resolve(require.resolve('prisma/package.json'), '../build/index.js')
const testConfig = parse(readFileSync(resolve(cwd, '.env.example')))
const project = `medicore-sprint1-${randomUUID().slice(0, 8)}`
const env = {
  ...process.env,
  POSTGRES_USER: testConfig.POSTGRES_USER,
  POSTGRES_PASSWORD: testConfig.POSTGRES_PASSWORD,
  POSTGRES_DB: testConfig.POSTGRES_DB,
  POSTGRES_PORT: '0',
  MEDICORE_TEST_COMPOSE_PROJECT: project,
}
const composeArgs = ['compose', '--project-name', project, '--env-file', '.env.example']

try {
  execFileSync('docker', [...composeArgs, 'up', '-d', '--wait'], { cwd, env, stdio: 'inherit' })
  const address = execFileSync('docker', [...composeArgs, 'port', 'postgres', '5432'], {
    cwd, env, encoding: 'utf8',
  }).trim()
  if (!/^127\.0\.0\.1:[1-9]\d+$/.test(address)) throw new Error('No se obtuvo el puerto local de PostgreSQL para la prueba.')

  const database = new URL(testConfig.DATABASE_URL)
  database.host = address
  env.DATABASE_URL = database.href
  const run = (...args) => execFileSync(process.execPath, args, { cwd, env, stdio: 'inherit' })

  run(prismaCli, 'generate')
  run(prismaCli, 'migrate', 'deploy')
  run(prismaCli, 'db', 'seed')
  run('--import', 'tsx', '--test', 'test/Sprint1FlowTest.ts')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  try {
    execFileSync('docker', [...composeArgs, 'down', '--volumes'], { cwd, env, stdio: 'inherit' })
  } catch (error) {
    console.error(`No se pudo retirar el proyecto temporal ${project}: ${error.message}`)
    process.exitCode = 1
  }
}
