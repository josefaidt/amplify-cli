import { AmplifyGraphiQL } from './AmplifyGraphiQL';
import { AUTH_PROVIDER } from '@/support/constants';
import styles from './page.module.css';

function transformConfig(config: AmplifyAppSyncSimulatorApiConfig): AmplifyGraphQLConfig {
  const {
    name,
    defaultAuthenticationType,
    additionalAuthenticationProviders,
    apiKey,
    authAccessKeyId,
    authRoleName,
    unauthRoleName,
    accountId,
  } = config;

  return {
    name,
    providers: Object.keys(AUTH_PROVIDER).map((name) => {
      const isEnabled = [
        defaultAuthenticationType.authenticationType,
        ...additionalAuthenticationProviders.map((provider: { authenticationType: string }) => provider.authenticationType),
      ].includes(name);
      return {
        name: name as AmplifyGraphQLAuthProvider,
        isDefault: name === defaultAuthenticationType.authenticationType,
        isEnabled,
      };
    }),
    credentials: {
      accessKeyId: authAccessKeyId,
      accountId,
      apiKey,
      authRoleName,
      unauthRoleName,
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
    throw new Error(`Failed to fetch API Info: ${response.status} ${response.statusText}`);
  }
  // const config = await response.json();
  // return transformConfig(config);
  return response.json();
}

export default async function Home() {
  const apiConfig = await getApiConfig();
  return (
    <main className={styles.main}>
      <AmplifyGraphiQL apiConfig={apiConfig} />
    </main>
  );
}
