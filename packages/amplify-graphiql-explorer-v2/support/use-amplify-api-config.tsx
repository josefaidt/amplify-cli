'use client';
import { createContext, useContext, useReducer } from 'react';
import { DEFAULT_API_CONFIG } from '@/support/constants';
import type { PropsWithChildren } from 'react';
import type { AmplifyGraphQLConfig } from './types';

export const API_CONFIG_ACTION = {
  UPDATE: 'UPDATE',
} as const;

type AmplifyApiConfigAction = {
  type: typeof API_CONFIG_ACTION.UPDATE;
  payload: Partial<AmplifyGraphQLConfig>;
};

const AmplifyApiConfigContextState = createContext<AmplifyGraphQLConfig>(DEFAULT_API_CONFIG);
const AmplifyApiConfigContextDispatch = createContext<React.Dispatch<AmplifyApiConfigAction>>(() => {
  throw new Error('AmplifyApiConfigContextDispatch not initialized');
});

function reducer(state: AmplifyGraphQLConfig, action: AmplifyApiConfigAction) {
  switch (action.type) {
    case API_CONFIG_ACTION.UPDATE: {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
}

type AmplifyApiConfigProviderProps = PropsWithChildren<{
  initial?: AmplifyGraphQLConfig;
}>;

/**
 * Context provider for useAmplifyApiConfig
 */
export function AmplifyApiConfigProvider(props: AmplifyApiConfigProviderProps) {
  const { children, initial } = props;
  const [apiConfig, dispatch] = useReducer(reducer, initial || DEFAULT_API_CONFIG);
  return (
    <AmplifyApiConfigContextState.Provider value={apiConfig}>
      <AmplifyApiConfigContextDispatch.Provider value={dispatch}>{children}</AmplifyApiConfigContextDispatch.Provider>
    </AmplifyApiConfigContextState.Provider>
  );
}

/**
 * Use API Config details from the mock server, fetched from `/api-config`
 */
export function useAmplifyApiConfig() {
  const state = useContext(AmplifyApiConfigContextState);
  const dispatch = useContext(AmplifyApiConfigContextDispatch);
  if (state === undefined || dispatch === undefined) {
    throw new Error('useAmplifyApiConfig must be used within a AmplifyApiConfigProvider');
  }
  return [state, dispatch] as const;
}
