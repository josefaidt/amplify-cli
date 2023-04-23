import AmplifyGraphiQL from './AmplifyGraphiQL';
import { AUTH_PROVIDER_TYPE, AUTH_PROVIDER_NAME, DEFAULT_API_CONFIG } from '@/support/constants';
import styles from './page.module.css';
import type { AmplifyAppSyncSimulatorApiConfig, AmplifyGraphQLConfig, AmplifyGraphQLAuthProviderType } from '@/support/types';

function transformConfig(config: AmplifyAppSyncSimulatorApiConfig): AmplifyGraphQLConfig {
  const {
    name,
    defaultAuthenticationType,
    additionalAuthenticationProviders,
    apiKey,
    authAccessKeyId,
    authRoleName,
    unAuthRoleName,
    accountId,
  } = config;

  return {
    name,
    providers: Object.keys(AUTH_PROVIDER_TYPE).map((type) => {
      const isEnabled = [
        defaultAuthenticationType.authenticationType,
        ...additionalAuthenticationProviders.map((provider: { authenticationType: string }) => provider.authenticationType),
      ].includes(type);
      return {
        /** @todo remove typecasting in favor of proper typing */
        type: type as AmplifyGraphQLAuthProviderType,
        /** @todo remove typecasting in favor of proper typing */
        name: AUTH_PROVIDER_NAME[type as keyof typeof AUTH_PROVIDER_TYPE],
        isDefault: type === defaultAuthenticationType.authenticationType,
        isEnabled,
      };
    }),
    credentials: {
      ...DEFAULT_API_CONFIG.credentials,
      accessKeyId: authAccessKeyId,
      accountId,
      apiKey,
      authRoleName,
      unauthRoleName: unAuthRoleName,
    },
  };
}

/**
 * Get API configuration from the mock server
 */
async function getApiConfig(): Promise<AmplifyGraphQLConfig> {
  const response = await fetch(`${process.env.MOCK_HOST}/api-config`);
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch API config: ${response.status} ${response.statusText}`);
  }
  const config = await response.json();
  return transformConfig(config);
}

export default async function Home() {
  const apiConfig = await getApiConfig();
  return (
    <main className={styles.main}>
      <AmplifyGraphiQL apiConfig={apiConfig} />
    </main>
  );
}
