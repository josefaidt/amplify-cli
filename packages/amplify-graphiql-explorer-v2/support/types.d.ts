import { AUTH_PROVIDER_NAME, AUTH_PROVIDER_TYPE } from './constants';

/**
 * Amplify AppSync simulator authentication configuration
 */
export type AmplifyAppSyncSimulatorAuthConfig = {
  authenticationType: string;
};

/**
 * Amplify AppSync simulator API configuration
 */
export type AmplifyAppSyncSimulatorApiConfig = ReadOnly<{
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
 * Amplify GraphQL API authentication provider type
 */
export type AmplifyGraphQLAuthProviderType = keyof typeof AUTH_PROVIDER_TYPE;

/**
 * Amplify GraphQL API authentication provider display name
 */
export type AmplifyGraphQLAuthProviderName = ValueOf<typeof AUTH_PROVIDER_NAME>;

/**
 * Amplify GraphQL API authentication provider configuration
 */
export type AmplifyGraphQLAuthProviderConfig = {
  type: AmplifyGraphQLAuthProviderType;
  name: AmplifyGraphQLAuthProviderName;
  isDefault: boolean;
  isEnabled: boolean;
};

export type AmplifyGraphQLConfigCredentials = {
  accountId: string;
  accessKeyId?: string;
  apiKey?: string;
  authRoleName: string;
  unauthRoleName: string;
  cognitoJwtToken?: string;
  oidcJwtToken?: string;
};

/**
 * Amplify GraphQL API configuration retrieved from mock server
 */
export type AmplifyGraphQLConfig = {
  /**
   * GraphQL API name
   */
  name: string;
  /**
   * Configured authentication providers
   */
  providers: AmplifyGraphQLAuthProviderConfig[];
  /**
   * Credentials for the GraphQL API
   */
  credentials: AmplifyGraphQLConfigCredentials;
};
