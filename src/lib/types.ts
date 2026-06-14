// TypeScript interfaces that exactly match the shape of data/portfolio.json.
// These are the single source of truth for every section's props.

export type ProjectStatus = "LIVE" | "IN PROGRESS";

export type TimelineType =
  | "EDUCATION"
  | "COMMUNITY"
  | "PROJECT"
  | "EVENT"
  | "ONGOING";

export interface Personal {
  name: string;
  handle: string;
  title: string;
  school: string;
  year: string;
  location: string;
  bio: string[];
  github: string;
  email: string;
}

export interface Stat {
  label: string;
  value: number;
}

export interface Project {
  id: string;
  label: string;
  category: string;
  subcategory: string;
  status: ProjectStatus;
  description: string;
  stack: string[];
  /** `null` => the project is classified and renders [ CLASSIFIED ] instead of a source link. */
  link: string | null;
}

export interface Skill {
  name: string;
  value: number;
}

export interface Skills {
  languages: Skill[];
  frameworks: Skill[];
  tools: Skill[];
}

export type SkillCategory = keyof Skills;

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  type: TimelineType;
}

export interface PortfolioData {
  personal: Personal;
  stats: Stat[];
  projects: Project[];
  skills: Skills;
  timeline: TimelineEntry[];
}
