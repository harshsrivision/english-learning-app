"use client";

import { useEffect, useState } from "react";
import { learnerProgressChangedEvent, userSessionChangedEvent } from "@/lib/browser-events";
import { readLearnerProgress, writeLearnerProgress, type LearnerProgress } from "@/lib/local-progress";

type LearnerProgressValue = LearnerProgress | ((currentProgress: LearnerProgress) => LearnerProgress);

export function useLearnerProgress() {
  const [progress, setProgressState] = useState<LearnerProgress | null>(null);

  useEffect(() => {
    function syncProgress() {
      setProgressState(readLearnerProgress());
    }

    syncProgress();
    window.addEventListener(learnerProgressChangedEvent, syncProgress as EventListener);
    window.addEventListener(userSessionChangedEvent, syncProgress as EventListener);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(learnerProgressChangedEvent, syncProgress as EventListener);
      window.removeEventListener(userSessionChangedEvent, syncProgress as EventListener);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  function setProgress(nextValue: LearnerProgressValue) {
    setProgressState((currentProgress) => {
      const resolvedCurrentProgress = currentProgress ?? readLearnerProgress();
      const resolvedNextProgress = typeof nextValue === "function" ? nextValue(resolvedCurrentProgress) : nextValue;
      writeLearnerProgress(resolvedNextProgress);
      return resolvedNextProgress;
    });
  }

  function refreshProgress() {
    setProgressState(readLearnerProgress());
  }

  return {
    progress,
    setProgress,
    refreshProgress
  };
}
