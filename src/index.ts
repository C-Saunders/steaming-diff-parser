export function run(): void {
  console.log('hello, world!')
}

if (require.main === module) {
  run()
}
