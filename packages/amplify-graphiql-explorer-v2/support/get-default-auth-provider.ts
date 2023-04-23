import type { AmplifyGraphQLAuthProviderConfig } from './types';

/**
 * Get the default authentication provider from the list of authentication providers
 */
export function getDefaultAuthProvider(providers: AmplifyGraphQLAuthProviderConfig[]) {
  const defaultProvider = providers.find((provider) => provider.isDefault);
  if (!defaultProvider) {
    throw new Error('No default authentication provider');
  }
  return defaultProvider;
}
