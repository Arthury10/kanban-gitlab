"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Issue } from "@/lib/gitlabApi";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableIssueRow from "./SortableIssueRow";

interface IssueListProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (issueIid: number) => void;
}

export default function IssueList({
  issues,
  onEdit,
  onDelete,
}: IssueListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("manual");
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [orderedIssues, setOrderedIssues] = useState<Issue[]>(issues);

  // Update ordered issues when props change
  useEffect(() => {
    setOrderedIssues(issues);
  }, [issues]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issueId = active.id.toString().replace("issue-row-", "");
    const issue = issues.find((i) => i.iid.toString() === issueId);
    setActiveIssue(issue || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id.toString().replace("issue-row-", "");
    const overId = over.id.toString().replace("issue-row-", "");

    setOrderedIssues((issues) => {
      const activeIndex = issues.findIndex(
        (issue) => issue.iid.toString() === activeId
      );
      const overIndex = issues.findIndex(
        (issue) => issue.iid.toString() === overId
      );

      if (activeIndex === -1 || overIndex === -1) {
        return issues;
      }

      return arrayMove(issues, activeIndex, overIndex);
    });
  };

  // Filter and sort issues
  let filteredIssues = orderedIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.labels.some((label) =>
        label.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "open" && issue.state === "opened") ||
      (filterStatus === "closed" && issue.state === "closed");

    return matchesSearch && matchesStatus;
  });

  // Sort issues only if not using manual order (created_desc is default)
  if (sortBy !== "manual") {
    filteredIssues.sort((a, b) => {
      switch (sortBy) {
        case "created_desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "created_asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "updated_desc":
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        case "updated_asc":
          return (
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          );
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="closed">Fechadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Ordem Manual (Arrastar)</SelectItem>
            <SelectItem value="created_desc">Criação (Mais recente)</SelectItem>
            <SelectItem value="created_asc">Criação (Mais antiga)</SelectItem>
            <SelectItem value="updated_desc">
              Atualização (Mais recente)
            </SelectItem>
            <SelectItem value="updated_asc">
              Atualização (Mais antiga)
            </SelectItem>
            <SelectItem value="title_asc">Título (A-Z)</SelectItem>
            <SelectItem value="title_desc">Título (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredIssues.length} issue(s) encontrada(s)
        </p>
      </div>

      {/* Issues List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredIssues.map((issue) => `issue-row-${issue.iid}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Nenhuma issue encontrada</p>
                </CardContent>
              </Card>
            ) : (
              filteredIssues.map((issue) => (
                <SortableIssueRow
                  key={issue.iid}
                  issue={issue}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeIssue ? (
            <SortableIssueRow
              issue={activeIssue}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
