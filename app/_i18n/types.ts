/**
 * Typed copy contracts for the localised surfaces.
 *
 * Every dictionary must satisfy these shapes, so a missing string is a
 * compile error rather than a blank label at runtime. Strings that
 * need interpolation use `{token}` placeholders, replaced by the
 * caller (`{name}`, `{label}`).
 */

import type { Locale } from "./locales";

export interface NavCopy {
  features: string;
  how: string;
  pricing: string;
  login: string;
  getStarted: string;
  ariaPrimary: string;
  ariaHome: string;
}

/** Marketing-site copy: `<html>` attributes plus the nav shell. */
export interface LandingCopy {
  htmlLang: string;
  dir: "ltr" | "rtl";
  nav: NavCopy;
}

export const SETTINGS_TAB_IDS = [
  "account",
  "settings",
  "usage",
  "scheduled",
  "mail",
  "data",
  "cloud",
  "computer",
  "personalization",
  "skills",
  "connectors",
  "integrations",
] as const;

export type SettingsTabId = (typeof SETTINGS_TAB_IDS)[number];

export interface DashboardCopy {
  sidebar: {
    home: string;
    newTask: string;
    agent: string;
    search: string;
    library: string;
    collapse: string;
    projects: string;
    newProject: string;
    allTasks: string;
    filterTasks: string;
    share: string;
    shareSub: string;
    settings: string;
    apps: string;
    desktop: string;
    metaBrand: string;
  };
  topbar: {
    title: string;
    credits: string;
    accountMenu: string;
  };
  composer: {
    placeholder: string;
    taskInput: string;
    attach: string;
    tools: string;
    cloudBrowser: string;
    send: string;
  };
  home: {
    greeting: string;
    /** Contains a `{name}` placeholder. */
    greetingNamed: string;
    planFree: string;
    planUpgrade: string;
    connectTools: string;
    suggestionsAria: string;
    chips: {
      essay: string;
      schoolList: string;
      odds: string;
      timeline: string;
      activities: string;
    };
    carousel: {
      ariaLabel: string;
      heading: string;
      body: string;
    };
  };
  settings: {
    userFallback: string;
    planPersonal: string;
    tabs: Record<SettingsTabId, string>;
    getHelp: string;
    close: string;
    generalEyebrow: string;
    languageLabel: string;
    appearanceLabel: string;
    followSystem: string;
    lightLabel: string;
    darkLabel: string;
    communicationEyebrow: string;
    updatesTitle: string;
    updatesSub: string;
    queueMailTitle: string;
    queueMailSub: string;
    manageCookies: string;
    manageBtn: string;
    personalizationEyebrow: string;
    nicknameLabel: string;
    nicknamePlaceholder: string;
    occupationLabel: string;
    occupationPlaceholder: string;
    aboutLabel: string;
    aboutPlaceholder: string;
    accountEyebrow: string;
    emailLabel: string;
    notSignedIn: string;
    /** Contains a `{label}` placeholder. */
    comingSoon: string;
  };
}

/** A locale's full set of translated copy. */
export interface Dictionary {
  locale: Locale;
  landing: Omit<LandingCopy, "htmlLang" | "dir">;
  dashboard: DashboardCopy;
}
