'use client';
import { AmplifyAuthProvider } from '@/plugins/use-amplify-auth';
import { AmplifyApiConfigProvider } from '@/support/use-amplify-api-config';
import { Editor } from './Editor';
import type { EditorProps } from './Editor';

export type AmplifyGraphiQLProps = {
  apiConfig: AmplifyAppSyncSimulatorApiConfig;
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
