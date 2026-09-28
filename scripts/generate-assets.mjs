import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function crc32(buf) {
  let c = ~0
  for (const b of buf) {
    c ^= b
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function writePng(path, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1)
    raw[row] = 0
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
}

function makeFist() {
  const size = 32
  const pixels = Buffer.alloc(size * size * 4)
  const filled = Array.from({ length: size }, () => Array(size).fill(false))
  const cuff = Array.from({ length: size }, () => Array(size).fill(false))

  const stamp = (x, y, rx, ry, kind) => {
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dx = (px + 0.5 - x) / rx
        const dy = (py + 0.5 - y) / ry
        if (dx * dx + dy * dy <= 1) {
          filled[py][px] = true
          if (kind === 'cuff') cuff[py][px] = true
        }
      }
    }
  }

  stamp(13, 16, 8.2, 6.4, 'palm')
  stamp(20.5, 12.2, 3.1, 2.5, 'knuckle')
  stamp(22.2, 15.2, 3.3, 2.6, 'knuckle')
  stamp(21.2, 18.4, 3.1, 2.4, 'knuckle')
  stamp(11.2, 10.2, 3.3, 2.3, 'thumb')
  stamp(9.5, 21.5, 5.2, 3.4, 'cuff')

  const outline = '#1b140f'
  const glove = ['#ffffff', '#f4f1ea', '#d7d0c3']
  const reds = ['#d13238', '#c4232a', '#8e1520']

  const hex = (h) => [
    Number.parseInt(h.slice(1, 3), 16),
    Number.parseInt(h.slice(3, 5), 16),
    Number.parseInt(h.slice(5, 7), 16),
  ]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      if (!filled[y][x]) {
        let edge = false
        for (let oy = -1; oy <= 1 && !edge; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const ny = y + oy
            const nx = x + ox
            if (ny >= 0 && nx >= 0 && ny < size && nx < size && filled[ny][nx]) {
              edge = true
              break
            }
          }
        }
        if (!edge) continue
        const [r, g, b] = hex(outline)
        pixels[i] = r
        pixels[i + 1] = g
        pixels[i + 2] = b
        pixels[i + 3] = 255
        continue
      }

      const shade = (x + y) % 3
      const [r, g, b] = hex(cuff[y][x] ? reds[shade] : glove[shade])
      pixels[i] = r
      pixels[i + 1] = g
      pixels[i + 2] = b
      pixels[i + 3] = 255
    }
  }

  writePng(new URL('../public/cursor-fist.png', import.meta.url), size, size, pixels)
}

const FONT = {
  S: ['01110', '10001', '10000', '01110', '00001', '10001', '01110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
}

function makeStatue() {
  const W = 640
  const H = 860
  const pixels = Buffer.alloc(W * H * 4)
  const mask = new Uint8Array(W * H)

  const paint = (test, id) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (test(x, y)) mask[y * W + x] = id
      }
    }
  }

  const ellipse = (cx, cy, rx, ry) => (x, y) => {
    const dx = (x - cx) / rx
    const dy = (y - cy) / ry
    return dx * dx + dy * dy <= 1
  }

  paint(ellipse(320, 250, 118, 148), 1)
  paint(ellipse(320, 168, 112, 70), 1)
  paint((x, y) => x > 286 && x < 354 && y > 360 && y < 470, 1)
  paint(ellipse(320, 500, 196, 86), 1)
  paint((x, y) => x > 268 && x < 372 && y > 540 && y < 690, 1)
  paint((x, y) => x > 188 && x < 452 && y > 660 && y < 790, 2)
  paint(ellipse(268, 248, 16, 10), 3)
  paint(ellipse(372, 248, 16, 10), 3)
  paint((x, y) => {
    const dx = (x - 320) / 10
    const dy = (y - 292) / 28
    return dx * dx + dy * dy <= 1 && x < 328
  }, 3)
  paint((x, y) => y > 332 && y < 340 && x > 286 && x < 354 && Math.abs(x - 320) < 34 - Math.abs(y - 336), 3)

  const glyph = (ch, originX, originY, scale) => {
    const rows = FONT[ch]
    for (let gy = 0; gy < rows.length; gy++) {
      for (let gx = 0; gx < rows[gy].length; gx++) {
        if (rows[gy][gx] !== '1') continue
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const x = originX + gx * scale + px
            const y = originY + gy * scale + py
            if (x >= 0 && y >= 0 && x < W && y < H) mask[y * W + x] = 4
          }
        }
      }
    }
  }

  const label = 'STATUE'
  const scale = 4
  const gap = 2
  const glyphW = 5 * scale
  const total = label.length * glyphW + (label.length - 1) * gap * scale
  let cursor = Math.round((W - total) / 2)
  for (const ch of label) {
    glyph(ch, cursor, 712, scale)
    cursor += glyphW + gap * scale
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const id = mask[y * W + x]
      if (!id) continue
      const i = (y * W + x) * 4
      if (id === 4) {
        pixels[i] = 74
        pixels[i + 1] = 58
        pixels[i + 2] = 42
        pixels[i + 3] = 255
        continue
      }
      if (id === 3) {
        pixels[i] = 92
        pixels[i + 1] = 88
        pixels[i + 2] = 84
        pixels[i + 3] = 255
        continue
      }
      const light = 1 - (x - 180) / 320
      const n = Math.sin(x * 0.05) * 7 + Math.cos(y * 0.04) * 5
      const base = (id === 2 ? 150 : 198) + light * 28 + n
      pixels[i] = base
      pixels[i + 1] = base - 2
      pixels[i + 2] = base - 8
      pixels[i + 3] = 255
    }
  }

  writePng(new URL('../public/statue.png', import.meta.url), W, H, pixels)
}

makeFist()
makeStatue()
