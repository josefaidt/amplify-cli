import { useRef } from 'react';
import { CREDENTIAL_NAMES } from '@/support/constants';
import { useAmplifyAuth } from './use-amplify-auth';
import styles from './AmplifyAuthPlugin.module.css';
import type { AmplifyGraphQLAuthProviderConfig, AmplifyGraphQLAuthProviderType, AmplifyGraphQLConfigCredentials } from '@/support/types';

export type AmplifyAuthPluginProps = {
  providers: AmplifyGraphQLAuthProviderConfig[];
  credentials: AmplifyGraphQLConfigCredentials;
};

export function AmplifyAuthPlugin(props: AmplifyAuthPluginProps) {
  const { providers, credentials } = props;
  const [amplifyAuth, dispatchAmplifyAuth] = useAmplifyAuth();
  const formAuthProviderRef = useRef<HTMLFormElement>(null);
  const formAuthCredentialsRef = useRef<HTMLFormElement>(null);

  const handleOnAuthProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAmplifyAuth({
      type: 'UPDATE_PROVIDER',
      payload: event.target.value as AmplifyGraphQLAuthProviderType,
    });
  };

  const handleOnAuthCredentialsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = Object.fromEntries(formData.entries()) as AmplifyGraphQLConfigCredentials;
    dispatchAmplifyAuth({
      type: 'UPDATE_CREDENTIALS',
      payload: credentials,
    });
  };

  return (
    <section className={styles.section} aria-label="Amplify Auth">
      <h2 className={styles.heading}>Amplify Auth</h2>
      {/* <p>
        Here you can find settings related to your GraphQL API, and modify as you see fit for testing purposes. Please note the credentials
        supplied here will not impact the credentials used by your frontend application during local testing.
      </p> */}
      <form className={styles.form} ref={formAuthProviderRef}>
        {/* <h3>Choose an active authentication provider</h3> */}
        {providers.map(({ name, type, isEnabled }) => (
          <div key={type} className={styles.container}>
            <input
              className={styles.radio}
              checked={amplifyAuth.provider === type}
              disabled={!isEnabled}
              id={type}
              name={'provider'}
              onChange={handleOnAuthProviderChange}
              type="radio"
              value={type}
            />
            <label htmlFor={type} className={styles.label}>
              {name}
            </label>
          </div>
        ))}
      </form>
      <hr className={styles.hr} />
      <form className={styles.form} ref={formAuthCredentialsRef} onSubmit={handleOnAuthCredentialsSubmit}>
        <h3>Credentials</h3>
        {Object.entries(credentials).map(([key, value]) => (
          <div key={key} className={styles.credentials}>
            <label htmlFor={key} className={styles.label}>
              {CREDENTIAL_NAMES[key as keyof AmplifyGraphQLConfigCredentials]}
            </label>
            <input id={key} type="text" name={key} placeholder={value} autoComplete="off" />
          </div>
        ))}
        <button type="submit" className={styles.submit}>
          Submit
        </button>
      </form>
    </section>
  );
}
