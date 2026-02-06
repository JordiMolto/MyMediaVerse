<script setup lang="ts">
interface Tab {
    value: string
    label: string
    icon?: string
}

interface Props {
    tabs: Tab[]
    modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

function selectTab(value: string) {
    emit('update:modelValue', value)
}
</script>

<template>
    <div class="app-tabs">
        <button v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: modelValue === tab.value }"
            @click="selectTab(tab.value)">
            <i v-if="tab.icon" class="fas" :class="tab.icon"></i>
            {{ tab.label }}
        </button>
    </div>
</template>

<style scoped src="./app-tabs.css"></style>
