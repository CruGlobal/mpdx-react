import {
  ImpersonationArea,
  ImpersonatorRole,
  canAccessWhileImpersonating,
  hrToolArea,
  isImpersonatorRole,
  settingsItemArea,
} from './impersonationAccess';

const allAreas = Object.values(ImpersonationArea);

const hrToolAreas = [
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
];

describe('impersonationAccess', () => {
  describe('canAccessWhileImpersonating', () => {
    it('allows developers into every area', () => {
      allAreas.forEach((area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.Developer, area),
        ).toBe(true);
      });
    });

    describe('helpdesk_admin', () => {
      it.each([
        ImpersonationArea.Contacts,
        ImpersonationArea.Tasks,
        ImpersonationArea.Settings,
      ])('allows %s', (area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.HelpdeskAdmin, area),
        ).toBe(true);
      });

      it.each([
        ImpersonationArea.AdminConsole,
        ImpersonationArea.ManageOrganizations,
        ImpersonationArea.BackendAdmin,
        ImpersonationArea.Sidekiq,
        ImpersonationArea.StaffExpenseReport,
        ImpersonationArea.MpgaIncomeExpenses,
        ...hrToolAreas,
      ])('blocks %s', (area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.HelpdeskAdmin, area),
        ).toBe(false);
      });
    });

    describe('mpd_leader', () => {
      it.each([
        ImpersonationArea.NsGoalCalculator,
        ImpersonationArea.NsoMpdQuestionnaire,
        ImpersonationArea.MpdGoalAdmin,
        ImpersonationArea.PdsGoalCalculator,
        ImpersonationArea.PartnerReminders,
      ])('allows %s', (area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.MpdLeader, area),
        ).toBe(true);
      });

      it.each([
        ImpersonationArea.Contacts,
        ImpersonationArea.Tasks,
        ImpersonationArea.Settings,
        ImpersonationArea.AdminConsole,
        ImpersonationArea.ManageOrganizations,
        ImpersonationArea.BackendAdmin,
        ImpersonationArea.Sidekiq,
        ImpersonationArea.StaffExpenseReport,
        ImpersonationArea.MpgaIncomeExpenses,
        ImpersonationArea.SalaryCalculator,
        ImpersonationArea.StaffSavingFund,
        ImpersonationArea.MhaCalculator,
        ImpersonationArea.AdditionalSalaryRequest,
        ImpersonationArea.GoalCalculator,
        ImpersonationArea.MpdSupervisorReport,
      ])('blocks %s', (area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.MpdLeader, area),
        ).toBe(false);
      });
    });

    describe('hr_leader', () => {
      it.each([
        ImpersonationArea.SalaryCalculator,
        ImpersonationArea.StaffSavingFund,
        ImpersonationArea.MhaCalculator,
        ImpersonationArea.AdditionalSalaryRequest,
      ])('allows %s', (area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.HrLeader, area),
        ).toBe(true);
      });

      it.each([
        ImpersonationArea.Contacts,
        ImpersonationArea.Tasks,
        ImpersonationArea.Settings,
        ImpersonationArea.AdminConsole,
        ImpersonationArea.ManageOrganizations,
        ImpersonationArea.BackendAdmin,
        ImpersonationArea.Sidekiq,
        ImpersonationArea.StaffExpenseReport,
        ImpersonationArea.MpgaIncomeExpenses,
        ImpersonationArea.NsGoalCalculator,
        ImpersonationArea.NsoMpdQuestionnaire,
        ImpersonationArea.MpdGoalAdmin,
        ImpersonationArea.PdsGoalCalculator,
        ImpersonationArea.PartnerReminders,
        ImpersonationArea.GoalCalculator,
        ImpersonationArea.MpdSupervisorReport,
      ])('blocks %s', (area) => {
        expect(
          canAccessWhileImpersonating(ImpersonatorRole.HrLeader, area),
        ).toBe(false);
      });
    });

    it('blocks an unknown impersonator from every area', () => {
      allAreas.forEach((area) => {
        expect(canAccessWhileImpersonating(undefined, area)).toBe(false);
      });
    });
  });

  describe('isImpersonatorRole', () => {
    it.each(Object.values(ImpersonatorRole))('accepts %s', (role) => {
      expect(isImpersonatorRole(role)).toBe(true);
    });

    it.each([
      'bogus',
      undefined,
      null,
      '',
      'DEVELOPER',
      0,
      { role: 'developer' },
    ])('rejects %p', (value) => {
      expect(isImpersonatorRole(value)).toBe(false);
    });
  });

  describe('hrToolArea', () => {
    it.each([
      ['salaryCalculator', ImpersonationArea.SalaryCalculator],
      ['staffSavingFund', ImpersonationArea.StaffSavingFund],
      ['nsGoalCalculator', ImpersonationArea.NsGoalCalculator],
      ['nsoMpdQuestionnaire', ImpersonationArea.NsoMpdQuestionnaire],
      ['goalCalculator', ImpersonationArea.GoalCalculator],
      ['mpdGoalAdmin', ImpersonationArea.MpdGoalAdmin],
      ['mhaCalculator', ImpersonationArea.MhaCalculator],
      ['additionalSalaryRequest', ImpersonationArea.AdditionalSalaryRequest],
      ['pdsGoalCalculator', ImpersonationArea.PdsGoalCalculator],
      ['partnerReminders', ImpersonationArea.PartnerReminders],
      ['mpdSupervisorReport', ImpersonationArea.MpdSupervisorReport],
    ])('maps %s', (id, area) => {
      expect(hrToolArea(id)).toBe(area);
    });

    it.each(['x', '', 'contacts', 'settings', 'admin'])(
      'returns undefined for %p',
      (id) => {
        expect(hrToolArea(id)).toBeUndefined();
      },
    );
  });

  describe('settingsItemArea', () => {
    it.each([
      ['admin', ImpersonationArea.AdminConsole],
      ['organizations', ImpersonationArea.ManageOrganizations],
      ['organizations/accountLists', ImpersonationArea.ManageOrganizations],
      ['organizations/contacts', ImpersonationArea.ManageOrganizations],
      ['/auth/user/admin', ImpersonationArea.BackendAdmin],
      ['/auth/user/sidekiq', ImpersonationArea.Sidekiq],
      ['preferences', ImpersonationArea.Settings],
      ['notifications', ImpersonationArea.Settings],
      ['integrations', ImpersonationArea.Settings],
      ['manageAccounts', ImpersonationArea.Settings],
      ['manageCoaches', ImpersonationArea.Settings],
      ['somethingNew', ImpersonationArea.Settings],
    ])('maps %s', (id, area) => {
      expect(settingsItemArea(id)).toBe(area);
    });
  });
});
