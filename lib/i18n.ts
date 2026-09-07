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
  "footer.blurb": "Practical digital skills for Kenyan learners. Built light so it works on any phone.",
  "footer.learn": "Learn",
  "footer.company": "Company",
  "footer.allPaths": "All Learning Paths",
  "footer.teachWithUs": "Teach with us",
  "footer.terms": "Terms",
  "footer.refunds": "Refunds",

  "home.heroBadge": "Made in Kenya, for Kenyan phones",
  "home.heroTitle": "Learn a skill that pays.",
  "home.heroTitleAccent": "KSh {price} a path.",
  "home.heroSubtitle":
    "Short video lessons in coding, freelancing, design, marketing and everyday work tools. Watch the first lesson free, pay once, and keep the path for life.",
  "home.browsePaths": "Browse {count} Learning Paths",
  "home.bundleCta": "Any {count} for KSh {price}",
  // Every claim below is checkable against what the product actually does
  // today -- deliberately, because there is nothing else honest to say yet.
  // payOnce    -> courses.price in KES; there is no recurring billing anywhere
  // data       -> components/DataSaverNote, shown on every path and lesson
  // freeLesson -> lessons.is_free_preview, exposed via the lesson_previews view
  // beginner   -> courses.level, and the levels table on every published path
  // Do NOT add "notes and a practice task on every lesson" here: 438 lessons
  // are still a title plus a video, and the course card now says so per path.
  "home.value.payOnce": "Pay once",
  "home.value.payOnceBody": "No subscription. KSh {price} buys a path for life.",
  "home.value.data": "Light on data",
  "home.value.dataBody": "Every lesson shows its data cost first.",
  "home.value.freeLesson": "Free first lesson",
  "home.value.freeLessonBody": "Judge the teaching before you pay.",
  "home.value.beginner": "Beginner friendly",
  "home.value.beginnerBody": "Plain language, step by step.",
  "home.popularTitle": "Start with a popular path",
  "home.seeAllPaths": "See all Learning Paths",
  "home.browseByArea": "Browse by area",

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
  "footer.blurb": "Ujuzi wa kidijitali wa vitendo kwa wanafunzi wa Kenya. Imejengwa nyepesi ili ifanye kazi kwenye simu yoyote.",
  "footer.learn": "Jifunze",
  "footer.company": "Kampuni",
  "footer.allPaths": "Njia zote za kujifunza",
  "footer.teachWithUs": "Fundisha nasi",
  "footer.terms": "Masharti",
  "footer.refunds": "Marejesho",

  "home.heroBadge": "Imetengenezwa Kenya, kwa simu za Kenya",
  "home.heroTitle": "Jifunze ujuzi unaolipa.",
  "home.heroTitleAccent": "KSh {price} kwa njia.",
  "home.heroSubtitle":
    "Masomo mafupi ya video kuhusu upangaji programu, kazi za kujitegemea, ubunifu, masoko na zana za kazi za kila siku. Tazama somo la kwanza bila malipo, lipa mara moja, na uweke njia yako milele.",
  "home.browsePaths": "Angalia Njia {count} za Kujifunza",
  "home.bundleCta": "Yoyote {count} kwa KSh {price}",
  "home.value.payOnce": "Lipa mara moja",
  "home.value.payOnceBody": "Hakuna usajili wa kila mwezi. KSh {price} inanunua njia milele.",
  "home.value.data": "Data kidogo",
  "home.value.dataBody": "Kila somo linaonyesha gharama ya data kwanza.",
  "home.value.freeLesson": "Somo la kwanza bure",
  "home.value.freeLessonBody": "Pima ufundishaji kabla ya kulipa.",
  "home.value.beginner": "Rahisi kwa wanaoanza",
  "home.value.beginnerBody": "Lugha rahisi, hatua kwa hatua.",
  "home.popularTitle": "Anza na njia maarufu",
  "home.seeAllPaths": "Angalia njia zote za kujifunza",
  "home.browseByArea": "Vinjari kwa eneo",

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

/**
 * Translate, then fill {name} placeholders. Sentences with a number in them
 * stay as one string per language, so the translator controls word order —
 * concatenating fragments in JSX produces English word order in Swahili.
 */
export function tf(locale: Locale, key: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (out, [name, value]) => out.replaceAll(`{${name}}`, String(value)),
    t(locale, key),
  );
}
