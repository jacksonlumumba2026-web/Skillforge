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
  "nav.courses": "Courses",
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
  "home.exploreCourses": "Explore Courses",
  "home.startLearning": "Start Learning",
  "home.whyLearnTitle": "Why Learn Digital Skills?",
  "home.why.jobReady": "Get job-ready skills",
  "home.why.freelance": "Start freelancing",
  "home.why.business": "Build online businesses",
  "home.why.tech": "Work with modern technology",
  "home.why.income": "Create new income opportunities",
  "home.popularCoursesTitle": "Popular Courses",
  "home.browseAllCourses": "Browse all courses",

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

  "purchase.payByCard": "Pay by Card",
  "purchase.payWithMpesa": "Pay with M-Pesa",
  "purchase.or": "or",
  "purchase.haveDiscountCode": "Have a discount code?",
};

const sw: Dictionary = {
  "nav.courses": "Kozi",
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
  "home.exploreCourses": "Angalia Kozi",
  "home.startLearning": "Anza Kujifunza",
  "home.whyLearnTitle": "Kwa Nini Ujifunze Ujuzi wa Kidijitali?",
  "home.why.jobReady": "Pata ujuzi unaotafutwa kazini",
  "home.why.freelance": "Anza kufanya kazi za kujitegemea (freelance)",
  "home.why.business": "Jenga biashara mtandaoni",
  "home.why.tech": "Fanya kazi na teknolojia ya kisasa",
  "home.why.income": "Pata fursa mpya za mapato",
  "home.popularCoursesTitle": "Kozi Maarufu",
  "home.browseAllCourses": "Angalia kozi zote",

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

  "purchase.payByCard": "Lipa kwa Kadi",
  "purchase.payWithMpesa": "Lipa kwa M-Pesa",
  "purchase.or": "au",
  "purchase.haveDiscountCode": "Una msimbo wa punguzo?",
};

export const dictionaries: Record<Locale, Dictionary> = { en, sw };

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
}
