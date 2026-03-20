Error reading file /app/repoinfo.md: [Errno 2] No such file or directory: '/app/repoinfo.md'
Directory Structure:
```
.
├── next.config.js
├── package.json
└── src
    └── app
        ├── layout.tsx
        └── page.tsx

```

---
File: package.json
---
{
  "name": "nextjs-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "NODE_OPTIONS='--inspect' next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check --write --unsafe ./src && npx tsc --noEmit",
    "serve": "python -m http.server -d out",
    "node-server": "node server.js",
    "plop": "plop"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1013.0",
    "@aws-sdk/s3-request-presigner": "^3.1013.0",
    "@biomejs/biome": "^2.4.8",
    "@mantine/core": "^8.3.18",
    "@mantine/dates": "^8.3.18",
    "@mantine/form": "^8.3.18",
    "@mantine/hooks": "^8.3.18",
    "@tabler/icons-react": "^3.40.0",
    "@tanstack/react-query": "5.91.3",
    "@types/node": "25.5.0",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@types/uuid": "^10.0.0",
    "bun": "^1.3.11",
    "dayjs": "^1.11.20",
    "firebase-admin": "^13.7.0",
    "next": "16.2.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "sharp": "^0.34.5",
    "tsx": "^4.21.0",
    "typescript": "5.2.2",
    "uuid": "^13.0.0",
    "zod": "^4.3.6"
  }
}

---
File: next.config.js
---
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // basePath: process.env.GITHUB_ACTIONS && 'nextjs-template',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  // github pagesの場合
  // output: 'export',
  // k8sの場合
  output: 'standalone',
  allowedDevOrigins: ['192.168.16.12']
};

module.exports = nextConfig;

---
File: src/app/layout.tsx
---
import '@mantine/core/styles.css';

import { ColorSchemeScript, Container, MantineProvider, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { Providers } from '@/providers';
import { theme } from '@/theme';
import { Header } from './Header';

export const metadata: Metadata = {
  title: 'ごはんログ',
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

---
File: src/app/page.tsx
---
import { MealList } from '@/features/MealList/MealList';

export default function Page() {
  return <MealList />;
}

