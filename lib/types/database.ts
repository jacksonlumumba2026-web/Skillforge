// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is live
// and swap this file out if you want fully generated types.
//
// NOTE: these are `type` aliases, not `interface`s, on purpose — an
// `interface` doesn't structurally satisfy `Record<string, unknown>` in a
// conditional-type `extends` check, which breaks supabase-js's
// `Database[Schema] extends GenericSchema` inference and silently collapses
// every `.from()` call's row types to `never`.

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type ChecklistItem = {
  label: string;
  done?: boolean;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  trial_ends_at: string | null;
  subscription_status: SubscriptionStatus | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type LearningPath = {
  id: string;
  skill_id: string;
  level: SkillLevel;
  title: string;
  generated_at: string;
  created_at: string;
};

export type PathStep = {
  id: string;
  path_id: string;
  order_index: number;
  title: string;
  youtube_video_id: string;
  video_title: string;
  video_channel: string;
  video_duration_seconds: number | null;
  summary: string;
  checklist: ChecklistItem[];
  created_at: string;
};

export type UserPath = {
  id: string;
  user_id: string;
  path_id: string;
  started_at: string;
  current_step: number;
  completed_at: string | null;
  last_activity_at: string;
  streak_count: number;
};

export type StepProgress = {
  id: string;
  user_id: string;
  step_id: string;
  completed_at: string;
};

export type Certificate = {
  id: string;
  user_id: string;
  path_id: string;
  issued_at: string;
  certificate_url: string | null;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      skills: Table<Skill>;
      learning_paths: Table<LearningPath>;
      path_steps: Table<PathStep>;
      user_paths: Table<UserPath>;
      step_progress: Table<StepProgress>;
      certificates: Table<Certificate>;
    };
    Views: Record<string, never>;
    Functions: {
      has_active_access: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
  };
};
