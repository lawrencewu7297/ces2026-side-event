import { z } from "zod";

export interface Exhibitor {
  iid: string;
  名称: string;
  Logo: string | null;
  website: string | null;
  booths: string | null;
  category: string | null;
  关于: string | null;
  event: string | null;
  contact: string | null;
  "Company Info": string | null;
  国家: string | null;
  isXFactor?: boolean;
}

export type VisitStatus = "None" | "To Visit" | "Visited" | "Contacted" | "Follow Up";

export interface UserState {
  isStarred: boolean;
  status: VisitStatus;
  notes: string;
}

export interface ExhibitorWithState extends Exhibitor {
  userState: UserState;
}

export const statusOptions: VisitStatus[] = [
  "None",
  "To Visit",
  "Visited",
  "Contacted",
  "Follow Up",
];

export const statusColors: Record<VisitStatus, string> = {
  "None": "bg-slate-500/20 text-slate-400 border-slate-500/50",
  "To Visit": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  "Visited": "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  "Contacted": "bg-amber-500/20 text-amber-400 border-amber-500/50",
  "Follow Up": "bg-rose-500/20 text-rose-400 border-rose-500/50",
};
