"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { OntologyType } from "@/types";

interface TypeEditDialogProps {
  type: OntologyType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TypeEditDialog({
  type,
  open,
  onOpenChange,
}: TypeEditDialogProps) {
  const [description, setDescription] = useState("");
  const [predicates, setPredicates] = useState<string[]>([]);
  const [newPredicate, setNewPredicate] = useState("");

  useEffect(() => {
    if (type) {
      setDescription(type.description);
      setPredicates([...type.predicates]);
      setNewPredicate("");
    }
  }, [type]);

  function handleAddPredicate() {
    const trimmed = newPredicate.trim();
    if (trimmed && !predicates.includes(trimmed)) {
      setPredicates((prev) => [...prev, trimmed]);
      setNewPredicate("");
    }
  }

  function handleRemovePredicate(pred: string) {
    setPredicates((prev) => prev.filter((p) => p !== pred));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPredicate();
    }
  }

  function handleSave() {
    // POC: close dialog without persistence
    onOpenChange(false);
  }

  if (!type) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="type-edit-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Type</DialogTitle>
          <DialogDescription>
            Modify type properties (POC: changes are not persisted)
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="type-name">Type Name</Label>
            <Input
              id="type-name"
              value={type.name}
              disabled
              className="opacity-60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type-description">Description</Label>
            <Textarea
              id="type-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Predicates</Label>
            <div className="flex flex-wrap gap-1.5">
              {predicates.map((pred) => (
                <Badge
                  key={pred}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs"
                >
                  {pred}
                  <button
                    type="button"
                    onClick={() => handleRemovePredicate(pred)}
                    className="hover:bg-muted-foreground/20 ml-0.5 rounded-full p-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add predicate..."
                value={newPredicate}
                onChange={(e) => setNewPredicate(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPredicate}
                disabled={!newPredicate.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
