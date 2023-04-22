import { PropsWithChildren, createContext, useContext, useReducer } from 'react';
import { DEFAULT_API_CONFIG } from '@/support/constants';

export const AMPLIFY_AUTH_ACTION = {
  UPDATE: 'UPDATE',
} as const;

type AmplifyAuthAction = {
  type: typeof AMPLIFY_AUTH_ACTION.UPDATE;
  payload: Partial<AmplifyGraphQLAuthState>;
};

type AmplifyGraphQLAuthState = {
  provider: AmplifyGraphQLAuthProvider;
  credentials: unknown;
};

const DEFAULT_AUTH_STATE: AmplifyGraphQLAuthState = {
  provider: DEFAULT_API_CONFIG.defaultAuthenticationType.authenticationType,
  credentials: DEFAULT_API_CONFIG.defaultAuthenticationType.apiKey,
};

const AmplifyAuthContextState = createContext<AmplifyGraphQLAuthState>(DEFAULT_AUTH_STATE);
const AmplifyAuthContextDispatch = createContext<React.Dispatch<AmplifyAuthAction>>(() => {
  throw new Error('AmplifyAuthContextDispatch not initialized');
});

function reducer(state: AmplifyGraphQLAuthState, action: AmplifyAuthAction) {
  switch (action.type) {
    case AMPLIFY_AUTH_ACTION.UPDATE: {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
}

type AmplifyAuthProviderProps = PropsWithChildren<{
  initial?: AmplifyGraphQLAuthState;
}>;

/**
 * Context provider for useAmplifyAuth
 */
export function AmplifyAuthProvider(props: AmplifyAuthProviderProps) {
  const { children, initial } = props;
  const [auth, dispatch] = useReducer(reducer, initial || DEFAULT_AUTH_STATE);
  return (
    <AmplifyAuthContextState.Provider value={auth}>
      <AmplifyAuthContextDispatch.Provider value={dispatch}>{children}</AmplifyAuthContextDispatch.Provider>
    </AmplifyAuthContextState.Provider>
  );
}

/**
 * Use API Config details from the mock server, fetched from `/api-config`
 */
export function useAmplifyAuth() {
  const state = useContext(AmplifyAuthContextState);
  const dispatch = useContext(AmplifyAuthContextDispatch);
  if (state === undefined || dispatch === undefined) {
    throw new Error('useAmplifyAuth must be used within a AmplifyAuthProvider');
  }
  return [state, dispatch] as const;
}
