import { parseAll } from '../..'
import { getReadlineHelper } from '../getReadlineHelper'

const getReadline = (filename: string) => getReadlineHelper(__dirname, filename)

test('simple modification', async () => {
  const results = await parseAll(getReadline('modifyContent.diff'))
  expect(results).toStrictEqual([
    {
      type: 'modify',
      oldPath: '/foo/a.txt',
      newPath: '/foo/a.txt',
      isBinary: false,
      trailingNewline: 'present',
      oldBlobObjectName: '257cc56',
      newBlobObjectName: '929efb3',
      oldFileMode: '100644',
      newFileMode: '100644',
      hunks: [
        {
          header: undefined,
          oldStartLineNumber: 1,
          oldLineCount: 1,
          newStartLineNumber: 1,
          newLineCount: 1,
          changes: [
            {
              type: 'remove',
              content: 'foo',
              lineNumber: 1,
            },
            {
              type: 'add',
              content: 'foo!',
              lineNumber: 1,
            },
          ],
        },
      ],
    },
  ])
})

test('multiple hunks', async () => {
  const results = await parseAll(getReadline('multipleHunks.diff'))
  expect(results).toStrictEqual([
    {
      type: 'modify',
      oldPath: '/src/index.ts',
      newPath: '/src/index.ts',
      isBinary: false,
      trailingNewline: 'present',
      oldBlobObjectName: '80e08be',
      newBlobObjectName: 'bc3b328',
      oldFileMode: '100644',
      newFileMode: '100644',
      hunks: [
        {
          oldStartLineNumber: 11,
          oldLineCount: 12,
          newStartLineNumber: 11,
          newLineCount: 12,
          header: 'export interface Change {',
          changes: [
            {
              type: 'unchanged',
              content: '}',
              newLineNumber: 11,
              oldLineNumber: 11,
            },
            {
              type: 'unchanged',
              content: '',
              newLineNumber: 12,
              oldLineNumber: 12,
            },
            {
              type: 'unchanged',
              content: 'export interface Hunk {',
              newLineNumber: 13,
              oldLineNumber: 13,
            },
            {
              type: 'remove',
              content: '  content: string',
              lineNumber: 14,
            },
            {
              type: 'remove',
              content: '  oldStart: number',
              lineNumber: 15,
            },
            {
              type: 'remove',
              content: '  newStart: number',
              lineNumber: 16,
            },
            {
              type: 'remove',
              content: '  oldLines: number',
              lineNumber: 17,
            },
            {
              type: 'remove',
              content: '  newLines: number',
              lineNumber: 18,
            },
            {
              type: 'remove',
              content: '  changes: Change[]',
              lineNumber: 19,
            },
            {
              type: 'add',
              content: '  content?: string',
              lineNumber: 14,
            },
            {
              type: 'add',
              content: '  oldStart?: number',
              lineNumber: 15,
            },
            {
              type: 'add',
              content: '  newStart?: number',
              lineNumber: 16,
            },
            {
              type: 'add',
              content: '  oldLineCount?: number',
              lineNumber: 17,
            },
            {
              type: 'add',
              content: '  newLineCount?: number',
              lineNumber: 18,
            },
            {
              type: 'add',
              content: '  changes?: Change[]',
              lineNumber: 19,
            },
            {
              type: 'unchanged',
              content: '}',
              newLineNumber: 20,
              oldLineNumber: 20,
            },
            {
              type: 'unchanged',
              content: '',
              newLineNumber: 21,
              oldLineNumber: 21,
            },
            {
              type: 'unchanged',
              content: 'export interface FileDiff {',
              newLineNumber: 22,
              oldLineNumber: 22,
            },
          ],
        },
        {
          oldStartLineNumber: 36,
          oldLineCount: 6,
          newStartLineNumber: 36,
          newLineCount: 10,
          header: 'export interface FileDiff {',
          changes: [
            {
              type: 'unchanged',
              content: '  newEndingNewLine: boolean',
              newLineNumber: 36,
              oldLineNumber: 36,
            },
            {
              type: 'unchanged',
              content: '}',
              newLineNumber: 37,
              oldLineNumber: 37,
            },
            {
              type: 'unchanged',
              content: '',
              newLineNumber: 38,
              oldLineNumber: 38,
            },
            {
              type: 'add',
              content:
                'const similarityRegex = /^similarity index (?<percent>\\d+)%$/',
              lineNumber: 39,
            },
            {
              type: 'add',
              content: 'const unifiedDiffRegex =',
              lineNumber: 40,
            },
            {
              type: 'add',
              content:
                '  /^@@\\s+-(?<oldStart>[0-9]+)(?:,(?<oldLineCount>[0-9]+))?\\s+\\+(?<newStart>[0-9]+)(?:,(?<newLineCount>[0-9]+))?\\s+@@/',
              lineNumber: 41,
            },
            {
              type: 'add',
              content: '',
              lineNumber: 42,
            },
            {
              type: 'unchanged',
              content: 'export async function* run(',
              newLineNumber: 43,
              oldLineNumber: 39,
            },
            {
              type: 'unchanged',
              content: '  input: readline.Interface',
              newLineNumber: 44,
              oldLineNumber: 40,
            },
            {
              type: 'unchanged',
              content:
                '): AsyncGenerator<Partial<FileDiff> | undefined, void> {',
              newLineNumber: 45,
              oldLineNumber: 41,
            },
          ],
        },
        {
          oldStartLineNumber: 51,
          oldLineCount: 6,
          newStartLineNumber: 55,
          newLineCount: 11,
          header: 'export async function* run(',
          changes: [
            {
              type: 'unchanged',
              content: '      currentFileDiff = {}',
              newLineNumber: 55,
              oldLineNumber: 51,
            },
            {
              type: 'unchanged',
              content: '    }',
              newLineNumber: 56,
              oldLineNumber: 52,
            },
            {
              type: 'unchanged',
              content: '    assert(currentFileDiff)',
              newLineNumber: 57,
              oldLineNumber: 53,
            },
            {
              type: 'add',
              content: '',
              lineNumber: 58,
            },
            {
              type: 'add',
              content: '    if (similarityRegex.test(line)) {',
              lineNumber: 59,
            },
            {
              type: 'add',
              content: '      const matches = similarityRegex.exec(line)',
              lineNumber: 60,
            },
            {
              type: 'add',
              content:
                '      currentFileDiff.similarity = Number(matches?.groups?.percent)',
              lineNumber: 61,
            },
            {
              type: 'add',
              content: '    }',
              lineNumber: 62,
            },
            {
              type: 'unchanged',
              content: '  }',
              newLineNumber: 63,
              oldLineNumber: 54,
            },
            {
              type: 'unchanged',
              content: '',
              newLineNumber: 64,
              oldLineNumber: 55,
            },
            {
              type: 'unchanged',
              content: '  yield currentFileDiff',
              newLineNumber: 65,
              oldLineNumber: 56,
            },
          ],
        },
      ],
    },
  ])
})
