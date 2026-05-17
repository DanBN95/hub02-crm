import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import App from './App';

vi.mock('./lib/auth', () => ({
  authApi: {
    me: vi.fn().mockResolvedValue({ id: 'u1', email: 'demo@hub02.io', name: 'Demo', avatarUrl: null }),
    devLogin: vi.fn().mockResolvedValue({ ok: true, userId: 'u1' }),
  },
}));

vi.mock('./lib/workspaces', () => ({
  workspacesApi: {
    list: vi.fn().mockResolvedValue([{ id: 'ws1', name: 'Hub02', slug: 'hub02' }]),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe('App', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the sidebar nav and defaults to Tasks view after workspace loads', async () => {
    render(<App />, { wrapper });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sprints' })).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Documents' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeTruthy();
  });
});
