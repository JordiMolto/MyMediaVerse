<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
    value: string | number
    label: string
}

interface Props {
    modelValue: string | number
    options: Option[]
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    required?: boolean
    pill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    placeholder: 'Selecciona una opción',
    pill: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => {
    return props.options.find(opt => opt.value === props.modelValue)
})

function toggle() {
    if (props.disabled) return
    isOpen.value = !isOpen.value
}

function selectOption(value: string | number) {
    emit('update:modelValue', value)
    isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
    if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div ref="selectRef" class="app-select" :class="{ 'is-open': isOpen, 'is-pill': pill, 'is-disabled': disabled }">
        <label v-if="label" class="select-label">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>

        <div class="select-wrapper">
            <div class="select-trigger" @click="toggle">
                <span v-if="selectedOption" class="selected-text">{{ selectedOption.label }}</span>
                <span v-else class="placeholder-text">{{ placeholder }}</span>
                <i class="fas fa-chevron-down select-icon" :class="{ 'rotate': isOpen }"></i>
            </div>

            <Transition name="dropdown-fade">
                <div v-if="isOpen" class="dropdown-menu">
                    <div v-for="option in options" :key="option.value" class="dropdown-option"
                        :class="{ 'active': option.value === modelValue }" @click="selectOption(option.value)">
                        {{ option.label }}
                        <i v-if="option.value === modelValue" class="fas fa-check check-icon"></i>
                    </div>
                </div>
            </Transition>
        </div>

        <span v-if="error" class="select-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
        </span>
    </div>
</template>

<style scoped src="./app-select.css"></style>
