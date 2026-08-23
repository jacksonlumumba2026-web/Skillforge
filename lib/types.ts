// Hand-written types mirroring supabase/migrations/0001_init.sql.
//
// NOTE: these are `type` aliases, not `interface`s, on purpose — an
// `interface` doesn't structurally satisfy `Record<string, unknown>` in a
// conditional-type `extends` check, which breaks supabase-js's
// `Database[Schema] extends GenericSchema` inference and silently collapses
// every `.from()` call's row types to `never`.

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseCategory =
  | "business-freelancing"
  | "marketing-growth"
  | "design-creative"
  | "tech-programming"
  | "productivity-tools";
export type UserRole = "student" | "admin";
export type EnrollmentStatus = "active" | "completed" | "revoked";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  /** Browsing bucket for /courses filter chips. Null for courses (mainly
   *  admin-created or AI-generated) that haven't been assigned one yet. */
  category: CourseCategory | null;
  price: number;
  thumbnail_url: string | null;
  published: boolean;
  /** Set when a learner's course request triggered AI generation; null for seeded/manual courses. */
  generated_by: string | null;
  /** Lower sorts first on /courses; curated independently of created_at. */
  display_order: number;
  /** True once a course has been widened past `level` into a full 6-module
   *  beginner→intermediate→professional→freelance progression (see the
   *  course-depth-expansion migrations). False for courses that are still
   *  a single-tier walkthrough at just their `level`. */
  has_career_path: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  youtube_url: string;
  order_number: number;
  /** Video length in seconds, when known. Null for lessons added before this was tracked. */
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Public curriculum preview row (public.lesson_previews view). Deliberately
 * includes `description` and `duration_seconds` — short marketing-style
 * teasers, not the lesson's actual paid content — so a visitor can
 * understand a course before buying. `youtube_url` stays gated to enrolled
 * users via the `lessons` table's RLS policy.
 */
export type LessonPreview = {
  id: string;
  module_id: string;
  order_number: number;
  title: string;
  description: string;
  duration_seconds: number | null;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  created_at: string;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string;
  created_at: string;
};

export type PaymentProvider = "paystack" | "mpesa" | "mpesa_manual";

export type Payment = {
  id: string;
  user_id: string;
  course_id: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  /** M-Pesa only — the phone number the STK push was sent to. */
  phone: string | null;
  /** M-Pesa only — Safaricom's id for the checkout request, used to match its async callback. */
  checkout_request_id: string | null;
  /** M-Pesa STK only — the human-facing receipt code, stored for support/reconciliation only. */
  mpesa_receipt: string | null;
  /** Manual M-Pesa only — the confirmation code the buyer typed in themselves (self-reported, not Safaricom-confirmed). */
  mpesa_manual_code: string | null;
  /** Manual M-Pesa only — which channel the buyer says they paid through (informational, for statement lookup). */
  manual_channel: "till" | "send_money" | null;
  /** Manual M-Pesa only — set by an admin once they've checked the code against the real M-Pesa statement. */
  manual_verified_at: string | null;
  /** Set when a discount/scholarship code was applied — `amount` above is
   *  already the discounted total actually charged (or 0 for a full
   *  scholarship). */
  discount_code_id: string | null;
  /** The course's full price before the discount code, for admin visibility. Null when no code was applied. */
  original_amount: number | null;
  created_at: string;
};

/** Admin-issued percent-off code — the affordability lever for learners who
 *  can't pay full price. A 100% code is a full scholarship. */
export type DiscountCode = {
  id: string;
  code: string;
  percent_off: number;
  max_redemptions: number | null;
  redemption_count: number;
  active: boolean;
  expires_at: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

/** One (code, learner) redemption — enforces "once per user per code" and gives an audit trail. */
export type DiscountCodeRedemption = {
  id: string;
  discount_code_id: string;
  user_id: string;
  payment_id: string;
  created_at: string;
};

/** Shareable completion certificate — publicly readable, issued only after real completion. */
export type Certificate = {
  id: string;
  user_id: string;
  course_id: string;
  learner_name: string;
  issued_at: string;
};

/** Public course rating/review — writable only by an enrolled learner, for their own row. */
export type CourseReview = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string;
  /** Snapshotted at write time — profiles has no public read policy to join a live name from. */
  reviewer_name: string;
  created_at: string;
  updated_at: string;
};

/** A browser's Web Push endpoint/keys — one row per device/browser the learner enabled notifications on. */
export type PushSubscription = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

/** A learner's daily study-reminder schedule. */
export type StudyReminder = {
  user_id: string;
  reminder_time: string;
  utc_offset_minutes: number;
  enabled: boolean;
  last_sent_date: string | null;
  created_at: string;
  updated_at: string;
};

/** "Apply to teach" waitlist row — a lead, not a real seller account. */
export type InstructorApplication = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at: string;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

// Real foreign-key metadata for every FK that stays inside the `public`
// schema (auth.users FKs are omitted — we don't type that schema). This is
// what supabase-js's embedded-select parser (`.select("courses(...)")`)
// needs to resolve joins; without it, any query using an embed collapses
// to `never` instead of erroring loudly, which is a much worse failure mode.
type Table<Row, Rel extends Relationship[] = []> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: Rel;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      courses: Table<Course>;
      modules: Table<
        CourseModule,
        [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ]
      >;
      lessons: Table<
        Lesson,
        [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ]
      >;
      enrollments: Table<
        Enrollment,
        [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ]
      >;
      lesson_progress: Table<
        LessonProgress,
        [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ]
      >;
      payments: Table<
        Payment,
        [
          {
            foreignKeyName: "payments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ]
      >;
      instructor_applications: Table<InstructorApplication>;
      discount_codes: Table<DiscountCode>;
      discount_code_redemptions: Table<
        DiscountCodeRedemption,
        [
          {
            foreignKeyName: "discount_code_redemptions_discount_code_id_fkey";
            columns: ["discount_code_id"];
            isOneToOne: false;
            referencedRelation: "discount_codes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_code_redemptions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ]
      >;
      push_subscriptions: Table<PushSubscription>;
      study_reminders: Table<StudyReminder>;
      certificates: Table<
        Certificate,
        [
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ]
      >;
      course_reviews: Table<
        CourseReview,
        [
          {
            foreignKeyName: "course_reviews_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ]
      >;
    };
    Views: {
      lesson_previews: {
        Row: LessonPreview;
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      increment_discount_redemption: {
        Args: { p_discount_code_id: string };
        Returns: void;
      };
    };
  };
};
