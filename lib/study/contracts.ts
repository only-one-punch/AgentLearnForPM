export const selfTestStatuses = ["mastered", "uncertain", "not_yet"] as const;
export type SelfTestStatus = (typeof selfTestStatuses)[number];

export const studyEventTypes = ["read", "bookmark", "note", "self_test", "search", "refresh"] as const;
export type StudyEventType = (typeof studyEventTypes)[number];

export type ProgressInput = {
  documentSlug: string;
  sectionId?: string | null;
  scrollPercent: number;
  completedPercent: number;
};

export type BookmarkInput = {
  documentSlug: string;
  sectionId?: string | null;
  anchorId?: string | null;
  excerpt?: string | null;
};

export type NoteInput = BookmarkInput & {
  selectedText?: string | null;
  body: string;
};

export type SelfTestStateInput = {
  itemId: string;
  documentSlug: string;
  status: SelfTestStatus;
};

export type DashboardData = {
  contentVersionId: string | null;
  continueReading: {
    documentSlug: string;
    sectionId: string | null;
    scrollPercent: number;
    completedPercent: number;
    lastReadAt: Date;
  } | null;
  weakSelfTests: Array<{
    itemId: string;
    documentSlug: string;
    status: SelfTestStatus;
    updatedAt: Date;
  }>;
  recentBookmarks: Array<{
    id: string;
    documentSlug: string;
    sectionId: string | null;
    excerpt: string | null;
    createdAt: Date;
  }>;
  recentNotes: Array<{
    id: string;
    documentSlug: string;
    sectionId: string | null;
    selectedText: string | null;
    body: string;
    updatedAt: Date;
  }>;
};
