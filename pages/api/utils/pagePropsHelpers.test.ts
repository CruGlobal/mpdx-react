import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { RedirectReason } from 'pages/api/auth/redirectReasonEnum';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  ImpersonationArea,
  ImpersonatorRole,
} from 'src/lib/impersonationAccess';
import {
  blockImpersonation,
  dashboardRedirect,
  enforceAdminConsole,
  ensureSessionAndAccountList,
  loginRedirect,
  makeGetServerSideProps,
} from './pagePropsHelpers';

jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

const context = {
  query: { accountListId: 'account-list-1' },
  resolvedUrl: '/page?param=value',
} as unknown as GetServerSidePropsContext;

describe('pagePropsHelpers', () => {
  describe('loginRedirect', () => {
    it('returns redirect with current URL', () => {
      expect(loginRedirect(context)).toEqual({
        redirect: {
          destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
          permanent: false,
        },
      });
    });

    it("doesn't redirect to logout", () => {
      expect(loginRedirect({ ...context, resolvedUrl: '/logout' })).toEqual({
        redirect: {
          destination: '/login',
          permanent: false,
        },
      });
    });
  });

  describe('dashboardRedirect', () => {
    it('returns redirect to dashboard page with reason', () => {
      expect(dashboardRedirect(context, RedirectReason.Unauthorized)).toEqual({
        redirect: {
          destination: '/accountLists/account-list-1?redirect=unauthorized',
          permanent: false,
        },
      });
    });
  });

  describe('enforceAdminConsole', () => {
    it('redirects to the login page if the user is not logged in', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      await expect(enforceAdminConsole(context)).resolves.toMatchObject({
        redirect: {
          destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
        },
      });
    });

    it('returns the session props if the user is an admin', async () => {
      const user = { apiToken: 'token', admin: true };
      (getSession as jest.Mock).mockResolvedValue({ user });

      await expect(enforceAdminConsole(context)).resolves.toMatchObject({
        props: { session: { user } },
      });
    });

    it('returns the session props if the user holds an impersonation role but is not an admin', async () => {
      const user = {
        apiToken: 'token',
        admin: false,
        impersonationRole: ImpersonatorRole.MpdLeader,
      };
      (getSession as jest.Mock).mockResolvedValue({ user });

      await expect(enforceAdminConsole(context)).resolves.toMatchObject({
        props: { session: { user } },
      });
    });

    it('redirects with the unauthorized reason if the user is neither an admin nor a role holder', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { apiToken: 'token', admin: false, impersonationRole: null },
      });

      await expect(enforceAdminConsole(context)).resolves.toMatchObject({
        redirect: {
          destination: '/accountLists/account-list-1?redirect=unauthorized',
        },
      });
    });

    it('redirects with the impersonation blocked reason when impersonating as a helpdesk admin', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: {
          apiToken: 'token',
          admin: true,
          impersonating: true,
          impersonatorRole: ImpersonatorRole.HelpdeskAdmin,
        },
      });

      await expect(enforceAdminConsole(context)).resolves.toMatchObject({
        redirect: {
          destination:
            '/accountLists/account-list-1?redirect=impersonation-blocked',
        },
      });
    });

    it('returns the session props when impersonating as a developer', async () => {
      const user = {
        apiToken: 'token',
        admin: true,
        impersonating: true,
        impersonatorRole: ImpersonatorRole.Developer,
      };
      (getSession as jest.Mock).mockResolvedValue({ user });

      await expect(enforceAdminConsole(context)).resolves.toMatchObject({
        props: { session: { user } },
      });
    });
  });

  describe('ensureSessionAndAccountList', () => {
    it('does not return a redirect if the user is logged in', async () => {
      const user = { apiToken: 'token' };
      (getSession as jest.Mock).mockResolvedValue({ user });

      await expect(ensureSessionAndAccountList(context)).resolves.toMatchObject(
        {
          props: {
            session: { user },
          },
        },
      );
    });

    it('returns a redirect if the user is not logged in', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      await expect(ensureSessionAndAccountList(context)).resolves.toMatchObject(
        {
          redirect: {
            destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
          },
        },
      );
    });

    describe('redirects to the default account list if the URL contains "_"', () => {
      const context = {
        resolvedUrl: '/accountLists/_/contacts',
      } as unknown as GetServerSidePropsContext;

      beforeEach(() => {
        const user = { apiToken: 'token' };
        (getSession as jest.Mock).mockResolvedValue({ user });
        const query = jest.fn().mockResolvedValueOnce({
          data: {
            user: {
              defaultAccountList: 'defaultAccountList',
            },
          },
        });
        (makeSsrClient as jest.Mock).mockReturnValue({
          query: query,
        });
      });

      it('redirects to the contacts page with default account list', async () => {
        await expect(
          ensureSessionAndAccountList(context),
        ).resolves.toMatchObject({
          redirect: {
            destination: '/accountLists/defaultAccountList/contacts',
          },
        });
      });

      it('redirects to dashboard with default account list"', async () => {
        await expect(
          ensureSessionAndAccountList({
            resolvedUrl: '/accountLists/_',
          } as unknown as GetServerSidePropsContext),
        ).resolves.toMatchObject({
          redirect: {
            destination: '/accountLists/defaultAccountList',
          },
        });
      });
    });
  });

  describe('blockImpersonation', () => {
    const blockedRedirect = {
      redirect: {
        destination:
          '/accountLists/account-list-1?redirect=impersonation-blocked',
        permanent: false,
      },
    };

    it('redirects to the login page if the user is not logged in', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        blockImpersonation(ImpersonationArea.Contacts)(context),
      ).resolves.toMatchObject({
        redirect: {
          destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
        },
      });
    });

    it.each([
      [ImpersonationArea.Contacts, ImpersonatorRole.MpdLeader, true],
      [ImpersonationArea.Contacts, ImpersonatorRole.HrLeader, true],
      [ImpersonationArea.Contacts, ImpersonatorRole.HelpdeskAdmin, false],
      [ImpersonationArea.Tasks, ImpersonatorRole.HelpdeskAdmin, false],
      [ImpersonationArea.Settings, ImpersonatorRole.HelpdeskAdmin, false],
      [ImpersonationArea.AdminConsole, ImpersonatorRole.HelpdeskAdmin, true],
      [ImpersonationArea.SalaryCalculator, ImpersonatorRole.HrLeader, false],
      [ImpersonationArea.SalaryCalculator, ImpersonatorRole.MpdLeader, true],
      [ImpersonationArea.NsGoalCalculator, ImpersonatorRole.MpdLeader, false],
      [ImpersonationArea.NsGoalCalculator, ImpersonatorRole.HrLeader, true],
      [
        ImpersonationArea.MpdSupervisorReport,
        ImpersonatorRole.HelpdeskAdmin,
        true,
      ],
      [ImpersonationArea.StaffExpenseReport, ImpersonatorRole.Developer, false],
      [
        ImpersonationArea.MpdSupervisorReport,
        ImpersonatorRole.Developer,
        false,
      ],
      [ImpersonationArea.Contacts, undefined, true],
      [ImpersonationArea.SalaryCalculator, undefined, true],
    ])(
      'area %s with impersonator role %s: blocked=%s',
      async (area, impersonatorRole, expectBlocked) => {
        const user = {
          apiToken: 'token',
          impersonating: true,
          impersonatorRole,
        };
        (getSession as jest.Mock).mockResolvedValue({ user });

        await expect(blockImpersonation(area)(context)).resolves.toEqual(
          expectBlocked ? blockedRedirect : { props: { session: { user } } },
        );
      },
    );

    it('allows access to every area if the user is not impersonating', async () => {
      const user = {
        apiToken: 'token',
        impersonating: false,
      };
      (getSession as jest.Mock).mockResolvedValue({ user });

      for (const area of Object.values(ImpersonationArea)) {
        await expect(blockImpersonation(area)(context)).resolves.toMatchObject({
          props: {
            session: { user },
          },
        });
      }
    });

    it('redirects to the default account list if the URL contains "_"', async () => {
      const user = { apiToken: 'token', impersonating: false };
      (getSession as jest.Mock).mockResolvedValue({ user });
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValueOnce({
          data: { user: { defaultAccountList: 'defaultAccountList' } },
        }),
      });

      await expect(
        blockImpersonation(ImpersonationArea.Contacts)({
          resolvedUrl: '/accountLists/_/contacts',
        } as unknown as GetServerSidePropsContext),
      ).resolves.toMatchObject({
        redirect: {
          destination: '/accountLists/defaultAccountList/contacts',
        },
      });
    });
  });

  describe('makeGetServerSideProps', () => {
    it('redirects to the login page if the session is missing', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const getServerSidePropsFromSession = jest.fn();
      const getServerSideProps = makeGetServerSideProps(
        getServerSidePropsFromSession,
      );

      await expect(getServerSideProps(context)).resolves.toEqual({
        redirect: {
          destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
          permanent: false,
        },
      });
      expect(getServerSidePropsFromSession).not.toHaveBeenCalled();
    });

    it('calls the custom function and adds the session to the returned props', async () => {
      (getSession as jest.Mock).mockResolvedValue(session);

      const getServerSidePropsFromSession = jest.fn().mockResolvedValue({
        props: {
          data1: 1,
          dataA: 'A',
        },
      });
      const getServerSideProps = makeGetServerSideProps(
        getServerSidePropsFromSession,
      );

      await expect(getServerSideProps(context)).resolves.toEqual({
        props: {
          session,
          data1: 1,
          dataA: 'A',
        },
      });
      expect(getServerSidePropsFromSession).toHaveBeenCalledWith(
        session,
        context,
      );
    });

    it('calls the custom function and passes through redirects', async () => {
      (getSession as jest.Mock).mockResolvedValue(session);

      const getServerSidePropsFromSession = jest.fn().mockResolvedValue({
        redirect: {
          destination: '/new/url',
          permanent: false,
        },
      });
      const getServerSideProps = makeGetServerSideProps(
        getServerSidePropsFromSession,
      );

      await expect(getServerSideProps(context)).resolves.toEqual({
        redirect: {
          destination: '/new/url',
          permanent: false,
        },
      });
      expect(getServerSidePropsFromSession).toHaveBeenCalledWith(
        session,
        context,
      );
    });
  });
});
