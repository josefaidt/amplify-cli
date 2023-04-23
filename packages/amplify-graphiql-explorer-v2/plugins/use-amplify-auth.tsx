import { createContext, useContext, useEffect, useReducer } from 'react';
import { DEFAULT_API_CONFIG } from '@/support/constants';
import { getDefaultAuthProvider } from '@/support/get-default-auth-provider';
import type { PropsWithChildren } from 'react';
import type { AmplifyGraphQLAuthProviderType, AmplifyGraphQLConfigCredentials } from '@/support/types';

export const AMPLIFY_AUTH_ACTION = {
  UPDATE: 'UPDATE',
  UPDATE_PROVIDER: 'UPDATE_PROVIDER',
  UPDATE_CREDENTIALS: 'UPDATE_CREDENTIALS',
} as const;

type AmplifyAuthAction =
  | {
      type: typeof AMPLIFY_AUTH_ACTION.UPDATE;
      payload: Partial<AmplifyGraphQLAuthState>;
    }
  | {
      type: typeof AMPLIFY_AUTH_ACTION.UPDATE_PROVIDER;
      payload: AmplifyGraphQLAuthProviderType;
    }
  | {
      type: typeof AMPLIFY_AUTH_ACTION.UPDATE_CREDENTIALS;
      payload: Partial<AmplifyGraphQLConfigCredentials>;
    };

type AmplifyGraphQLAuthState = {
  provider: AmplifyGraphQLAuthProviderType;
  credentials: AmplifyGraphQLConfigCredentials;
};

const DEFAULT_AUTH_STATE: AmplifyGraphQLAuthState = {
  provider: getDefaultAuthProvider(DEFAULT_API_CONFIG.providers).type,
  credentials: DEFAULT_API_CONFIG.credentials,
};

const AmplifyAuthContextState = createContext<AmplifyGraphQLAuthState>(DEFAULT_AUTH_STATE);
const AmplifyAuthContextDispatch = createContext<React.Dispatch<AmplifyAuthAction>>(() => {
  throw new Error('AmplifyAuthContextDispatch not initialized');
});

function reducer(state: AmplifyGraphQLAuthState, action: AmplifyAuthAction): AmplifyGraphQLAuthState {
  switch (action.type) {
    case AMPLIFY_AUTH_ACTION.UPDATE: {
      return { ...state, ...action.payload };
    }
    case AMPLIFY_AUTH_ACTION.UPDATE_PROVIDER: {
      return { ...state, provider: action.payload };
    }
    case AMPLIFY_AUTH_ACTION.UPDATE_CREDENTIALS: {
      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...action.payload,
        },
      };
    }
    default: {
      throw new Error(`Unhandled action`);
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
  useEffect(() => {
    console.log({ auth });
  }, [auth]);
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
