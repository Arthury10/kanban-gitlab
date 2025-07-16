"use client";

import { useState } from "react";
import ProjectSelector from "@/components/ProjectSelector";
import KanbanBoard from "@/components/KanbanBoard";
import { Project } from "@/lib/gitlabApi";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { selectedProject, setSelectedProject } = useAppStore();

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {selectedProject ? (
        <KanbanBoard
          project={selectedProject}
          onBackToProjects={handleBackToProjects}
        />
      ) : (
        <ProjectSelector onProjectSelect={handleProjectSelect} />
      )}
    </main>
  );
}
