import { toast } from 'react-hot-toast';
import type { ToastOptions } from 'react-hot-toast';
import { CustomToast } from '../components/ui/toast/CustomToast';
import type { ToastType } from '../components/ui/toast/CustomToast';

interface ToastParams {
  title: string;
  message?: string;
  options?: ToastOptions;
}

const createToast = (type: ToastType, { title, message, options }: ToastParams) => {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type={type}
        title={title}
        message={message}
      />
    ),
    {
      duration: type === 'loading' ? Infinity : 4000,
      ...options,
    }
  );
};

export const toastSuccess = (title: string, message?: string, options?: ToastOptions) =>
  createToast('success', { title, message, options });

export const toastError = (title: string, message?: string, options?: ToastOptions) =>
  createToast('error', { title, message, options });

export const toastWarning = (title: string, message?: string, options?: ToastOptions) =>
  createToast('warning', { title, message, options });

export const toastInfo = (title: string, message?: string, options?: ToastOptions) =>
  createToast('info', { title, message, options });

export const toastLoading = (title: string, message?: string, options?: ToastOptions) =>
  createToast('loading', { title, message, options });

/**
 * Promise toast wrapper for async actions
 */
export const toastPromise = <T,>(
  promise: Promise<T>,
  msgs: {
    loading: { title: string; message?: string };
    success: { title: string; message?: string };
    error: { title: string; message?: string };
  },
  options?: ToastOptions
) => {
  const id = toastLoading(msgs.loading.title, msgs.loading.message, options);

  promise
    .then(() => {
      toast.dismiss(id);
      toastSuccess(msgs.success.title, msgs.success.message, options);
    })
    .catch(() => {
      toast.dismiss(id);
      toastError(msgs.error.title, msgs.error.message, options);
    });

  return promise;
};

export const dismissToast = (id?: string) => toast.dismiss(id);
