import '../styles/global.css';
import { Provider } from '../components/provider';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
