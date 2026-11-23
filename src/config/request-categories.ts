import type { RequestCategory, ServiceKey } from "@/types/site";

export interface RequestCategoryDef {
  id: RequestCategory;
  label: string;
  /** Matches siteConfig.services toggle; null = always available. */
  toggle: ServiceKey | null;
  subjectPlaceholder: string;
  extraLabel: string;
  extraPlaceholder: string;
}

export const REQUEST_CATEGORIES: RequestCategoryDef[] = [
  { id: "coaching", label: "Coaching Request", toggle: "coaching", subjectPlaceholder: "What would you like coaching on?", extraLabel: "Your goals", extraPlaceholder: "Briefly describe what you hope to achieve." },
  { id: "mentorship", label: "Mentorship Request", toggle: "mentorship", subjectPlaceholder: "What are you seeking mentorship for?", extraLabel: "Current focus or role", extraPlaceholder: "Tell us about where you are right now." },
  { id: "consulting", label: "Consulting Request", toggle: "consulting", subjectPlaceholder: "Engagement title", extraLabel: "Organisation & timeline", extraPlaceholder: "Organisation name, size and desired timeline." },
  { id: "speaking", label: "Speaking Engagement", toggle: "speaking", subjectPlaceholder: "Event or occasion", extraLabel: "Event date, venue & audience size", extraPlaceholder: "Proposed date, location and expected audience." },
  { id: "training", label: "Training Request", toggle: "training", subjectPlaceholder: "Training or workshop topic", extraLabel: "Group size & preferred dates", extraPlaceholder: "Number of participants and preferred dates." },
  { id: "event-ticket", label: "Event Ticket Request", toggle: "events", subjectPlaceholder: "Ticket request", extraLabel: "Additional information", extraPlaceholder: "Anything we should know about your attendance." },
  { id: "general", label: "General Enquiry", toggle: null, subjectPlaceholder: "How can we help?", extraLabel: "Additional information", extraPlaceholder: "Anything else you would like to share." },
];

export function getCategory(id: string): RequestCategoryDef | undefined {
  return REQUEST_CATEGORIES.find((c) => c.id === id);
}
