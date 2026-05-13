import { ref } from "vue";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const isOpen = ref(false);
const options = ref<ConfirmOptions>({ message: "" });
let resolveFn: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function showConfirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = opts;
    isOpen.value = true;
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve;
    });
  }

  function accept() {
    isOpen.value = false;
    resolveFn?.(true);
    resolveFn = null;
  }

  function cancel() {
    isOpen.value = false;
    resolveFn?.(false);
    resolveFn = null;
  }

  return { isOpen, options, showConfirm, accept, cancel };
}
