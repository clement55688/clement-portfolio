export type FitSource = {
  id: string;
  kind: string;
  title: string;
  organization?: string;
  location?: string;
  dates?: string;
  url?: string;
  highlights: string[];
};

export type FitMatch = {
  requirement: string;
  sources: FitSource[];
};

export type FitGap = {
  requirement: string;
  note: string;
  partial: boolean;
};

export type FitLookAt = {
  id: string;
  kind: string;
  title: string;
  organization?: string;
  url?: string;
  why: string;
};

export type FitAssessment = {
  summary: string;
  matches: FitMatch[];
  gaps: FitGap[];
  lookAt: FitLookAt[];
};
