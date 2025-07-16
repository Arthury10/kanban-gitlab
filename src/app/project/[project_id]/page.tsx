import KanbanBoard from "@/components/KanbanBoard";
import gitlabApi from "@/lib/gitlabApi";

interface ProjectPageProps {
  params: Promise<{ project_id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const projectId = (await params).project_id;

  const project = await gitlabApi.getProject(projectId);

  return (
    <main className="min-h-screen bg-gray-50">
      <KanbanBoard project={project} />
    </main>
  );
}
