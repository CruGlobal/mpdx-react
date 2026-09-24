/**
 * Single source of truth for which areas of the app an impersonator may use
 * while impersonating another user (MPDX-9771). Server-side route guards and
 * navigation hooks both consult this table.
 */

/** The role held by the impersonator, as reported by the API when it mints the impersonation token. */
export enum ImpersonatorRole {
  Developer = 'developer',
  HelpdeskAdmin = 'helpdesk_admin',
  MpdLeader = 'mpd_leader',
  HrLeader = 'hr_leader',
}

/**
 * Areas of the app whose access is decided by the impersonator's role. The HR
 * tool members' values equal the HR tool ids used by `useHrToolsNavItems`.
 */
export enum ImpersonationArea {
  Contacts = 'contacts',
  Tasks = 'tasks',
  Settings = 'settings',
  AdminConsole = 'adminConsole',
  ManageOrganizations = 'manageOrganizations',
  BackendAdmin = 'backendAdmin',
  Sidekiq = 'sidekiq',
  StaffExpenseReport = 'staffExpense',
  MpgaIncomeExpenses = 'mpgaIncomeExpenses',
  SalaryCalculator = 'salaryCalculator',
  StaffSavingFund = 'staffSavingFund',
  NsGoalCalculator = 'nsGoalCalculator',
  NsoMpdQuestionnaire = 'nsoMpdQuestionnaire',
  GoalCalculator = 'goalCalculator',
  MpdGoalAdmin = 'mpdGoalAdmin',
  MhaCalculator = 'mhaCalculator',
  AdditionalSalaryRequest = 'additionalSalaryRequest',
  PdsGoalCalculator = 'pdsGoalCalculator',
  PartnerReminders = 'partnerReminders',
  MpdSupervisorReport = 'mpdSupervisorReport',
}

const impersonatorRoles = new Set<string>(Object.values(ImpersonatorRole));

export const isImpersonatorRole = (value: unknown): value is ImpersonatorRole =>
  typeof value === 'string' && impersonatorRoles.has(value);

const accessTable: Record<ImpersonatorRole, ReadonlySet<ImpersonationArea>> = {
  [ImpersonatorRole.Developer]: new Set(Object.values(ImpersonationArea)),
  [ImpersonatorRole.HelpdeskAdmin]: new Set([
    ImpersonationArea.Contacts,
    ImpersonationArea.Tasks,
    ImpersonationArea.Settings,
  ]),
  [ImpersonatorRole.MpdLeader]: new Set([
    ImpersonationArea.NsGoalCalculator,
    ImpersonationArea.NsoMpdQuestionnaire,
    ImpersonationArea.MpdGoalAdmin,
    ImpersonationArea.PdsGoalCalculator,
    ImpersonationArea.PartnerReminders,
  ]),
  [ImpersonatorRole.HrLeader]: new Set([
    ImpersonationArea.SalaryCalculator,
    ImpersonationArea.StaffSavingFund,
    ImpersonationArea.MhaCalculator,
    ImpersonationArea.AdditionalSalaryRequest,
  ]),
};

/**
 * Whether an impersonator with the given role may use the area. An `undefined`
 * role means the impersonator is unknown and is treated as most restricted.
 */
export const canAccessWhileImpersonating = (
  role: ImpersonatorRole | undefined,
  area: ImpersonationArea,
): boolean => (role ? accessTable[role].has(area) : false);

const hrToolAreas = new Set<ImpersonationArea>([
  ImpersonationArea.SalaryCalculator,
  ImpersonationArea.StaffSavingFund,
  ImpersonationArea.NsGoalCalculator,
  ImpersonationArea.NsoMpdQuestionnaire,
  ImpersonationArea.GoalCalculator,
  ImpersonationArea.MpdGoalAdmin,
  ImpersonationArea.MhaCalculator,
  ImpersonationArea.AdditionalSalaryRequest,
  ImpersonationArea.PdsGoalCalculator,
  ImpersonationArea.PartnerReminders,
  ImpersonationArea.MpdSupervisorReport,
]);

/** Maps an HR tool id from `useHrToolsNavItems` to its area, or `undefined` for an unknown id. */
export const hrToolArea = (hrToolId: string): ImpersonationArea | undefined =>
  hrToolAreas.has(hrToolId as ImpersonationArea)
    ? (hrToolId as ImpersonationArea)
    : undefined;

/** Maps a settings nav item id from `useSettingsNavItems` to its area. */
export const settingsItemArea = (settingsItemId: string): ImpersonationArea => {
  if (settingsItemId === 'admin') {
    return ImpersonationArea.AdminConsole;
  }
  if (settingsItemId.startsWith('organizations')) {
    return ImpersonationArea.ManageOrganizations;
  }
  if (settingsItemId === '/auth/user/admin') {
    return ImpersonationArea.BackendAdmin;
  }
  if (settingsItemId === '/auth/user/sidekiq') {
    return ImpersonationArea.Sidekiq;
  }
  return ImpersonationArea.Settings;
};
