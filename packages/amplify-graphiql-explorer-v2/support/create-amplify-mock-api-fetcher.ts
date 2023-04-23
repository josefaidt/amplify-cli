import { AUTH_PROVIDER_TYPE, DEFAULT_COGNITO_JWT_TOKEN } from '@/support/constants';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import type { Fetcher } from '@graphiql/toolkit';
import type { AmplifyGraphQLAuthProviderType, AmplifyGraphQLConfigCredentials } from './types';

/**
 * Creates a GraphiQL fetcher for the Amplify mock API
 * @param provider Amplify auth provider type
 * @param credentials credentials for auth provider
 * @returns
 */
export function createAmplifyMockApiFetcher(
  provider: AmplifyGraphQLAuthProviderType,
  credentials: AmplifyGraphQLConfigCredentials,
): Fetcher {
  const url = '/api/graphql';
  switch (provider) {
    case AUTH_PROVIDER_TYPE.API_KEY: {
      if (!credentials.apiKey) {
        throw new Error('Missing API key');
      }
      return createGraphiQLFetcher({
        url,
        headers: {
          'x-api-key': credentials.apiKey,
        },
        fetch,
      });
    }
    case AUTH_PROVIDER_TYPE.AMAZON_COGNITO_USER_POOLS: {
      return createGraphiQLFetcher({
        url,
        headers: {
          Authorization: `Bearer ${DEFAULT_COGNITO_JWT_TOKEN}`,
        },
        fetch,
      });
    }
    /** @todo OIDC and IAM */
    case AUTH_PROVIDER_TYPE.OPENID_CONNECT:
    case AUTH_PROVIDER_TYPE.AWS_IAM:
    default: {
      throw new Error('Unsupported default authentication type');
    }
  }
}
