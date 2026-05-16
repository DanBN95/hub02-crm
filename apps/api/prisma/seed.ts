import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@hub02.io' },
    update: {},
    create: { email: 'demo@hub02.io', name: 'Demo User' },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'hub02' },
    update: {},
    create: { name: 'Hub02', slug: 'hub02' },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: user.id, role: 'owner' },
  });

  const sprint = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-1' },
    update: {},
    create: {
      id: 'seed-sprint-1',
      workspaceId: workspace.id,
      name: 'Sprint 1',
      goal: 'Ship CRM skeleton',
      isActive: true,
    },
  });

  const tasks: { title: string; priority: Priority; status: Status }[] = [
    { title: 'Set up monorepo', priority: Priority.P0, status: Status.DONE },
    { title: 'Design system tokens', priority: Priority.P1, status: Status.IN_REVIEW },
    { title: 'Task CRUD API', priority: Priority.P1, status: Status.IN_PROGRESS },
    { title: 'Backlog view', priority: Priority.P2, status: Status.TODO },
    { title: 'Sprint board', priority: Priority.P2, status: Status.BACKLOG },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t) continue;
    await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        sprintId: sprint.id,
        assigneeId: user.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        position: i,
      },
    });
  }

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
