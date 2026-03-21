export const userSessionChangedEvent = "bolo:user-session-changed";
export const learnerProgressChangedEvent = "bolo:learner-progress-changed";

type SessionDetail = {
  userId: number | null;
};

type LearnerProgressDetail = {
  userId: number | null;
};

function dispatchBrowserEvent<TDetail>(eventName: string, detail: TDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

export function dispatchUserSessionChanged(userId: number | null) {
  dispatchBrowserEvent<SessionDetail>(userSessionChangedEvent, { userId });
}

export function dispatchLearnerProgressChanged(userId: number | null) {
  dispatchBrowserEvent<LearnerProgressDetail>(learnerProgressChangedEvent, { userId });
}
