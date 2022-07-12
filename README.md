# streaming-diff-parser
Streaming parsing for git diffs.

## Usage

### Using an async iterator
```ts
import { parse } from 'streaming-diff-parser'

// create a readline interface, e.g. from a file or stdin
const input = readline.createInterface({
  input: createReadStream(...),
})

// iterate over results and do whatever you want with them
for await (const output of parse(input)) {
  console.log(JSON.stringify(output, null, '  '))
}
```

### Getting the entire output
```ts
import { parseAll, FileDiff } from 'streaming-diff-parser'

// create a readline interface, e.g. from a file or stdin
const input = readline.createInterface({
  input: createReadStream(...),
})

const results: FileDiff[] = await parseAll(input)
```

## Understanding the Output
[This Stack Overflow answer](https://stackoverflow.com/a/2530012) has a nice description of the parts of a git diff. The type definitions and a labeled example are below.
```ts
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
```
Comments were added to this diff, starting with #

```diff
diff --git a/bar/a.txt b/bar/a.txt # diff --git a/<oldPath> b/<newPath> - start of a new FileDiff
index 257cc56..5716ca5 100644 # index <oldBlobObjectName>..<newBlobObjectName> <old and new fileMode>
--- a/bar/a.txt # a/<oldPath>
+++ b/bar/a.txt # b/<newPath>, since neither of these paths are /dev/null, this FileDiff will have type='modify'
@@ -1 +1 @@ # beginning of hunk, - @@ -<oldStartLineNumber>,<oldLineCount=1> +<newStartLineNumber>,<newLineCount=1> <header=undefined>
-foo # 'remove' change
+bar # 'add' change
diff --git a/foo/a.txt b/foo/a.txt # start of a new FileDiff
index 257cc56..3bd1f0e 100644
--- a/foo/a.txt
+++ b/foo/a.txt
@@ -1 +1,2 @@
 foo
+bar
```
