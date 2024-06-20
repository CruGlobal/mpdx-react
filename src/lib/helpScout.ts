export interface BeaconFn {
  (method: string, options?: unknown, data?: unknown): void;
  readyQueue?: unknown[];
}

declare global {
  interface Window {
    Beacon: BeaconFn | undefined;
  }
}

// Create the beacon stub that will be used until the real HelpScout beacon loads
const readyQueue: unknown[] = [];
const beacon = (method: string, options?: unknown, data?: unknown) => {
  readyQueue.push({ method, options, data });
};
beacon.readyQueue = readyQueue;

export const initBeacon = () => {
  if (!window.Beacon) {
    window.Beacon = beacon;
  }
  callBeacon('init', process.env.BEACON_TOKEN);
};

export const callBeacon = (name: string, options?: unknown) => {
  if (!window.Beacon) {
    return;
  }

  window.Beacon(name, options);
};

export const identifyUser = (id: string, email: string, name: string) => {
  callBeacon('identify', {
    id,
    email,
    name,
  });
};

export type SuggestionsVar = keyof typeof suggestions;

export const suggestArticles = (envVar: SuggestionsVar) => {
  const articleIds = suggestions[envVar];
  callBeacon('suggest', articleIds?.split(',') ?? []);
};

export type ArticleVar = keyof typeof articles;

export const showArticle = (envVar: ArticleVar) => {
  const articleId = articles[envVar];
  if (articleId) {
    callBeacon('article', articleId);
  } else {
    callBeacon('open');
  }
};

// We are using getters so that when tests override environment variables, the changes will be picked up
const suggestions = {
  get HS_COACHING_SUGGESTIONS() {
    return process.env.HS_COACHING_SUGGESTIONS;
  },
  get HS_CONTACTS_CONTACT_SUGGESTIONS() {
    return process.env.HS_CONTACTS_CONTACT_SUGGESTIONS;
  },
  get HS_CONTACTS_SUGGESTIONS() {
    return process.env.HS_CONTACTS_SUGGESTIONS;
  },
  get HS_HOME_SUGGESTIONS() {
    return process.env.HS_HOME_SUGGESTIONS;
  },
  get HS_REPORTS_SUGGESTIONS() {
    return process.env.HS_REPORTS_SUGGESTIONS;
  },
  get HS_TASKS_SUGGESTIONS() {
    return process.env.HS_TASKS_SUGGESTIONS;
  },
  get HS_SETTINGS_SERVICES_SUGGESTIONS() {
    return process.env.HS_SETTINGS_SERVICES_SUGGESTIONS;
  },
  get HS_SETTINGS_PREFERENCES_SUGGESTIONS() {
    return process.env.HS_SETTINGS_PREFERENCES_SUGGESTIONS;
  },
};

export const articles = {
  get HS_SETUP_FIND_ORGANIZATION() {
    return process.env.HS_SETUP_FIND_ORGANIZATION;
  },
  get HS_COACHING_ACTIVITY() {
    return process.env.HS_COACHING_ACTIVITY;
  },
  get HS_COACHING_ACTIVITY_SUMMARY() {
    return process.env.HS_COACHING_ACTIVITY_SUMMARY;
  },
  get HS_COACHING_APPOINTMENTS_AND_RESULTS() {
    return process.env.HS_COACHING_APPOINTMENTS_AND_RESULTS;
  },
  get HS_COACHING_COMMITMENTS() {
    return process.env.HS_COACHING_COMMITMENTS;
  },
  get HS_COACHING_OUTSTANDING_RECURRING_COMMITMENTS() {
    return process.env.HS_COACHING_OUTSTANDING_RECURRING_COMMITMENTS;
  },
  get HS_COACHING_OUTSTANDING_SPECIAL_NEEDS() {
    return process.env.HS_COACHING_OUTSTANDING_SPECIAL_NEEDS;
  },
};
