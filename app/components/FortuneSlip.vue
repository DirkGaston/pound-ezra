<script setup lang="ts">
import type { Verse } from '~/composables/useRandomVerse'

const props = defineProps<{
  verse: Verse
  fromX: number
  fromY: number
  landX: number
  landY: number
}>()

const emit = defineEmits<{ landed: [] }>()

const slip = ref<HTMLElement | null>(null)
let flight: Animation | null = null

function place(x: number, y: number, z: number, rx: number, ry: number, rz: number, scale: number) {
  const node = slip.value
  const w = node?.offsetWidth ?? 0
  const h = node?.offsetHeight ?? 0
  return `translate3d(${x - w / 2}px, ${y - h / 2}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`
}

onMounted(() => {
  const node = slip.value
  if (!node) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const landY = Math.min(props.landY, window.innerHeight - node.offsetHeight / 2 - 16)
  const gust = Math.min(150, window.innerWidth * 0.18)
  const fromX = props.fromX
  const fromY = props.fromY
  const landX = props.landX

  if (reduce) {
    node.style.opacity = '1'
    node.style.transform = place(landX, landY, 0, 0, 0, -1.5, 1)
    emit('landed')
    return
  }

  flight = node.animate(
    [
      { offset: 0, opacity: 0, transform: place(fromX, fromY, -160, 78, 0, -36, 0.08) },
      { offset: 0.14, opacity: 1, transform: place(fromX + gust * 0.45, fromY - 36, -20, 28, -48, 62, 0.28) },
      { offset: 0.32, opacity: 1, transform: place(fromX - gust * 0.85, fromY - 92, 90, -36, 42, -78, 0.52) },
      { offset: 0.5, opacity: 1, transform: place(fromX + gust * 0.7, (fromY + landY) / 2, 170, 22, -36, 70, 0.74) },
      { offset: 0.68, opacity: 1, transform: place(landX - gust * 0.35, landY - 28, 230, -14, 24, -32, 1.02) },
      { offset: 0.84, opacity: 1, transform: place(landX + 12, landY + 8, 200, 8, -8, 14, 1.06) },
      { offset: 1, opacity: 1, transform: place(landX, landY, 160, 0, 0, -2, 1) },
    ],
    { duration: 3000, easing: 'linear', fill: 'forwards' },
  )

  flight.onfinish = () => emit('landed')
})

onUnmounted(() => {
  flight?.cancel()
  flight = null
})
</script>

<template>
  <p ref="slip" class="slip">{{ verse.text }}</p>
</template>
