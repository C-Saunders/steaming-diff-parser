import { createReadStream } from 'node:fs'
import path from 'node:path'
import * as readline from 'node:readline'

export function getReadlineHelper(
  dirname: string,
  filename: string
): readline.Interface {
  return readline.createInterface({
    input: createReadStream(path.resolve(dirname, 'fixtures', filename)),
  })
}
