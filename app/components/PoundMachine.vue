<script setup lang="ts">
defineProps<{
  pounded: boolean
}>()

const emit = defineEmits<{ punch: [] }>()

const { play } = usePunchSound()
const face = ref<HTMLImageElement | null>(null)
const hits = ref(0)

defineExpose({ face })

function onPunch() {
  try {
    play()
  } catch {
    // A blocked audio device still owes the visitor a verse.
  }
  hits.value += 1
  emit('punch')
}
</script>

<template>
  <button
    type="button"
    class="statue-hit"
    aria-label="Punch the statue for a verse"
    @click="onPunch"
  >
    <span class="faces">
      <img
        ref="face"
        class="face"
        :class="{ 'is-down': pounded }"
        src="/statue.png"
        alt=""
        width="720"
        height="1024"
      >
      <img
        class="face face-hit"
        :class="{ 'is-down': !pounded }"
        src="/statue-hit.png"
        alt=""
        width="720"
        height="1024"
      >
    </span>
    <span v-if="hits" :key="`flash-${hits}`" class="flash" aria-hidden="true" />
    <span v-if="hits" :key="`burst-${hits}`" class="burst" aria-hidden="true">POUND!</span>
  </button>
</template>
