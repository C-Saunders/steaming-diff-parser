import assert from 'node:assert'
import * as readline from 'node:readline'

// type definitions adapted from https://github.com/ecomfe/gitdiff-parser
export interface Change {
  content: string
  type: 'insert' | 'delete' | 'normal'
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
}

export interface Hunk {
  content: string
  oldStart: number
  newStart: number
  oldLines: number
  newLines: number
  changes: Change[]
}

export interface FileDiff {
  hunks: Hunk[]
  oldFileMode?: string
  newFileMode?: string
  similarity?: number
  oldRevision?: string
  newRevision?: string
  oldPath: string
  newPath: string
  isBinary?: boolean
  type: 'add' | 'delete' | 'modify' | 'rename' | 'copy'

  // TODO: clarify
  oldEndingNewLine: boolean
  newEndingNewLine: boolean
}

export async function* run(
  input: readline.Interface
): AsyncGenerator<Partial<FileDiff> | undefined, void> {
  let currentFileDiff: Partial<FileDiff> | undefined

  for await (const line of input) {
    // start of new FileDiff, so yield if we have anything and reset
    if (line.startsWith('diff --git')) {
      if (currentFileDiff !== undefined) {
        // TODO: assert required fields
        yield currentFileDiff
      }
      currentFileDiff = {}
    }
    assert(currentFileDiff)
  }

  yield currentFileDiff
}

async function consume(input: readline.Interface): Promise<void> {
  for await (const output of run(input)) {
    console.log(output)
  }
}

if (require.main === module) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })
  consume(rl)
    .then(() => console.log('---'))
    .catch(e => console.error(e))
}
