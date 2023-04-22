const AUTH_PROVIDER = {
  AMAZON_COGNITO_USER_POOLS: 'AMAZON_COGNITO_USER_POOLS',
  API_KEY: 'API_KEY',
  OPENID_CONNECT: 'OPENID_CONNECT',
  AWS_IAM: 'AWS_IAM',
} as const;

type AmplifyGraphQLAuthProvider = keyof typeof AUTH_PROVIDER;

type AmplifyAppSyncSimulatorAuthConfig = {
  authenticationType: string;
};

type AmplifyAppSyncSimulatorApiConfig = ReadOnly<{
  name: string;
  defaultAuthenticationType: AmplifyAppSyncSimulatorAuthConfig;
  apiKey: string;
  additionalAuthenticationProviders: AmplifyAppSyncSimulatorAuthConfig[];
  authAccessKeyId?: string;
  authRoleName: string;
  unauthRoleName: string;
  accountId: string;
}>;

/**
 * @todo transform api-config and absorb into this new type
 */
type AmplifyGraphQLAuthProviderConfig = {
  name: AmplifyGraphQLAuthProvider;
  isDefault: boolean;
  isEnabled: boolean;
};

/**
 * @todo transform api-config and absorb into this new type
 */
type AmplifyGraphQLConfig = {
  /**
   * Api name
   */
  name: string;
  /**
   * Configured auth providers
   */
  providers: AmplifyGraphQLAuthProviderConfig[];
  /**
   * Fake credentials for the API
   */
  credentials: {
    accountId: string;
    accessKeyId?: string;
    apiKey?: string;
    authRoleName: string;
    unauthRoleName: string;
  };
};
