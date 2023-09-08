import { Unsubscribe } from '@reduxjs/toolkit';

import { AppListenerEffectAPI, AppStartListening } from '@/stores';
import { setLocation, setTitle } from '@/stores/layout';

const onUpdateLocation = (
  { payload: { location } }: ReturnType<typeof setLocation>,
  { dispatch }: AppListenerEffectAPI,
) => {
  if (location) console.log('token middleware start');

  dispatch(setTitle(true));
};

export const setupLayoutListeners = (
  startListening: AppStartListening,
): Unsubscribe => {
  const subscriptions = [
    startListening({
      actionCreator: setLocation,
      effect: onUpdateLocation,
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
};
