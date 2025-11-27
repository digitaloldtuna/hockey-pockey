'use client';

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
});

// Minimal type describing the toast object passed to render fn
type CustomToast = {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading' | string;
  title?: string;
  description?: string;
  action?: { label: string; onClick?: () => void };
  closable?: boolean;
};

// 🔥 Simple helper functions
export const toastSuccess = (message: string, title = 'Success') =>
  toaster.create({
    type: 'success',
    title,
    description: message,
  });

export const toastError = (message: string, title = 'Error') =>
  toaster.create({
    type: 'error',
    title,
    description: message,
  });

export const toastInfo = (message: string, title = 'Info') =>
  toaster.create({
    type: 'info',
    title,
    description: message,
  });

export const toastLoading = (message: string, title = 'Loading') =>
  toaster.create({
    type: 'loading',
    title,
    description: message,
    closable: false,
  });

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast: CustomToast) => (
          <Toast.Root width={{ md: 'sm' }}>
            {toast.type === 'loading' ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}

            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
            </Stack>

            {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}

            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
