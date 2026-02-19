"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WELCOME_KEY } from "@/lib/auth";

export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show popup only if not previously dismissed in this session
    const dismissed = sessionStorage.getItem(WELCOME_KEY);
    if (dismissed !== "true") {
      setOpen(true);
    }
  }, []);

  function handleDismiss() {
    sessionStorage.setItem(WELCOME_KEY, "true");
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleDismiss();
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl">환영합니다</DialogTitle>
          <DialogDescription className="space-y-1 pt-2">
            <span className="block">eXemble Ontology Platform</span>
            <span className="block">SK Siltron FAB POC Demo</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleDismiss}>시작하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
