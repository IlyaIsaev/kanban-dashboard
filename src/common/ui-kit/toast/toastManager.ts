import { Toast } from "@base-ui/react/toast";

export type ToastData = {
  readonly descriptionLines?: readonly string[];
};

export const toastManager = Toast.createToastManager<ToastData>();
