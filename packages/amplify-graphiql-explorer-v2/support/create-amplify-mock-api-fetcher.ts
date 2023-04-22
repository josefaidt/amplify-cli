import { AUTH_PROVIDER, DEFAULT_COGNITO_JWT_TOKEN } from '@/support/constants';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import type { Fetcher } from '@graphiql/toolkit';

/**
 * Creates a GraphiQL fetcher for the Amplify mock API
 * @param provider Amplify auth provider
 * @param credentials credentials for auth provider
 * @returns
 */
export function createAmplifyMockApiFetcher(provider: AmplifyGraphQLAuthProvider, credentials: unknown): Fetcher {
  const url = '/api/graphql';
  switch (provider) {
    case AUTH_PROVIDER.API_KEY: {
      console.log('made it here!');
      return createGraphiQLFetcher({
        url,
        headers: {
          'x-api-key': credentials as string,
        },
        fetch,
      });
    }
    case AUTH_PROVIDER.AMAZON_COGNITO_USER_POOLS: {
      return createGraphiQLFetcher({
        url,
        headers: {
          Authorization: `Bearer ${DEFAULT_COGNITO_JWT_TOKEN}`,
        },
        fetch,
      });
    }
    /** @todo OIDC and IAM */
    case AUTH_PROVIDER.OPENID_CONNECT:
    case AUTH_PROVIDER.AWS_IAM:
    default: {
      throw new Error('Unsupported default authentication type');
    }
  }
}
