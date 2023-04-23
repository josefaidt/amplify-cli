'use client';
import { AmplifyAuthProvider } from '@/plugins/use-amplify-auth';
import { AmplifyApiConfigProvider } from '@/support/use-amplify-api-config';
import { Editor } from './Editor';
import type { EditorProps } from './Editor';
import type { AmplifyGraphQLConfig } from '@/support/types';

export type AmplifyGraphiQLProps = {
  apiConfig: AmplifyGraphQLConfig;
} & EditorProps;

export function AmplifyGraphiQL(props: AmplifyGraphiQLProps) {
  return (
    <AmplifyApiConfigProvider initial={props.apiConfig}>
      <AmplifyAuthProvider>
        <Editor />
      </AmplifyAuthProvider>
    </AmplifyApiConfigProvider>
  );
}
