// Hand-written types mirroring supabase/migrations/0001_init.sql.
//
// NOTE: these are `type` aliases, not `interface`s, on purpose — an
// `interface` doesn't structurally satisfy `Record<string, unknown>` in a
// conditional-type `extends` check, which breaks supabase-js's
// `Database[Schema] extends GenericSchema` inference and silently collapses
// every `.from()` call's row types to `never`.

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type PaymentStatus = "pending" | "success" | "failed";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: CourseLevel;
  price_kes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  youtube_url: string;
  order_index: number;
  created_at: string;
};

/** Public curriculum preview row (public.lesson_previews view) — title/order only, no gated content. */
export type LessonPreview = {
  id: string;
  module_id: string;
  order_index: number;
  title: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  course_id: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
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
      courses: Table<Course>;
      modules: Table<CourseModule>;
      lessons: Table<Lesson>;
      enrollments: Table<Enrollment>;
      lesson_progress: Table<LessonProgress>;
      payments: Table<Payment>;
    };
    Views: {
      lesson_previews: { Row: LessonPreview; Relationships: [] };
    };
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean };
    };
  };
};
