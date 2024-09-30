export type ArticleVar = keyof typeof articles;

// We are using getters so that when tests override environment variables, the changes will be picked up
export const articles = {
  get HELP_URL_COACHING_ACTIVITY() {
    return process.env.HELP_URL_COACHING_ACTIVITY;
  },
  get HELP_URL_COACHING_APPOINTMENTS_AND_RESULTS() {
    return process.env.HELP_URL_COACHING_APPOINTMENTS_AND_RESULTS;
  },
  get HELP_URL_SETUP_FIND_ORGANIZATION() {
    return process.env.HELP_URL_SETUP_FIND_ORGANIZATION;
  },
};
