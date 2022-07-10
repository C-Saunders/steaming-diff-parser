import assert from 'node:assert'
import * as readline from 'node:readline'

// type definitions adapted from https://github.com/ecomfe/gitdiff-parser
export type Change =
  | {
      content: string
      type: 'add' | 'remove'
      lineNumber?: number
    }
  | {
      content: string
      type: 'unchanged'
      oldLineNumber: number
      newLineNumber: number
    }

export type Hunk = {
  header?: string
  oldStartLineNumber?: number
  newStartLineNumber?: number
  oldLineCount?: number
  newLineCount?: number
  changes: Change[]
}

export type FileDiff = {
  hunks?: Hunk[]
  oldFileMode?: string
  newFileMode?: string
  similarity?: number
  oldBlobObjectName?: string
  newBlobObjectName?: string
  oldPath: string
  newPath: string
  isBinary: boolean
  type: 'add' | 'delete' | 'modify' | 'rename' | 'copy'
  trailingNewline: 'present' | 'missing' | 'added' | 'removed'
}

const fileDiffHeaderRegex = /^diff --git a\/(?<oldPath>\S+) b\/(?<newPath>\S+)$/

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
  /^@@\s+-(?<oldStart>[0-9]+)(?:,(?<oldLineCount>[0-9]+))?\s+\+(?<newStart>[0-9]+)(?:,(?<newLineCount>[0-9]+))? @@(?: (?<header>.*))?$/

function assertComplete(fileDiff: Partial<FileDiff>): fileDiff is FileDiff {
  assert(fileDiff.oldPath !== undefined)
  assert(fileDiff.newPath !== undefined)
  assert(fileDiff.isBinary !== undefined)
  assert(fileDiff.type !== undefined)
  assert(fileDiff.trailingNewline !== undefined)
  return true
}

export async function* parse(
  input: readline.Interface
): AsyncGenerator<Partial<FileDiff> | undefined, void> {
  let currentFileDiff: Partial<FileDiff> | undefined
  // we need to track the line numbers for old and new separately
  let oldLineNumber: number | undefined
  let newLineNumber: number | undefined

  for await (const line of input) {
    // start of new FileDiff, so yield if we have anything and reset
    if (fileDiffHeaderRegex.test(line)) {
      if (currentFileDiff !== undefined) {
        assertComplete(currentFileDiff)
        yield currentFileDiff
      }

      const matches = fileDiffHeaderRegex.exec(line)
      const { oldPath, newPath } = matches?.groups ?? {}

      currentFileDiff = {
        type: 'modify',
        oldPath,
        newPath,
        isBinary: false,
        trailingNewline: 'present',
      }

      continue
    }
    assert(currentFileDiff)

    if (similarityRegex.test(line)) {
      const matches = similarityRegex.exec(line)
      currentFileDiff.similarity = Number(matches?.groups?.percent)

      continue
    }
    if (dissimilarityRegex.test(line)) {
      // I've never seen one of these, but it could happen, according to
      // http://git-scm.com/docs/git-diff#_generating_patch_text_with_p
      // TODO: make a test that hits this path
      const matches = dissimilarityRegex.exec(line)
      currentFileDiff.similarity = 100 - Number(matches?.groups?.percent)

      continue
    }

    if (filePathUpdatesRegex.test(line)) {
      const matches = filePathUpdatesRegex.exec(line)
      const { type, direction, path } = matches?.groups ?? {}
      currentFileDiff.type = type as 'rename' | 'copy'
      currentFileDiff[direction === 'from' ? 'oldPath' : 'newPath'] = path

      continue
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

      continue
    }

    if (fileModeChangeRegex.test(line)) {
      const matches = fileModeChangeRegex.exec(line)
      const { type, fileMode } = matches?.groups ?? {}
      currentFileDiff[type === 'old' ? 'oldFileMode' : 'newFileMode'] = fileMode

      continue
    }

    if (newFileRegex.test(line)) {
      currentFileDiff.type = 'add'
      const matches = newFileRegex.exec(line)
      currentFileDiff.newFileMode = matches?.groups?.fileMode

      continue
    }

    if (deletedFileRegex.test(line)) {
      currentFileDiff.type = 'delete'
      const matches = deletedFileRegex.exec(line)
      currentFileDiff.oldFileMode = matches?.groups?.fileMode

      continue
    }

    if (binaryFileRegex.test(line)) {
      currentFileDiff.isBinary = true
      const matches = binaryFileRegex.exec(line)
      const { oldPath, newPath } = matches?.groups ?? {}
      currentFileDiff.oldPath = cleanPath(oldPath)
      currentFileDiff.newPath = cleanPath(newPath)

      continue
    }

    // parse these with regex for uniformity or leave them
    // be because they're pretty simple?
    if (line.startsWith('---')) {
      const path = line.replace(/^--- /, '')
      if (path === '/dev/null') {
        currentFileDiff.type = 'add'
      }
      currentFileDiff.oldPath = cleanPath(path)

      continue
    }

    if (line.startsWith('+++')) {
      const path = line.replace(/^\+\+\+ /, '')
      if (path === '/dev/null') {
        currentFileDiff.type = 'delete'
      }
      currentFileDiff.newPath = cleanPath(path)

      continue
    }

    //////////////////////////////////
    // End "headers", start "hunks" //
    //////////////////////////////////

    if (hunkHeaderRegex.test(line)) {
      currentFileDiff.hunks = currentFileDiff.hunks ?? []
      const matches = hunkHeaderRegex.exec(line)
      const { oldStart, newStart, header } = matches?.groups ?? {}

      oldLineNumber = Number(oldStart)
      newLineNumber = Number(newStart)

      // the type def for matches.groups is
      // { [key: string]: string; } | undefined
      // rather than
      // { [key: string]: string | undefined; } | undefined
      // which is correct for non-optional groups, but we have some optionals
      // so just use the verbose accessors to avoid lint errors

      currentFileDiff.hunks.push({
        oldStartLineNumber: oldLineNumber,
        oldLineCount: Number(matches?.groups?.oldLineCount ?? 1),
        newStartLineNumber: newLineNumber,
        newLineCount: Number(matches?.groups?.newLineCount ?? 1),
        header,
        changes: [],
      })

      continue
    }

    assert(oldLineNumber !== undefined)
    assert(newLineNumber !== undefined)
    assert(currentFileDiff.hunks)
    const currentHunk = currentFileDiff.hunks[currentFileDiff.hunks.length - 1]

    if (line.startsWith('+')) {
      currentHunk.changes.push({
        type: 'add',
        content: line.slice(1),
        lineNumber: newLineNumber,
      })

      newLineNumber += 1

      continue
    }

    if (line.startsWith('-')) {
      currentHunk.changes.push({
        type: 'remove',
        content: line.slice(1),
        lineNumber: oldLineNumber,
      })

      oldLineNumber += 1

      continue
    }

    if (line.startsWith(' ')) {
      currentHunk.changes.push({
        type: 'unchanged',
        content: line.slice(1),
        newLineNumber,
        oldLineNumber,
      })

      newLineNumber += 1
      oldLineNumber += 1

      continue
    }

    if (line == '\\ No newline at end of file') {
      // trailing newline changed, what happened depends on the previous change
      // 'remove' = the trailing newline was added
      // 'add' = the trailing newline was removed
      // 'unchanged' = the trailing newline is unchanged (still missing)
      const previous = currentHunk.changes[currentHunk.changes.length - 1]
      if (previous.type === 'remove') {
        currentFileDiff.trailingNewline = 'added'
      } else if (previous.type === 'add') {
        currentFileDiff.trailingNewline = 'removed'
      } else {
        currentFileDiff.trailingNewline = 'missing'
      }

      continue
    }
  }

  if (currentFileDiff === undefined) {
    yield undefined
  } else {
    assertComplete(currentFileDiff)
    yield currentFileDiff
  }
}

export async function parseAll(
  input: readline.Interface
): Promise<Partial<FileDiff>[]> {
  const results = []
  for await (const output of parse(input)) {
    if (output !== undefined) {
      results.push(output)
    }
  }

  return results
}

if (require.main === module) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })
  parseAll(rl)
    .then(r => console.log(JSON.stringify(r, null, '  ')))
    .catch(e => console.error(e))
}
