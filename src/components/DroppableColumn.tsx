"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/lib/gitlabApi";
import IssueCard from "./IssueCard";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
  id: string;
  title: string;
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (issueIid: number) => void;
  onMove?: (issueIid: number, newStatus: string) => void;
  onReopen?: (issueIid: number) => void;
  isDone?: boolean;
  isDraggedOver?: boolean;
}

export default function DroppableColumn({
  id,
  title,
  issues,
  onEdit,
  onDelete,
  onMove,
  onReopen,
  isDone = false,
  isDraggedOver = false,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id,
    },
  });

  const issueIds = issues.map((issue) => `issue-${issue.iid}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge variant="secondary">{issues.length}</Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[300px] space-y-3 p-4 rounded-lg border-2 border-dashed transition-all duration-200",
          isOver || isDraggedOver
            ? "border-blue-400 bg-blue-50 scale-[1.02] shadow-lg"
            : "border-gray-200 bg-gray-50/30 hover:bg-gray-50/50"
        )}
      >
        <SortableContext
          items={issueIds}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <IssueCard
              key={issue.iid}
              issue={issue}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              onReopen={onReopen}
              isDone={isDone}
            />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Arraste uma issue para cá
          </div>
        )}
      </div>
    </div>
  );
}
