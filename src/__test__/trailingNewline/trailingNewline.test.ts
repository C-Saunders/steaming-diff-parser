import { parseAll } from '../..'
import { getReadlineHelper } from '../getReadlineHelper'

const getReadline = (filename: string) => getReadlineHelper(__dirname, filename)

describe('trailing newline', () => {
  test('added', async () => {
    const results = await parseAll(getReadline('trailingNewlineAdded.diff'))
    expect(results).toStrictEqual([
      {
        type: 'modify',
        oldPath: '/foo/a.txt',
        newPath: '/foo/a.txt',
        isBinary: false,
        oldTrailingNewline: false,
        newTrailingNewline: true,
        oldBlobObjectName: '1910281',
        newBlobObjectName: '257cc56',
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
                content: 'foo',
                lineNumber: 1,
              },
            ],
          },
        ],
      },
    ])
  })
  test('removed', async () => {
    const results = await parseAll(getReadline('trailingNewlineRemoved.diff'))
    expect(results).toStrictEqual([
      {
        type: 'modify',
        oldPath: '/foo/a.txt',
        newPath: '/foo/a.txt',
        isBinary: false,
        oldTrailingNewline: true,
        newTrailingNewline: false,
        oldBlobObjectName: '257cc56',
        newBlobObjectName: '1910281',
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
                content: 'foo',
                lineNumber: 1,
              },
            ],
          },
        ],
      },
    ])
  })
  test('missing but unchanged', async () => {
    const results = await parseAll(getReadline('trailingNewlineMissing.diff'))
    expect(results).toStrictEqual([
      {
        type: 'modify',
        oldPath: '/foo/a.txt',
        newPath: '/foo/a.txt',
        isBinary: false,
        oldTrailingNewline: false,
        newTrailingNewline: false,
        oldBlobObjectName: 'a907ec3',
        newBlobObjectName: 'b2afafa',
        oldFileMode: '100755',
        newFileMode: '100755',
        hunks: [
          {
            header: undefined,
            oldStartLineNumber: 1,
            oldLineCount: 2,
            newStartLineNumber: 1,
            newLineCount: 3,
            changes: [
              {
                type: 'unchanged',
                content: 'foo',
                newLineNumber: 1,
                oldLineNumber: 1,
              },
              {
                type: 'add',
                content: 'banana',
                lineNumber: 2,
              },
              {
                type: 'unchanged',
                content: 'bar',
                newLineNumber: 3,
                oldLineNumber: 2,
              },
            ],
          },
        ],
      },
    ])
  })
})
