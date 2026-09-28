<script setup lang="ts">
const { current, draw } = useRandomVerse()
const shaking = ref(false)
const pounded = ref(false)
const machine = useTemplateRef('machine')

const flight = ref<{ fromX: number, fromY: number, landX: number, landY: number } | null>(null)

let shakeTimer = 0
let punchSerial = 0

const petals = [
  { left: '6%', delay: '0s', duration: '17s', size: '11px' },
  { left: '18%', delay: '-6s', duration: '21s', size: '8px' },
  { left: '31%', delay: '-11s', duration: '19s', size: '13px' },
  { left: '47%', delay: '-3s', duration: '23s', size: '9px' },
  { left: '62%', delay: '-14s', duration: '18s', size: '12px' },
  { left: '74%', delay: '-8s', duration: '22s', size: '7px' },
  { left: '86%', delay: '-16s', duration: '20s', size: '10px' },
]

function statueImage() {
  const exposed = machine.value?.face as HTMLImageElement | { value?: HTMLImageElement | null } | null | undefined
  if (!exposed) return null
  if (exposed instanceof HTMLImageElement) return exposed
  return exposed.value ?? null
}

function onPunch() {
  const img = statueImage()
  if (!img) return

  const serial = ++punchSerial
  const rect = img.getBoundingClientRect()
  const fromX = rect.left + rect.width * 0.5
  const fromY = rect.top + rect.height * 0.53

  flight.value = {
    fromX,
    fromY,
    landX: window.innerWidth / 2,
    landY: Math.min(window.innerHeight - 96, rect.top + rect.height * 0.86),
  }
  pounded.value = true

  window.clearTimeout(shakeTimer)
  shaking.value = false
  requestAnimationFrame(() => {
    if (serial !== punchSerial) return
    shaking.value = true
    shakeTimer = window.setTimeout(() => {
      shaking.value = false
    }, 200)
  })

  draw()
}

function onLanded() {
  pounded.value = false
}
</script>

<template>
  <main class="cabinet" :class="{ 'is-shaking': shaking }">
    <div class="petals" aria-hidden="true">
      <span
        v-for="petal in petals"
        :key="petal.left"
        class="petal"
        :style="{
          left: petal.left,
          animationDelay: petal.delay,
          animationDuration: petal.duration,
          width: petal.size,
          height: `calc(${petal.size} * 1.35)`,
        }"
      />
    </div>

    <div class="cabinet-inner">
      <header class="mast">
        <h1 class="insert">Pound Ezra</h1>
      </header>

      <div class="stage">
        <PoundMachine ref="machine" :pounded="pounded" @punch="onPunch" />
      </div>
    </div>

    <div
      v-if="current && flight"
      class="flight"
      :style="{ perspectiveOrigin: `${flight.fromX}px ${flight.fromY}px` }"
    >
      <FortuneSlip
        :key="current.index"
        :verse="current"
        :from-x="flight.fromX"
        :from-y="flight.fromY"
        :land-x="flight.landX"
        :land-y="flight.landY"
        @landed="onLanded"
      />
    </div>
  </main>
</template>
