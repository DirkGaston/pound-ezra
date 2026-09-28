const PUNCH_URL = '/punch.wav?v=2'

export function usePunchSound() {
  let ctx: AudioContext | null = null
  let buffer: AudioBuffer | null = null
  let bytesPromise: Promise<ArrayBuffer> | null = null

  function fetchBytes() {
    if (!bytesPromise) {
      bytesPromise = fetch(PUNCH_URL).then((response) => {
        if (!response.ok) throw new Error('Could not load the punch sound')
        return response.arrayBuffer()
      })
    }
    return bytesPromise
  }

  if (import.meta.client) {
    void fetchBytes().catch(() => {
      bytesPromise = null
    })
  }

  function play() {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const audio = ctx

    void fetchBytes()
      .then(async (bytes) => {
        if (!buffer) buffer = await audio.decodeAudioData(bytes.slice(0))
        return buffer
      })
      .then((decoded) => {
        const source = audio.createBufferSource()
        source.buffer = decoded
        source.connect(audio.destination)
        source.start()
      })
      .catch(() => {})
  }

  return { play }
}
