'use client';
import dynamic from 'next/dynamic';
import { AmplifyAuthProvider } from '@/plugins/use-amplify-auth';
import { AmplifyApiConfigProvider } from '@/support/use-amplify-api-config';
import { getDefaultAuthProvider } from '@/support/get-default-auth-provider';
import type { EditorProps } from './Editor';
import type { AmplifyGraphQLConfig } from '@/support/types';

const Editor = dynamic(() => import('./Editor'), {
  /** @todo branded splash screen? */
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export type AmplifyGraphiQLProps = {
  apiConfig: AmplifyGraphQLConfig;
} & EditorProps;

export function AmplifyGraphiQL(props: AmplifyGraphiQLProps) {
  return (
    <AmplifyApiConfigProvider initial={props.apiConfig}>
      <AmplifyAuthProvider
        initial={{ provider: getDefaultAuthProvider(props.apiConfig.providers), credentials: props.apiConfig.credentials }}
      >
        <Editor />
      </AmplifyAuthProvider>
    </AmplifyApiConfigProvider>
  );
}

export default AmplifyGraphiQL;
