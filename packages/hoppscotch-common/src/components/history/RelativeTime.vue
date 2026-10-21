<template>
  <time
    v-tippy="{ theme: 'tooltip', content: tooltipContent }"
    class="flex shrink-0 items-center px-2 text-tiny text-secondaryLight whitespace-nowrap"
    :datetime="datetimeAttr"
    >{{ label }}</time
  >
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { formatRelative, shortDateTime } from "~/helpers/utils/date"

const props = defineProps<{
  date: Date
}>()

// Live label: one gentle tick per minute keeps relative times honest without
// re-rendering the list on every second.
const now = ref(new Date())
let tick: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  tick = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
  if (tick) clearInterval(tick)
})

// Compact density for the row itself; the tooltip carries the verbose
// density plus the absolute instant, so no precision is lost.
const label = computed(() => formatRelative(props.date, now.value, "compact"))

const tooltipContent = computed(
  () =>
    `${formatRelative(props.date, now.value, "verbose")} \u00b7 ${shortDateTime(props.date)}`
)

const datetimeAttr = computed(() => props.date.toISOString())
</script>
