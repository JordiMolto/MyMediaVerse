<script setup lang="ts">
interface Props {
    modelValue: string | number
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea'
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    required?: boolean
    icon?: string
    rows?: number
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    disabled: false,
    required: false,
    rows: 4
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
}>()

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement
    emit('update:modelValue', target.value)
}
</script>

<template>
    <div class="app-input">
        <label v-if="label" class="input-label">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>

        <div class="input-wrapper">
            <i v-if="icon" class="fas input-icon" :class="icon"></i>

            <textarea v-if="type === 'textarea'" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
                :required="required" :rows="rows" class="input-field textarea-field" @input="handleInput"></textarea>

            <input v-else :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
                :required="required" class="input-field" :class="{ 'has-icon': icon }" @input="handleInput">
        </div>

        <span v-if="error" class="input-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
        </span>
    </div>
</template>

<style scoped src="./app-input.css"></style>
