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
  changes: Change[]
export type FileDiff = {
  hunks?: Hunk[]
  isBinary: boolean
  oldTrailingNewline: boolean
  newTrailingNewline: boolean
  /^@@\s+-(?<oldStart>[0-9]+)(?:,(?<oldLineCount>[0-9]+))?\s+\+(?<newStart>[0-9]+)(?:,(?<newLineCount>[0-9]+))? @@(?: (?<header>.*))?$/

function assertComplete(fileDiff: Partial<FileDiff>): fileDiff is FileDiff {
  assert(fileDiff.oldPath !== undefined)
  assert(fileDiff.newPath !== undefined)
  assert(fileDiff.isBinary !== undefined)
  assert(fileDiff.type !== undefined)
  assert(fileDiff.oldTrailingNewline !== undefined)
  assert(fileDiff.newTrailingNewline !== undefined)
  return true
}
  // we need to track the line numbers for old and new separately
  let oldLineNumber: number | undefined
  let newLineNumber: number | undefined
        assertComplete(currentFileDiff)
      currentFileDiff = {
        type: 'modify',
        isBinary: false,
        oldTrailingNewline: true,
        newTrailingNewline: true,
      }

      continue

      continue

      continue

      continue

      continue

      continue

      continue

      continue

      continue

      continue

      continue
    //////////////////////////////////
    // End "headers", start "hunks" //
    //////////////////////////////////
      const { oldStart, newStart, header } = matches?.groups ?? {}

      oldLineNumber = Number(oldStart)
      newLineNumber = Number(newStart)

      // the type def for matches.groups is
      // { [key: string]: string; } | undefined
      // rather than
      // { [key: string]: string | undefined; } | undefined
      // which is correct for non-optional groups, but we have some optionals
      // so just use the verbose accessors to avoid lint errors
        oldStartLineNumber: oldLineNumber,
        newStartLineNumber: newLineNumber,
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
        currentFileDiff.oldTrailingNewline = false
        currentFileDiff.newTrailingNewline = true
      } else if (previous.type === 'add') {
        currentFileDiff.oldTrailingNewline = true
        currentFileDiff.newTrailingNewline = false
      } else {
        currentFileDiff.oldTrailingNewline = false
        currentFileDiff.newTrailingNewline = false
      }

      continue
  if (currentFileDiff === undefined) {
    yield undefined
  } else {
    assertComplete(currentFileDiff)
    yield currentFileDiff
  }
    console.log(JSON.stringify(output, null, '  '))