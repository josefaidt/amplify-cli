import type { AmplifyGraphQLConfig } from './types';

// eslint-disable-next-line spellcheck/spell-checker
export const DEFAULT_COGNITO_JWT_TOKEN = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZDhjYTUyOC00OTMxLTQyNTQtOTI3My1lYTVlZTg1M2YyNzEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS91cy1lYXN0LTFfZmFrZSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6InVzZXIxIiwiYXVkIjoiMmhpZmEwOTZiM2EyNG12bTNwaHNrdWFxaTMiLCJldmVudF9pZCI6ImIxMmEzZTJmLTdhMzYtNDkzYy04NWIzLTIwZDgxOGJkNzhhMSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxOTc0MjY0NDEyLCJwaG9uZV9udW1iZXIiOiIrMTIwNjIwNjIwMTYiLCJleHAiOjE1NjQyNjgwMTIsImlhdCI6MTU2NDI2NDQxMywiZW1haWwiOiJ1c2VyQGRvbWFpbi5jb20ifQ.wHKY2KIhvWn4zpJ4TZ1vS3zRE9mGWsLY4NCV2Cof17Q`;

// eslint-disable-next-line spellcheck/spell-checker
export const DEFAULT_OIDC_JWT_TOKEN = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL3NvbWUtb2lkYy1wcm92aWRlci9hdXRoIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJhdWQiOiIyaGlmYTA5NmIzYTI0bXZtM3Boc2t1YXFpMyIsImV2ZW50X2lkIjoiYjEyYTNlMmYtN2EzNi00OTNjLTg1YjMtMjBkODE4YmQ3OGExIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE5NzQyNjQ0MTIsInBob25lX251bWJlciI6IisxMjA2MjA2MjAxNiIsImV4cCI6MTU2NDI2ODAxMiwiaWF0IjoxNTY0MjY0NDEzLCJlbWFpbCI6InVzZXJAZG9tYWluLmNvbSJ9.uAegFXomOnA7Dkl-5FcS5icu5kL9Juqb81GnTrOZZqM`;

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
 * Amplify GraphQL API authentication provider names
 * @example 'Amazon Cognito User Pools'
 */
export const AUTH_PROVIDER_NAME = {
  AMAZON_COGNITO_USER_POOLS: 'Amazon Cognito User Pools',
  API_KEY: 'API Key',
  OPENID_CONNECT: 'OpenID Connect',
  AWS_IAM: 'IAM',
} as const;

export const DEFAULT_API_CONFIG: Readonly<AmplifyGraphQLConfig> = {
  name: 'AmplifyGraphQLApi',
  providers: [
    {
      type: 'API_KEY',
      name: 'API Key',
      isDefault: true,
      isEnabled: true,
    },
  ],
  credentials: {
    accountId: '123456789012',
    accessKeyId: 'fakeAccessKeyId',
    apiKey: 'da2-fakeApiId123456',
    authRoleName: 'fakeAuthRoleName',
    unauthRoleName: 'fakeUnauthRoleName',
    cognitoJwtToken: DEFAULT_COGNITO_JWT_TOKEN,
    oidcJwtToken: DEFAULT_OIDC_JWT_TOKEN,
  },
};

export const LOCAL_STORAGE_KEY_NAMES = {
  COGNITO_TOKEN: 'AMPLIFY_MOCK_API_COGNITO_JWT_TOKEN',
  OIDC_TOKEN: 'AMPLIFY_MOCK_API_OIDC_JWT_TOKEN',
  API_KEY: 'AMPLIFY_MOCK_API_API_KEY',
  IAM: 'AMPLIFY_MOCK_API_AWS_IAM',
  IAM_ROLE: 'AMPLIFY_MOCK_API_AWS_IAM_ROLE',
} as const;
