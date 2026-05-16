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
  it('renders the backlog view', () => {
    render(<App />, { wrapper });
    expect(screen.getByText('Backlog')).toBeTruthy();
    expect(screen.getByText('+ New task')).toBeTruthy();
  });
});
