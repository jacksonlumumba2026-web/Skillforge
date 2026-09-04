// Chrome-only translation (nav, buttons, forms, headlines) — not course
// content. Course titles/descriptions and lesson videos stay whatever
// language the source material is in; translating those accurately is a
// separate, much bigger project. Scope here is deliberately the handful of
// screens where a non-fluent-English reader is most likely to bail: getting
// in the door (nav, home), signing up, and paying.

export type Locale = "en" | "sw";
export const LOCALE_COOKIE = "lang";
export const DEFAULT_LOCALE: Locale = "en";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  "nav.courses": "Learning Paths",
  "nav.dashboard": "Dashboard",
  "nav.admin": "Admin",
  "nav.login": "Login",
  "nav.getStarted": "Get Started",
  "nav.logout": "Log out",

  "footer.tagline": "Practical digital skills, one lesson at a time.",
  "footer.teachWithUs": "Teach with us",
  "footer.terms": "Terms",
  "footer.refunds": "Refunds",

  "home.heroTitle": "Learn Digital Skills. Build Your Future.",
  "home.heroSubtitle":
    "Learn practical digital skills step by step through simple, structured courses designed for beginners.",
  "home.exploreCourses": "Explore Learning Paths",
  "home.startLearning": "Start Learning",
  // Every claim below is checkable against what the product actually does
  // today -- deliberately, because there is nothing else honest to say yet.
  // preview  -> lessons.is_free_preview, exposed via the lesson_previews view
  // levels   -> the levels table, populated for every published path
  // language -> this file plus components/LanguageToggle
  // data     -> components/DataSaverNote
  // oneTime  -> courses.price in KES; there is no recurring billing anywhere
  // Do NOT add "notes and a practice task on every lesson" here: 438 lessons
  // across 45 paths are still a title plus a video, so that would be false.
  "home.proofTitle": "What you actually get",
  "home.proof.preview": "Watch a full first lesson free — no account, no card",
  "home.proof.levels": "Built in levels, from zero to working professional",
  "home.proof.language": "Learn in English or Kiswahili",
  "home.proof.data": "Made for slow connections — every lesson shows its data cost",
  "home.proof.oneTime": "One payment in shillings — no subscription",
  "home.paymentLine": "Pay in Kenyan shillings — M-Pesa or card. One payment, no subscription.",
  "home.popularCoursesTitle": "Popular Learning Paths",
  "home.browseAllCourses": "Browse all Learning Paths",

  "login.title": "Log in",
  "login.subtitle": "Welcome back — keep learning where you left off.",
  "login.confirmEmail": "Check your inbox to confirm your email, then log in below.",
  "login.emailLabel": "Email",
  "login.passwordLabel": "Password",
  "login.submitting": "Logging in…",
  "login.submit": "Log in",
  "login.newHere": "New here?",
  "login.createAccount": "Create an account",

  "register.title": "Create your account",
  "register.subtitle": "Start learning practical digital skills today.",
  "register.fullNameLabel": "Full name",
  "register.emailLabel": "Email",
  "register.passwordLabel": "Password",
  "register.confirmPasswordLabel": "Confirm password",
  "register.submitting": "Creating account…",
  "register.submit": "Create account",
  "register.alreadyHaveAccount": "Already have an account?",
  "register.logIn": "Log in",

  "dashboard.welcome": "Welcome",
  "dashboard.subtitle": "Here's where you left off.",

  "purchase.payNow": "Pay Now",
  "purchase.haveDiscountCode": "Have a discount code?",
  "purchase.acceptedMethods": "Pay by M-Pesa or card on the next screen — secured by Paystack.",
};

const sw: Dictionary = {
  "nav.courses": "Njia za Kujifunza",
  "nav.dashboard": "Dashibodi",
  "nav.admin": "Msimamizi",
  "nav.login": "Ingia",
  "nav.getStarted": "Anza",
  "nav.logout": "Toka",

  "footer.tagline": "Ujuzi wa kidijitali wa vitendo, somo moja kwa wakati.",
  "footer.teachWithUs": "Fundisha nasi",
  "footer.terms": "Masharti",
  "footer.refunds": "Marejesho",

  "home.heroTitle": "Jifunze Ujuzi wa Kidijitali. Jenga Maisha Yako Ijayo.",
  "home.heroSubtitle":
    "Jifunze ujuzi wa kidijitali wa vitendo hatua kwa hatua kupitia kozi rahisi zilizoandaliwa kwa ajili ya wanaoanza.",
  "home.exploreCourses": "Angalia Njia za Kujifunza",
  "home.startLearning": "Anza Kujifunza",
  "home.proofTitle": "Unachopata Hasa",
  "home.proof.preview": "Tazama somo la kwanza zima bila malipo — bila akaunti, bila kadi",
  "home.proof.levels": "Imejengwa kwa viwango, kutoka sifuri hadi mtaalamu",
  "home.proof.language": "Jifunze kwa Kiingereza au Kiswahili",
  "home.proof.data": "Kwa mtandao wa polepole — kila somo linaonyesha kiasi cha data",
  "home.proof.oneTime": "Malipo mara moja kwa shilingi — hakuna usajili wa kila mwezi",
  "home.paymentLine": "Lipa kwa shilingi za Kenya — M-Pesa au kadi. Malipo mara moja, hakuna usajili wa kila mwezi.",
  "home.popularCoursesTitle": "Njia za Kujifunza Maarufu",
  "home.browseAllCourses": "Angalia njia zote za kujifunza",

  "login.title": "Ingia",
  "login.subtitle": "Karibu tena — endelea kujifunza pale ulipoishia.",
  "login.confirmEmail": "Angalia barua pepe yako kuthibitisha akaunti, kisha ingia hapa chini.",
  "login.emailLabel": "Barua pepe",
  "login.passwordLabel": "Nenosiri",
  "login.submitting": "Inaingia…",
  "login.submit": "Ingia",
  "login.newHere": "Mgeni hapa?",
  "login.createAccount": "Fungua akaunti",

  "register.title": "Fungua akaunti yako",
  "register.subtitle": "Anza kujifunza ujuzi wa kidijitali wa vitendo leo.",
  "register.fullNameLabel": "Jina kamili",
  "register.emailLabel": "Barua pepe",
  "register.passwordLabel": "Nenosiri",
  "register.confirmPasswordLabel": "Thibitisha nenosiri",
  "register.submitting": "Inafungua akaunti…",
  "register.submit": "Fungua akaunti",
  "register.alreadyHaveAccount": "Una akaunti tayari?",
  "register.logIn": "Ingia",

  "dashboard.welcome": "Karibu",
  "dashboard.subtitle": "Hapa ndipo ulipoishia.",

  "purchase.payNow": "Lipa Sasa",
  "purchase.haveDiscountCode": "Una msimbo wa punguzo?",
  "purchase.acceptedMethods": "Lipa kwa M-Pesa au kadi kwenye skrini inayofuata — kupitia Paystack.",
};

export const dictionaries: Record<Locale, Dictionary> = { en, sw };

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
}
