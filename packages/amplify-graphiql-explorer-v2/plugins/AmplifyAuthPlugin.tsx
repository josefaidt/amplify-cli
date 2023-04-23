import { useRef } from 'react';
import { useAmplifyAuth } from './use-amplify-auth';
import styles from './AmplifyAuthPlugin.module.css';
import type { AmplifyGraphQLAuthProviderConfig, AmplifyGraphQLAuthProviderType } from '@/support/types';

export type AmplifyAuthPluginProps = {
  providers: AmplifyGraphQLAuthProviderConfig[];
};

export function AmplifyAuthPlugin(props: AmplifyAuthPluginProps) {
  const { providers } = props || {};
  const [amplifyAuth, dispatchAmplifyAuth] = useAmplifyAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const handleOnAuthProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAmplifyAuth({
      type: 'UPDATE',
      payload: {
        provider: event.target.value as AmplifyGraphQLAuthProviderType,
      },
    });
  };

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
