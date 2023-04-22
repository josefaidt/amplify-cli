'use client';
import { useState } from 'react';
import { GraphiQL } from 'graphiql';
import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { useAmplifyAuthPlugin } from '@/plugins/graphiql-plugin-amplify-auth';
import { useAmplifyAuth } from '@/plugins/use-amplify-auth';
import { createAmplifyMockApiFetcher } from '@/support/create-amplify-mock-api-fetcher';
import { useAmplifyApiConfig } from '@/support/use-amplify-api-config';
import styles from './Editor.module.css';

export type EditorProps = {
  // ...
};

export function Editor(props: EditorProps) {
  const [amplifyApiConfig] = useAmplifyApiConfig();
  const [amplifyAuth] = useAmplifyAuth();
  const [query, setQuery] = useState('');

  const fetcher = createAmplifyMockApiFetcher(amplifyApiConfig.defaultAuthenticationType.authenticationType, amplifyApiConfig.apiKey);

  // create Amplify auth plugin for GraphiQL
  const amplifyAuthPlugin = useAmplifyAuthPlugin({
    defaultAuthProvider: amplifyApiConfig.defaultAuthenticationType.authenticationType,
    additionalAuthProviders: amplifyApiConfig.additionalAuthenticationProviders.map((provider) => provider.authenticationType),
  });
  // create Explorer plugin for GraphiQL
  const explorerPlugin = useExplorerPlugin({
    query,
    onEdit: setQuery,
    showAttribution: false,
  });

  return (
    <div className={styles.editor}>
      <GraphiQL fetcher={fetcher} onEditQuery={setQuery} plugins={[explorerPlugin, amplifyAuthPlugin]} query={query} />
    </div>
  );
}
