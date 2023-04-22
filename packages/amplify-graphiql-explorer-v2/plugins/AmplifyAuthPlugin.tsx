import { useMemo, useRef } from 'react';
import { useAmplifyAuth } from './use-amplify-auth';
import { AUTH_PROVIDER, AUTH_NAME } from '@/support/constants';
import styles from './AmplifyAuthPlugin.module.css';

export type AmplifyAuthPluginProps = {
  defaultAuthProvider: AmplifyGraphQLAuthProvider;
  additionalAuthProviders: Array<AmplifyGraphQLAuthProvider>;
};

export function AmplifyAuthPlugin(props: AmplifyAuthPluginProps) {
  const { defaultAuthProvider, additionalAuthProviders } = props || {};
  const [amplifyAuth, dispatchAmplifyAuth] = useAmplifyAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const handleOnAuthProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAmplifyAuth({
      type: 'UPDATE',
      payload: {
        provider: event.target.value as AmplifyGraphQLAuthProvider,
      },
    });
  };

  const providers = useMemo(
    () =>
      Object.keys(AUTH_PROVIDER).map((type) => ({
        name: AUTH_NAME[type as keyof typeof AUTH_PROVIDER],
        type: type as AmplifyGraphQLAuthProvider,
        isDefault: type === defaultAuthProvider,
        isEnabled: [defaultAuthProvider, ...additionalAuthProviders].includes(type as AmplifyGraphQLAuthProvider),
      })),
    [additionalAuthProviders, defaultAuthProvider],
  );

  return (
    <section aria-label="Amplify Auth">
      <h2 className={styles.heading}>Amplify Auth</h2>
      <form className={styles.form} ref={formRef}>
        {providers.map(({ name, type, isEnabled }) => (
          <div key={type} className={styles.container}>
            <input
              className={styles.radio}
              checked={amplifyAuth.provider === type}
              disabled={!isEnabled}
              id={type}
              name={'auth-type'}
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
    </section>
  );
}
