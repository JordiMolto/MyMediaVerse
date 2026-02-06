<script setup lang="ts">
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
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    placeholder: 'Selecciona una opción'
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
}>()

function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value)
}
</script>

<template>
    <div class="app-select">
        <label v-if="label" class="select-label">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>

        <div class="select-wrapper">
            <select :value="modelValue" :disabled="disabled" :required="required" class="select-field"
                @change="handleChange">
                <option value="" disabled>{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
            <i class="fas fa-chevron-down select-icon"></i>
        </div>

        <span v-if="error" class="select-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
        </span>
    </div>
</template>

<style scoped src="./app-select.css"></style>
