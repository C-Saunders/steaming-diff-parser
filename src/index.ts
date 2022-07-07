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
  content?: string
  oldStart?: number
  newStart?: number
  oldLineCount?: number
  newLineCount?: number
  changes?: Change[]
}

export interface FileDiff {
  hunks: Hunk[]
  oldFileMode?: string
  newFileMode?: string
  similarity?: number
  oldBlobObjectName?: string
  newBlobObjectName?: string
  oldPath: string
  newPath: string
  isBinary?: boolean
  type: 'add' | 'delete' | 'modify' | 'rename' | 'copy'

  // TODO: clarify
  oldEndingNewLine: boolean
  newEndingNewLine: boolean
}

const similarityRegex = /^similarity index (?<percent>\d+)%$/
const dissimilarityRegex = /^dissimilarity index (?<percent>\d+)%$/

const blobNamesRegex =
  /^index (?<before>[a-z0-9]+)\.\.(?<after>[a-z0-9]+)(?: (?<fileMode>\d+))?$/
const filePathUpdatesRegex =
  /^(?<type>copy|rename) (?<direction>from|to) (?<path>.+)$/
const fileModeChangeRegex = /^(?<type>old|new) mode (?<fileMode>\d+)$/

const newFileRegex = /^new file mode (?<fileMode>\d+)$/
const deletedFileRegex = /^deleted file mode (?<fileMode>\d+)$/

const binaryFileRegex =
  /^Binary files (?<oldPath>.+) and (?<newPath>.+) differ$/

function cleanPath(path: string): string {
  return path.replace(/^[ab]\//, '/')
}

const hunkHeaderRegex =
  /^@@\s+-(?<oldStart>[0-9]+)(?:,(?<oldLineCount>[0-9]+))?\s+\+(?<newStart>[0-9]+)(?:,(?<newLineCount>[0-9]+))?\s+@@/

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

      currentFileDiff = { type: 'modify', isBinary: false }
    }
    assert(currentFileDiff)

    if (similarityRegex.test(line)) {
      const matches = similarityRegex.exec(line)
      currentFileDiff.similarity = Number(matches?.groups?.percent)
    }
    if (dissimilarityRegex.test(line)) {
      // I've never seen one of these, but it could happen, according to
      // http://git-scm.com/docs/git-diff#_generating_patch_text_with_p
      // TODO: make a test that hits this path
      const matches = dissimilarityRegex.exec(line)
      currentFileDiff.similarity = 100 - Number(matches?.groups?.percent)
    }

    if (filePathUpdatesRegex.test(line)) {
      const matches = filePathUpdatesRegex.exec(line)
      const { type, direction, path } = matches?.groups ?? {}
      currentFileDiff.type = type as 'rename' | 'copy'
      currentFileDiff[direction === 'from' ? 'oldPath' : 'newPath'] = path
    }

    if (blobNamesRegex.test(line)) {
      const matches = blobNamesRegex.exec(line)
      currentFileDiff.oldBlobObjectName = matches?.groups?.before
      currentFileDiff.newBlobObjectName = matches?.groups?.after

      // if mode is included on this line, it didn't change
      if (matches?.groups?.fileMode) {
        currentFileDiff.oldFileMode = matches.groups.fileMode
        currentFileDiff.newFileMode = matches.groups.fileMode
      }
    }

    if (fileModeChangeRegex.test(line)) {
      const matches = fileModeChangeRegex.exec(line)
      const { type, fileMode } = matches?.groups ?? {}
      currentFileDiff[type === 'old' ? 'oldFileMode' : 'newFileMode'] = fileMode
    }

    if (newFileRegex.test(line)) {
      currentFileDiff.type = 'add'
      const matches = newFileRegex.exec(line)
      currentFileDiff.newFileMode = matches?.groups?.fileMode
    }

    if (deletedFileRegex.test(line)) {
      currentFileDiff.type = 'delete'
      const matches = deletedFileRegex.exec(line)
      currentFileDiff.oldFileMode = matches?.groups?.fileMode
    }

    if (binaryFileRegex.test(line)) {
      currentFileDiff.isBinary = true
      const matches = binaryFileRegex.exec(line)
      const { oldPath, newPath } = matches?.groups ?? {}
      currentFileDiff.oldPath = cleanPath(oldPath)
      currentFileDiff.newPath = cleanPath(newPath)
    }

    // parse these with regex for uniformity or leave them
    // be because they're pretty simple?
    if (line.startsWith('---')) {
      const path = line.replace(/^--- /, '')
      if (path === '/dev/null') {
        currentFileDiff.type = 'add'
      }
      currentFileDiff.oldPath = cleanPath(path)
    }

    if (line.startsWith('+++')) {
      const path = line.replace(/^\+\+\+ /, '')
      if (path === '/dev/null') {
        currentFileDiff.type = 'delete'
      }
      currentFileDiff.newPath = cleanPath(path)
    }

    ////////////////////////////////
    // End headers, start "hunks" //
    ////////////////////////////////

    if (hunkHeaderRegex.test(line)) {
      currentFileDiff.hunks = currentFileDiff.hunks ?? []
      const matches = hunkHeaderRegex.exec(line)
      const { oldStart, newStart } = matches?.groups ?? {}

      // the type def for matches.groups seems slightly wrong, so
      // use the verbose accessors to avoid lint errors
      currentFileDiff.hunks.push({
        oldStart: Number(oldStart),
        oldLineCount: Number(matches?.groups?.oldLineCount ?? 1),
        newStart: Number(newStart),
        newLineCount: Number(matches?.groups?.newLineCount ?? 1),
      })
    }
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
