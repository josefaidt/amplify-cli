'use client';
import { useState, useMemo } from 'react';
import { GraphiQL } from 'graphiql';
import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { useAmplifyAuthPlugin } from '@/plugins/graphiql-plugin-amplify-auth';
import { useAmplifyAuth } from '@/plugins/use-amplify-auth';
import { createAmplifyMockApiFetcher } from '@/support/create-amplify-mock-api-fetcher';
import styles from './Editor.module.css';

export type EditorProps = {
  // ...
};

export function Editor(props: EditorProps) {
  const [amplifyAuth] = useAmplifyAuth();
  const [query, setQuery] = useState('');

  const fetcher = useMemo(() => createAmplifyMockApiFetcher(amplifyAuth.provider, amplifyAuth.credentials), [amplifyAuth]);

  // create Amplify auth plugin for GraphiQL
  const amplifyAuthPlugin = useAmplifyAuthPlugin();
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

export default Editor;
