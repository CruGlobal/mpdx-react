import React from 'react';
import { OptionsObject, useSnackbar, WithSnackbarProps } from 'notistack';

// Adapted from https://github.com/iamhosseindhv/notistack/issues/30#issuecomment-832261019
// Must be imported at least once in the app to initialize the ref
let snackbarRef: WithSnackbarProps;
export const SnackbarUtilsConfigurator: React.FC = () => {
  snackbarRef = useSnackbar();
  return null;
};

const toast = (msg: string, options: OptionsObject = {}): void => {
  snackbarRef.enqueueSnackbar(msg, options);
};

const success = (msg: string, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'success' });
};
const warning = (msg: string, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'warning' });
};
const info = (msg: string, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'info' });
};
const error = (msg: string, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'error' });
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  toast,
  success,
  warning,
  info,
  error,
};
