import { BacklogView } from './features/tasks/components/BacklogView';

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex flex-col">
      <BacklogView />
    </div>
  );
}
