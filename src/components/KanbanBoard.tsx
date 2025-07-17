"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowLeft, LayoutGrid, List, GitBranch } from "lucide-react";
import gitlabApi, { Project, Issue } from "@/lib/gitlabApi";
import { useAppStore } from "@/lib/store";
import IssueDialog from "./IssueDialog";
import IssueCard from "./IssueCard";
import IssueList from "./IssueList";
import DroppableColumn from "./DroppableColumn";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import Link from "next/link";

interface KanbanBoardProps {
  project: Project;
}

export default function KanbanBoard({ project }: KanbanBoardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const {
    issues,
    setIssues,
    isLoading,
    setLoading,
    error,
    setError,
    viewMode,
    setViewMode,
    addIssue,
    updateIssue,
    removeIssue,
  } = useAppStore();

  useEffect(() => {
    loadIssues();
  }, [project.id]);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await gitlabApi.getIssues(project.id.toString());
      setIssues(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar issues");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (data: {
    title: string;
    description: string;
    labels: string;
  }) => {
    try {
      const newIssue = await gitlabApi.createIssue(project.id.toString(), data);
      addIssue(newIssue);
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro ao criar issue");
    }
  };

  const handleUpdateIssue = async (
    issueIid: number,
    data: {
      title?: string;
      description?: string;
      labels?: string;
      state_event?: "close" | "reopen";
    }
  ) => {
    try {
      const updatedIssue = await gitlabApi.updateIssue(
        project.id.toString(),
        issueIid,
        data
      );
      updateIssue(issueIid, updatedIssue);
      setEditingIssue(null);
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar issue");
    }
  };

  const handleDeleteIssue = async (issueIid: number) => {
    try {
      await gitlabApi.deleteIssue(project.id.toString(), issueIid);
      removeIssue(issueIid);
    } catch (err: any) {
      setError(err.message || "Erro ao deletar issue");
    }
  };

  const openIssues = issues.filter((issue) => issue.state === "opened");
  const closedIssues = issues.filter((issue) => issue.state === "closed");

  // Separar issues por labels para o Kanban
  const todoIssues = openIssues.filter(
    (issue) =>
      !issue.labels.some((label) =>
        ["doing", "in progress", "review"].includes(label.toLowerCase())
      )
  );
  const doingIssues = openIssues.filter((issue) =>
    issue.labels.some((label) =>
      ["doing", "in progress"].includes(label.toLowerCase())
    )
  );
  const reviewIssues = openIssues.filter((issue) =>
    issue.labels.some((label) =>
      ["review", "testing"].includes(label.toLowerCase())
    )
  );

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setIsDialogOpen(true);
  };

  const handleReopenIssue = async (issueIid: number) => {
    try {
      const reopenedIssue = await gitlabApi.reopenIssue(
        project.id.toString(),
        issueIid
      );
      updateIssue(issueIid, reopenedIssue);
    } catch (err: any) {
      setError(err.message || "Erro ao reabrir issue");
    }
  };

  const handleMoveIssue = async (issueIid: number, newStatus: string) => {
    const issue = issues.find((i) => i.iid === issueIid);
    if (!issue) return;

    let newLabels = issue.labels.filter(
      (label) =>
        !["todo", "doing", "in progress", "review", "testing"].includes(
          label.toLowerCase()
        )
    );

    if (newStatus !== "todo") {
      newLabels.push(newStatus);
    }

    await handleUpdateIssue(issueIid, { labels: newLabels.join(",") });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find((i) => `issue-${i.iid}` === active.id);
    setActiveIssue(issue || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setDragOverColumn(null);
      return;
    }

    // Check if over a column or an item within a column
    let columnId = over.id.toString();

    // If dragging over an issue, find its column
    if (columnId.startsWith("issue-")) {
      const issueId = columnId.replace("issue-", "");
      const issue = issues.find((i) => i.iid.toString() === issueId);
      if (issue) {
        columnId = getColumnForIssue(issue);
      }
    }

    // Validate column ID
    if (["todo", "doing", "review", "done"].includes(columnId)) {
      setDragOverColumn(columnId);
    } else {
      setDragOverColumn(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);
    setDragOverColumn(null);

    if (!over) return;

    const activeIssueId = active.id.toString().replace("issue-", "");
    const issue = issues.find((i) => i.iid.toString() === activeIssueId);

    if (!issue) return;

    // Determine the target column
    let targetColumn = over.id.toString();
    let targetIssueId: string | null = null;

    // If dropped on an issue, get the column of that issue and the target issue
    if (targetColumn.startsWith("issue-")) {
      targetIssueId = targetColumn.replace("issue-", "");
      const targetIssue = issues.find(
        (i) => i.iid.toString() === targetIssueId
      );
      if (targetIssue) {
        targetColumn = getColumnForIssue(targetIssue);
      }
    }

    // Validate target column
    if (!["todo", "doing", "review", "done"].includes(targetColumn)) {
      return;
    }

    const currentColumn = getColumnForIssue(issue);

    // If moving within the same column, handle reordering
    if (currentColumn === targetColumn && targetIssueId) {
      const currentColumnIssues = getCurrentColumnIssues(currentColumn);
      const activeIndex = currentColumnIssues.findIndex(
        (i) => i.iid.toString() === activeIssueId
      );
      const overIndex = currentColumnIssues.findIndex(
        (i) => i.iid.toString() === targetIssueId
      );

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        // Reorder issues within the same column
        const reorderedIssues = [...issues];
        const activeIssue = currentColumnIssues[activeIndex];

        // Remove the active issue from its current position
        const activeGlobalIndex = reorderedIssues.findIndex(
          (i) => i.iid === activeIssue.iid
        );
        reorderedIssues.splice(activeGlobalIndex, 1);

        // Find the new position to insert
        const targetIssue = currentColumnIssues[overIndex];
        const targetGlobalIndex = reorderedIssues.findIndex(
          (i) => i.iid === targetIssue.iid
        );

        // Insert at the new position
        const insertIndex =
          activeIndex < overIndex ? targetGlobalIndex + 1 : targetGlobalIndex;
        reorderedIssues.splice(insertIndex, 0, activeIssue);

        // Update UI immediately for fluid experience
        setIssues(reorderedIssues);
      }
      return;
    }

    // Store original state for potential rollback
    const originalIssues = [...issues];

    // Handle moving between different columns - Update UI first for fluid experience
    let updatedIssue: Issue;

    if (targetColumn === "done") {
      // Moving TO done column - close the issue
      updatedIssue = { ...issue, state: "closed" };
    } else {
      // Moving FROM done OR between other columns
      let newLabels = issue.labels.filter(
        (label) =>
          !["todo", "doing", "in progress", "review", "testing"].includes(
            label.toLowerCase()
          )
      );

      if (targetColumn !== "todo") {
        newLabels.push(targetColumn);
      }

      // If moving FROM done column, reopen the issue
      if (currentColumn === "done") {
        updatedIssue = { ...issue, state: "opened", labels: newLabels };
      } else {
        // Moving between other columns (not from done)
        updatedIssue = { ...issue, labels: newLabels };
      }
    }

    // For moves between different columns, always place at the end of target column
    const reorderedIssues = [...issues];

    // Remove the issue from its current position
    const activeGlobalIndex = reorderedIssues.findIndex(
      (i) => i.iid === issue.iid
    );
    reorderedIssues.splice(activeGlobalIndex, 1);

    // Find the last issue in the target column to insert after it
    const getColumnIssuesFromArray = (
      column: string,
      issuesArray: Issue[]
    ): Issue[] => {
      const openIssues = issuesArray.filter(
        (issue) => issue.state === "opened"
      );
      const closedIssues = issuesArray.filter(
        (issue) => issue.state === "closed"
      );

      switch (column) {
        case "todo":
          return openIssues.filter(
            (issue) =>
              !issue.labels.some((label) =>
                ["doing", "in progress", "review"].includes(label.toLowerCase())
              )
          );
        case "doing":
          return openIssues.filter((issue) =>
            issue.labels.some((label) =>
              ["doing", "in progress"].includes(label.toLowerCase())
            )
          );
        case "review":
          return openIssues.filter((issue) =>
            issue.labels.some((label) =>
              ["review", "testing"].includes(label.toLowerCase())
            )
          );
        case "done":
          return closedIssues;
        default:
          return [];
      }
    };

    const targetColumnIssues = getColumnIssuesFromArray(
      targetColumn,
      reorderedIssues
    );

    if (targetColumnIssues.length > 0) {
      // Find the position of the last issue in the target column within the global issues array
      const lastIssueInTargetColumn =
        targetColumnIssues[targetColumnIssues.length - 1];
      const lastIssueGlobalIndex = reorderedIssues.findIndex(
        (i) => i.iid === lastIssueInTargetColumn.iid
      );

      // Insert after the last issue in the target column
      reorderedIssues.splice(lastIssueGlobalIndex + 1, 0, updatedIssue);
    } else {
      // If target column is empty, we need to find the right position based on column order
      // Find where to insert based on column positions
      let insertIndex = reorderedIssues.length; // Default to end

      if (targetColumn === "todo") {
        // Insert at the beginning (before any doing/review/done issues)
        const firstNonTodoIndex = reorderedIssues.findIndex((issue) => {
          const col = getColumnForIssue(issue);
          return col !== "todo";
        });
        insertIndex = firstNonTodoIndex === -1 ? 0 : firstNonTodoIndex;
      } else if (targetColumn === "doing") {
        // Insert after todo issues but before review/done
        const firstReviewOrDoneIndex = reorderedIssues.findIndex((issue) => {
          const col = getColumnForIssue(issue);
          return col === "review" || col === "done";
        });
        insertIndex =
          firstReviewOrDoneIndex === -1
            ? reorderedIssues.length
            : firstReviewOrDoneIndex;
      } else if (targetColumn === "review") {
        // Insert after todo/doing issues but before done
        const firstDoneIndex = reorderedIssues.findIndex((issue) => {
          const col = getColumnForIssue(issue);
          return col === "done";
        });
        insertIndex =
          firstDoneIndex === -1 ? reorderedIssues.length : firstDoneIndex;
      }
      // For "done", insertIndex is already set to end

      reorderedIssues.splice(insertIndex, 0, updatedIssue);
    }

    // Update state immediately for fluid UX
    setIssues(reorderedIssues);

    // Then try to update on the backend
    try {
      if (targetColumn === "done") {
        // Moving TO done - close the issue
        await gitlabApi.updateIssue(project.id.toString(), issue.iid, {
          state_event: "close",
        });
      } else if (currentColumn === "done") {
        // Moving FROM done to another column - reopen AND update labels
        let newLabels = issue.labels.filter(
          (label) =>
            !["todo", "doing", "in progress", "review", "testing"].includes(
              label.toLowerCase()
            )
        );

        if (targetColumn !== "todo") {
          newLabels.push(targetColumn);
        }

        // First reopen the issue, then update labels
        await gitlabApi.updateIssue(project.id.toString(), issue.iid, {
          state_event: "reopen",
          labels: newLabels.join(","),
        });
      } else {
        // Moving between other columns (not involving done)
        let newLabels = issue.labels.filter(
          (label) =>
            !["todo", "doing", "in progress", "review", "testing"].includes(
              label.toLowerCase()
            )
        );

        if (targetColumn !== "todo") {
          newLabels.push(targetColumn);
        }

        await gitlabApi.updateIssue(project.id.toString(), issue.iid, {
          labels: newLabels.join(","),
        });
      }
    } catch (err: any) {
      // If backend update fails, rollback UI changes
      setIssues(originalIssues);
      setError(`Erro ao mover issue: ${err.message || "Erro desconhecido"}`);
    }
  };

  const getCurrentColumnIssues = (column: string): Issue[] => {
    switch (column) {
      case "todo":
        return todoIssues;
      case "doing":
        return doingIssues;
      case "review":
        return reviewIssues;
      case "done":
        return closedIssues;
      default:
        return [];
    }
  };

  const getColumnForIssue = (issue: Issue) => {
    if (issue.state === "closed") return "done";

    const labels = issue.labels.map((l) => l.toLowerCase());
    if (labels.some((l) => ["doing", "in progress"].includes(l))) {
      return "doing";
    }
    if (labels.some((l) => ["review", "testing"].includes(l))) {
      return "review";
    }
    return "todo";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando issues...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href="/">
            <Button variant="outline" className="cursor-pointer" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
              <span className="sm:hidden">←</span>
            </Button>
          </Link>

          <div className="min-w-0 flex-1 sm:flex-none">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold flex items-center gap-1 sm:gap-2">
              <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0" />
              <span className="truncate">{project.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{project.path_with_namespace}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "kanban" | "list")}
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="kanban" className="text-xs sm:text-sm">
                <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Kanban</span>
                <span className="sm:hidden">Board</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs sm:text-sm">
                <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setIsDialogOpen(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nova Issue</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2"
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Content */}
      {viewMode === "kanban" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <DroppableColumn
              id="todo"
              title="To Do"
              issues={todoIssues}
              onEdit={handleEditIssue}
              onDelete={handleDeleteIssue}
              onMove={handleMoveIssue}
              onReopen={handleReopenIssue}
              isDraggedOver={dragOverColumn === "todo"}
            />

            <DroppableColumn
              id="doing"
              title="Doing"
              issues={doingIssues}
              onEdit={handleEditIssue}
              onDelete={handleDeleteIssue}
              onMove={handleMoveIssue}
              onReopen={handleReopenIssue}
              isDraggedOver={dragOverColumn === "doing"}
            />

            <DroppableColumn
              id="review"
              title="Review"
              issues={reviewIssues}
              onEdit={handleEditIssue}
              onDelete={handleDeleteIssue}
              onMove={handleMoveIssue}
              onReopen={handleReopenIssue}
              isDraggedOver={dragOverColumn === "review"}
            />

            <DroppableColumn
              id="done"
              title="Done"
              issues={closedIssues}
              onEdit={handleEditIssue}
              onDelete={handleDeleteIssue}
              onMove={handleMoveIssue}
              onReopen={handleReopenIssue}
              isDone
              isDraggedOver={dragOverColumn === "done"}
            />
          </div>

          <DragOverlay>
            {activeIssue ? (
              <IssueCard
                issue={activeIssue}
                onEdit={() => {}}
                onDelete={() => {}}
                onMove={() => {}}
                onReopen={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <IssueList
          issues={issues}
          onEdit={handleEditIssue}
          onDelete={handleDeleteIssue}
        />
      )}

      {/* Dialog for creating/editing issues */}
      <IssueDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingIssue(null);
        }}
        onSubmit={
          editingIssue
            ? (data: { title: string; description: string; labels: string }) =>
                handleUpdateIssue(editingIssue.iid, data)
            : handleCreateIssue
        }
        editingIssue={editingIssue}
      />
    </div>
  );
}
