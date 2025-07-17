"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Issue } from "@/lib/gitlabApi";

interface IssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    labels: string;
  }) => void;
  editingIssue?: Issue | null;
}

export default function IssueDialog({
  isOpen,
  onClose,
  onSubmit,
  editingIssue,
}: IssueDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingIssue) {
      setTitle(editingIssue.title);
      setDescription(editingIssue.description || "");
      setLabels(editingIssue.labels.join(", "));
    } else {
      setTitle("");
      setDescription("");
      setLabels("");
    }
  }, [editingIssue, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        labels: labels.trim(),
      });

      // Reset form
      setTitle("");
      setDescription("");
      setLabels("");
    } catch (error) {
      console.error("Erro ao salvar issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setLabels("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingIssue ? "Editar Issue" : "Nova Issue"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="title" className="text-sm sm:text-base">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da issue..."
              required
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição da issue..."
              rows={3}
              className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="labels" className="text-sm sm:text-base">Labels</Label>
            <Input
              id="labels"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, feature, enhancement"
              className="text-sm sm:text-base"
            />
            <p className="text-xs sm:text-sm text-gray-500">
              Separe múltiplas labels com vírgula. Exemplo: bug, urgent,
              frontend
            </p>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || isSubmitting}
              className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            >
              {isSubmitting ? "Salvando..." : editingIssue ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
