import LocalFont from 'next/font/local';
import './globals.css';
import 'graphiql/graphiql.css';
import '@graphiql/plugin-explorer/dist/style.css';

export const metadata = {
  title: 'Amplify Mock API',
  description: 'Mock GraphQL API for Amplify',
};

const AmazonEmber = LocalFont({
  src: [
    {
      path: './fonts/AmazonEmber-light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/AmazonEmber-light-italic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/AmazonEmber-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/AmazonEmber-regular-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/AmazonEmber-semibold.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/AmazonEmber-semibold-italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/AmazonEmber-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/AmazonEmber-bold-italic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={AmazonEmber.className}>
      <body>{children}</body>
    </html>
  );
}
