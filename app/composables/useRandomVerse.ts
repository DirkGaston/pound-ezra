import versesFile from '~/data/verses.json'

export type VerseLine = {
  text: string
  author: string
  work: string
  poem: string
  source_file: string
}

export type Verse = VerseLine & {
  index: number
}

const lines = versesFile.lines as VerseLine[]

function randomIndex(length: number): number {
  if (length <= 1) return 0

  const limit = Math.floor(0x1_0000_0000 / length) * length
  const buf = new Uint32Array(1)
  let value = 0

  do {
    crypto.getRandomValues(buf)
    value = buf[0]!
  } while (value >= limit)

  return value % length
}

export function useRandomVerse() {
  const current = ref<Verse | null>(null)
  let lastIndex = -1

  function draw() {
    if (lines.length === 0) return

    let index = randomIndex(lines.length)
    if (lines.length > 1) {
      while (index === lastIndex) index = randomIndex(lines.length)
    }

    const next = lines[index]
    if (!next) return

    lastIndex = index
    current.value = { ...next, index }
  }

  return { current, draw }
}
