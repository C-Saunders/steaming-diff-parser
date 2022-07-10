import { parseAll } from '../..'
import { getReadlineHelper } from '../getReadlineHelper'

const getReadline = (filename: string) => getReadlineHelper(__dirname, filename)

describe('binary file', () => {
  test('added', async () => {
    const results = await parseAll(getReadline('newBinaryFile.diff'))
    expect(results).toStrictEqual([
      {
        type: 'add',
        oldPath: '/dev/null',
        newPath: '/foo/test.pdf',
        isBinary: true,
        trailingNewline: 'present',
        newFileMode: '100644',
        oldBlobObjectName: '0000000',
        newBlobObjectName: 'cd4d9e8',
      },
    ])
  })
  test('deleted', async () => {
    const results = await parseAll(getReadline('deleteBinaryFile.diff'))
    expect(results).toStrictEqual([
      {
        type: 'delete',
        oldPath: '/foo/test.pdf',
        newPath: '/dev/null',
        isBinary: true,
        trailingNewline: 'present',
        oldFileMode: '100644',
        oldBlobObjectName: 'cd4d9e8',
        newBlobObjectName: '0000000',
      },
    ])
  })
  test('modified', async () => {
    const results = await parseAll(getReadline('modifyBinaryFile.diff'))
    expect(results).toStrictEqual([
      {
        type: 'modify',
        oldPath: '/foo/test.pdf',
        newPath: '/foo/test.pdf',
        isBinary: true,
        trailingNewline: 'present',
        oldBlobObjectName: 'cd4d9e8',
        newBlobObjectName: '17110ae',
        oldFileMode: '100644',
        newFileMode: '100644',
      },
    ])
  })
})
