import '@mantine/core/styles.css';

import { ColorSchemeScript, Container, MantineProvider, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { Header } from './Header';
import { Providers } from '@/providers';
import { theme } from '@/theme';

export const metadata: Metadata = {
  title: 'Dish Log',
  description: '食べた料理の記録'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja' {...mantineHtmlProps}>
      <head>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no' />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Providers>
            <Container size='sm' px='md'>
              <Header />
              {children}
            </Container>
          </Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
