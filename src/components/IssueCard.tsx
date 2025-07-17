"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  ArrowRight,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import { Issue } from "@/lib/gitlabApi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onDelete: (issueIid: number) => void;
  onMove?: (issueIid: number, newStatus: string) => void;
  onReopen?: (issueIid: number) => void;
  isDone?: boolean;
}

export default function IssueCard({
  issue,
  onEdit,
  onDelete,
  onMove,
  onReopen,
  isDone = false,
}: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `issue-${issue.iid}`,
    data: {
      type: "issue",
      issue,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = () => {
    if (isDone) return "bg-green-100 border-green-200";
    if (
      issue.labels.some((label) =>
        ["doing", "in progress"].includes(label.toLowerCase())
      )
    ) {
      return "bg-blue-100 border-blue-200";
    }
    if (
      issue.labels.some((label) =>
        ["review", "testing"].includes(label.toLowerCase())
      )
    ) {
      return "bg-yellow-100 border-yellow-200";
    }
    return "bg-gray-50 border-gray-200";
  };

  const getMoveOptions = () => {
    if (isDone) {
      return [{ label: "Reabrir", value: "reopen", icon: RotateCcw }];
    }

    const currentLabels = issue.labels.map((l) => l.toLowerCase());
    const options = [];

    if (
      !currentLabels.includes("doing") &&
      !currentLabels.includes("in progress")
    ) {
      options.push({
        label: "Mover para Doing",
        value: "doing",
        icon: ArrowRight,
      });
    }
    if (
      !currentLabels.includes("review") &&
      !currentLabels.includes("testing")
    ) {
      options.push({
        label: "Mover para Review",
        value: "review",
        icon: ArrowRight,
      });
    }
    if (!currentLabels.some((l) => ["todo"].includes(l))) {
      options.push({
        label: "Mover para To Do",
        value: "todo",
        icon: ArrowRight,
      });
    }

    return options;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:shadow-md transition-shadow max-w-full text-xs sm:text-sm",
        getStatusColor(),
        isDragging && "opacity-50 rotate-3 shadow-xl"
      )}
    >
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-1 sm:gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
            </Button>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs sm:text-sm mb-1 line-clamp-2">
                {issue.title}
              </h4>
              <p className="text-xs text-gray-500">#{issue.iid}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(issue)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>

              {onMove &&
                getMoveOptions().map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      if (option.value === "reopen" && onReopen) {
                        onReopen(issue.iid);
                      } else if (onMove) {
                        onMove(issue.iid, option.value);
                      }
                    }}
                  >
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                ))}

              <DropdownMenuItem
                onClick={() => onDelete(issue.iid)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDone ? "Deletar" : "Fechar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 p-3 sm:p-4">
        {issue.description && (
          <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2">
            {issue.description}
          </p>
        )}

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {issue.labels.slice(0, 2).map((label, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1 py-0"
              >
                {label}
              </Badge>
            ))}
            {issue.labels.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{issue.labels.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center min-w-0 flex-1">
            {issue.author.avatar_url && (
              <img
                src={issue.author.avatar_url}
                alt={issue.author.name}
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-1 flex-shrink-0"
              />
            )}
            <span className="truncate text-xs">{issue.author.username}</span>
          </div>
          <span className="text-xs ml-2 flex-shrink-0">
            {formatDate(issue.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
