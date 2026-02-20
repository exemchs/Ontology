"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";

interface TypeAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, description: string) => void;
  existingNames: string[];
}

export function TypeAddDialog({
  open,
  onOpenChange,
  onAdd,
  existingNames,
}: TypeAddDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const trimmedName = name.trim();
  const isDuplicate = existingNames.some(
    (n) => n.toLowerCase() === trimmedName.toLowerCase()
  );
  const isValid = trimmedName.length > 0 && !isDuplicate;

  function handleSave() {
    if (!isValid) return;
    onAdd(trimmedName, description.trim());
    setName("");
    setDescription("");
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && isValid) {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setName("");
          setDescription("");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent data-testid="type-add-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Type</DialogTitle>
          <DialogDescription>
            Create a new ontology type
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-type-name">Type Name</Label>
            <Input
              id="new-type-name"
              placeholder="e.g. Sensor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {isDuplicate && (
              <p className="text-xs text-[var(--status-critical)]">
                Type &quot;{trimmedName}&quot; already exists
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-type-description">Description</Label>
            <Textarea
              id="new-type-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
