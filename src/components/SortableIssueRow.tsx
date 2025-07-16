"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import { Issue } from "@/lib/gitlabApi";
import { cn } from "@/lib/utils";

interface SortableIssueRowProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onDelete: (issueIid: number) => void;
}

export default function SortableIssueRow({
  issue,
  onEdit,
  onDelete,
}: SortableIssueRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `issue-row-${issue.iid}`,
    data: {
      type: "issue-row",
      issue,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (issue: Issue) => {
    if (issue.state === "closed") {
      return <Badge variant="secondary">Fechada</Badge>;
    }

    const labels = issue.labels.map((l) => l.toLowerCase());
    if (labels.some((l) => ["doing", "in progress"].includes(l))) {
      return (
        <Badge variant="default" className="bg-blue-500">
          Em Progresso
        </Badge>
      );
    }
    if (labels.some((l) => ["review", "testing"].includes(l))) {
      return (
        <Badge variant="default" className="bg-yellow-500">
          Em Review
        </Badge>
      );
    }

    return <Badge variant="outline">Aberta</Badge>;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:shadow-md transition-shadow",
        isDragging && "opacity-50 rotate-1 shadow-xl"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing mt-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-lg truncate">{issue.title}</h3>
                <span className="text-sm text-gray-500 flex-shrink-0">
                  #{issue.iid}
                </span>
                {getStatusBadge(issue)}
              </div>

              {issue.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {issue.description}
                </p>
              )}

              {issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {issue.labels.map((label, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center">
                  {issue.author.avatar_url && (
                    <img
                      src={issue.author.avatar_url}
                      alt={issue.author.name}
                      className="w-4 h-4 rounded-full mr-1"
                    />
                  )}
                  <span>{issue.author.name}</span>
                </div>
                <span>Criada em {formatDate(issue.created_at)}</span>
                {issue.updated_at !== issue.created_at && (
                  <span>Atualizada em {formatDate(issue.updated_at)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(issue.web_url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(issue)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(issue.iid)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {issue.state === "closed" ? "Deletar" : "Fechar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
