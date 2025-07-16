"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, GitBranch, ExternalLink } from "lucide-react";
import gitlabApi, { Project } from "@/lib/gitlabApi";
import { useAppStore } from "@/lib/store";

interface ProjectSelectorProps {
  onProjectSelect: (project: Project) => void;
}

export default function ProjectSelector({
  onProjectSelect,
}: ProjectSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { projects, setProjects, isLoading, setLoading, error, setError } =
    useAppStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await gitlabApi.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.path_with_namespace
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Carregando projetos...
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadProjects}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Kanban GitLab</h1>
          <p className="text-gray-600 mb-6">
            Selecione um projeto para gerenciar suas issues
          </p>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {project.path_with_namespace}
                      </CardDescription>
                    </div>
                    <GitBranch className="h-5 w-5 text-gray-400 mt-1" />
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {project.description || "Sem descrição"}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => onProjectSelect(project)}
                      className="flex-1 mr-2"
                    >
                      Abrir Kanban
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.web_url, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Badge variant="secondary">
            {filteredProjects.length} projeto(s) encontrado(s)
          </Badge>
        </div>
      </div>
    </div>
  );
}
