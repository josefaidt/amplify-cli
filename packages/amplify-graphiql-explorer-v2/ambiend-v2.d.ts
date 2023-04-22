/**
 * TypeScript helper to retrieve the values of a Record
 */
type ValueOf<T> = T[keyof T];

/**
 * Amplify GraphQL API authentication provider types
 * @example 'AMAZON_COGNITO_USER_POOLS'
 */
export const AUTH_PROVIDER_TYPE = {
  AMAZON_COGNITO_USER_POOLS: 'AMAZON_COGNITO_USER_POOLS',
  API_KEY: 'API_KEY',
  OPENID_CONNECT: 'OPENID_CONNECT',
  AWS_IAM: 'AWS_IAM',
} as const;

/**
 * Amplify GraphQL API authentication provider type
 */
type AmplifyGraphQLAuthProviderType = keyof typeof AUTH_PROVIDER_TYPE;

/**
 * Amplify GraphQL API authentication provider names
 * @example 'Amazon Cognito User Pools'
 */
export const AUTH_PROVIDER_NAME = {
  AMAZON_COGNITO_USER_POOLS: 'Amazon Cognito User Pools',
  API_KEY: 'API Key',
  OPENID_CONNECT: 'OpenID Connect',
  AWS_IAM: 'IAM',
} as const;

/**
 * Amplify GraphQL API authentication provider display name
 */
type AmplifyGraphQLAuthProviderName = ValueOf<typeof AUTH_PROVIDER_NAME>;

/**
 * Amplify GraphQL API authentication provider configuration
 */
type AmplifyGraphQLAuthProviderConfig = {
  type: AmplifyGraphQLAuthProviderType;
  name: AmplifyGraphQLAuthProviderName;
  isDefault: boolean;
  isEnabled: boolean;
};

/**
 * Amplify GraphQL API configuration retrieved from mock server
 */
type AmplifyGraphQLConfig = {
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
  credentials: {
    accountId: string;
    accessKeyId?: string;
    apiKey?: string;
    authRoleName: string;
    unauthRoleName: string;
  };
};
