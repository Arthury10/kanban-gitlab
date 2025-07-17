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
import Link from "next/link";

export default function ProjectSelector() {
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
            Carregando projetos...
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                  <div className="h-7 sm:h-8 bg-gray-200 rounded"></div>
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-red-600">Erro</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{error}</p>
          <Button onClick={loadProjects} className="h-9 sm:h-10 text-sm sm:text-base">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Kanban GitLab</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Selecione um projeto para gerenciar suas issues
          </p>

          <div className="relative max-w-sm sm:max-w-md mx-auto">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-500 truncate">
                        {project.path_with_namespace}
                      </CardDescription>
                    </div>
                    <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {project.description || "Sem descrição"}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link href={`/project/${project.id}`} className="flex-1">
                      <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm cursor-pointer">
                        Abrir Kanban
                      </Button>
                    </Link>

                    <Button
                      className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 p-0"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.web_url, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:mt-8">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {filteredProjects.length} projeto(s) encontrado(s)
          </Badge>
        </div>
      </div>
    </div>
  );
}
