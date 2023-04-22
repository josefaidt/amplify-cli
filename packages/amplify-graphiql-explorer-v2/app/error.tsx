'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import AmplifyLogo from './amplify-logo.svg';
import styles from './error.module.css';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className={styles.main}>
      <Image src={AmplifyLogo} alt="Amplify Logo" width={100} height={100} />
      <h2>Something went wrong!</h2>
      <div className={styles.content}>
        <pre className={styles.message}>
          <code>{JSON.stringify(error.message, null, 2)}</code>
        </pre>
        <p>
          Report this error to{' '}
          <a href="https://github.com/aws-amplify/amplify/cli" target="_blank" rel="noopener noreferrer">
            amplify-cli
          </a>
        </p>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </button>
      </div>
    </main>
  );
}
