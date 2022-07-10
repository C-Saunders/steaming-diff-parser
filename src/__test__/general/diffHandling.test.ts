import { parseAll } from '../..'
import { getReadlineHelper } from '../getReadlineHelper'

const getReadline = (filename: string) => getReadlineHelper(__dirname, filename)

test('multiple files changed', async () => {
  const results = await parseAll(getReadline('multipleFilesChanged.diff'))
  expect(results).toStrictEqual([
    {
      type: 'modify',
      oldPath: '/bar/a.txt',
      newPath: '/bar/a.txt',
      isBinary: false,
      trailingNewline: 'present',
      oldBlobObjectName: '257cc56',
      newBlobObjectName: '5716ca5',
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
              content: 'bar',
              lineNumber: 1,
            },
          ],
        },
      ],
    },
    {
      type: 'modify',
      oldPath: '/foo/a.txt',
      newPath: '/foo/a.txt',
      isBinary: false,
      trailingNewline: 'present',
      oldBlobObjectName: '257cc56',
      newBlobObjectName: '3bd1f0e',
      oldFileMode: '100644',
      newFileMode: '100644',
      hunks: [
        {
          header: undefined,
          oldStartLineNumber: 1,
          oldLineCount: 1,
          newStartLineNumber: 1,
          newLineCount: 2,
          changes: [
            {
              type: 'unchanged',
              content: 'foo',
              newLineNumber: 1,
              oldLineNumber: 1,
            },
            {
              type: 'add',
              content: 'bar',
              lineNumber: 2,
            },
          ],
        },
      ],
    },
    {
      type: 'add',
      oldPath: '/dev/null',
      newPath: '/foo/hello.txt',
      isBinary: false,
      trailingNewline: 'present',
      newFileMode: '100644',
      oldBlobObjectName: '0000000',
      newBlobObjectName: '45b983b',
      hunks: [
        {
          header: undefined,
          oldStartLineNumber: 0,
          oldLineCount: 0,
          newStartLineNumber: 1,
          newLineCount: 1,
          changes: [
            {
              type: 'add',
              content: 'hi',
              lineNumber: 1,
            },
          ],
        },
      ],
    },
  ])
})

test('no changes', async () => {
  const results = await parseAll(getReadline('empty.diff'))
  expect(results).toStrictEqual([])
})
