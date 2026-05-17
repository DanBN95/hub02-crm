import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import App from './App';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe('App', () => {
  it('renders the sidebar nav and defaults to Tasks view', () => {
    render(<App />, { wrapper });
    expect(screen.getByRole('button', { name: 'Sprints' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Documents' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeTruthy();
  });
});
