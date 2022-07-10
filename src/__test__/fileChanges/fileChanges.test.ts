import { parseAll } from '../..'
import { getReadlineHelper } from '../getReadlineHelper'

const getReadline = (filename: string) => getReadlineHelper(__dirname, filename)

test('file mode changed', async () => {
  const results = await parseAll(getReadline('changeFileMode.diff'))
  expect(results).toStrictEqual([
    {
      type: 'modify',
      oldPath: 'foo/a.txt',
      newPath: 'foo/a.txt',
      isBinary: false,
      oldTrailingNewline: true,
      newTrailingNewline: true,
      oldFileMode: '100644',
      newFileMode: '100755',
    },
  ])
})

test('file mode changed and content modified', async () => {
  const results = await parseAll(getReadline('changeFileModeAndModify.diff'))
  expect(results).toStrictEqual([
    {
      type: 'modify',
      oldPath: '/foo/a.txt',
      newPath: '/foo/a.txt',
      isBinary: false,
      oldTrailingNewline: true,
      newTrailingNewline: true,
      oldFileMode: '100644',
      newFileMode: '100755',
      oldBlobObjectName: '257cc56',
      newBlobObjectName: '3bd1f0e',
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
  ])
})

test('file moved with similarity index', async () => {
  const results = await parseAll(getReadline('moveFile.diff'))
  expect(results).toStrictEqual([
    {
      type: 'rename',
      oldPath: 'foo/a.txt',
      newPath: 'bar/a.txt',
      isBinary: false,
      oldTrailingNewline: true,
      newTrailingNewline: true,
      similarity: 100,
    },
  ])
})

test('file deleted', async () => {
  const results = await parseAll(getReadline('deleteFile.diff'))
  expect(results).toStrictEqual([
    {
      type: 'delete',
      oldPath: '/foo/a.txt',
      newPath: '/dev/null',
      isBinary: false,
      oldTrailingNewline: true,
      newTrailingNewline: true,
      oldFileMode: '100644',
      oldBlobObjectName: '257cc56',
      newBlobObjectName: '0000000',
      hunks: [
        {
          header: undefined,
          oldStartLineNumber: 1,
          oldLineCount: 1,
          newStartLineNumber: 0,
          newLineCount: 0,
          changes: [
            {
              type: 'remove',
              content: 'foo',
              lineNumber: 1,
            },
          ],
        },
      ],
    },
  ])
})

test('file added', async () => {
  const results = await parseAll(getReadline('newFile.diff'))
  expect(results).toStrictEqual([
    {
      type: 'add',
      oldPath: '/dev/null',
      newPath: '/foo/a.txt',
      isBinary: false,
      oldTrailingNewline: true,
      newTrailingNewline: true,
      newFileMode: '100644',
      oldBlobObjectName: '0000000',
      newBlobObjectName: '257cc56',
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
              content: 'foo',
              lineNumber: 1,
            },
          ],
        },
      ],
    },
  ])
})

test.todo('file moved with dissimilarity index')
test.todo('file copied')
