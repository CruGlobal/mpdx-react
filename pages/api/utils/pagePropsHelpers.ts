import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  Redirect,
} from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { RedirectReason } from 'pages/api/auth/redirectReasonEnum';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  ImpersonationArea,
  canAccessWhileImpersonating,
} from 'src/lib/impersonationAccess';
import {
  GetDefaultAccountDocument,
  GetDefaultAccountQuery,
} from '../getDefaultAccount.generated';

interface PagePropsWithSession {
  session: Session;
}

// Return a redirect to the login page
export const loginRedirect = (
  context: GetServerSidePropsContext,
): { redirect: Redirect } => ({
  redirect: {
    destination: `/login${
      context.resolvedUrl !== '/logout'
        ? `?redirect=${encodeURIComponent(context.resolvedUrl)}`
        : ''
    }`,
    permanent: false,
  },
});

export const dashboardRedirect = (
  context: GetServerSidePropsContext,
  reason: RedirectReason,
): { redirect: Redirect } => ({
  redirect: {
    destination: `/accountLists/${context.query.accountListId ?? ''}?redirect=${encodeURIComponent(reason)}`,
    permanent: false,
  },
});

/**
 * Guard a page by the impersonator's role. Users on their own account are
 * always allowed; while impersonating, the impersonator's role must be allowed
 * to use the area (see `src/lib/impersonationAccess.ts`), otherwise the user is
 * redirected to the dashboard.
 *
 * Usage: `export const getServerSideProps = blockImpersonation(ImpersonationArea.Contacts);`
 */
export const blockImpersonation =
  (area: ImpersonationArea): GetServerSideProps<PagePropsWithSession> =>
  async (context) => {
    const session = await getSession(context);

    if (!session?.user.apiToken) {
      return loginRedirect(context);
    }

    if (
      session.user.impersonating &&
      !canAccessWhileImpersonating(session.user.impersonatorRole, area)
    ) {
      return dashboardRedirect(context, RedirectReason.ImpersonationBlocked);
    }

    const underscoreRedirect = await handleUnderscoreAccountListRedirect(
      session,
      context.resolvedUrl,
    );
    if (underscoreRedirect) {
      return underscoreRedirect;
    }

    return {
      props: {
        session,
      },
    };
  };

/**
 * Guard the Admin Console. Admins and users who hold an impersonation role (so
 * they can start impersonating) may reach it; while impersonating, only
 * impersonators whose role allows the Admin Console may.
 */
export const enforceAdminConsole: GetServerSideProps<
  PagePropsWithSession
> = async (context) => {
  const session = await getSession(context);

  if (!session?.user.apiToken) {
    return loginRedirect(context);
  }

  if (!session.user.admin && !session.user.impersonationRole) {
    return dashboardRedirect(context, RedirectReason.Unauthorized);
  }

  if (
    session.user.impersonating &&
    !canAccessWhileImpersonating(
      session.user.impersonatorRole,
      ImpersonationArea.AdminConsole,
    )
  ) {
    return dashboardRedirect(context, RedirectReason.ImpersonationBlocked);
  }

  const underscoreRedirect = await handleUnderscoreAccountListRedirect(
    session,
    context.resolvedUrl,
  );
  if (underscoreRedirect) {
    return underscoreRedirect;
  }

  return {
    props: {
      session,
    },
  };
};

// Redirect back to login screen if user isn't logged in
export const ensureSessionAndAccountList: GetServerSideProps<
  PagePropsWithSession
> = async (context) => {
  const session = await getSession(context);
  if (!session?.user.apiToken) {
    return loginRedirect(context);
  }

  const underscoreRedirect = await handleUnderscoreAccountListRedirect(
    session,
    context.resolvedUrl,
  );
  if (underscoreRedirect) {
    return underscoreRedirect;
  }

  return {
    props: {
      session,
    },
  };
};

export const handleUnderscoreAccountListRedirect = async (
  session: Session,
  url: string,
): Promise<{ redirect: Redirect } | undefined> => {
  if (url.startsWith('/accountLists/_')) {
    // Redirect to the default account list if the "_" is where the account list ID would be in the URL
    // This is a common pattern in our app, so we handle it here to avoid repeating
    const ssrClient = makeSsrClient(session.user.apiToken);
    const { data } = await ssrClient.query<GetDefaultAccountQuery>({
      query: GetDefaultAccountDocument,
    });

    if (data.user.defaultAccountList) {
      return {
        redirect: {
          destination: url.replace(
            '/accountLists/_',
            `/accountLists/${data.user.defaultAccountList}`,
          ),
          permanent: false,
        },
      };
    }
  }
};

/**
 * It is a common pattern in `getServerSideProps` to need to first extract the
 * API token from the session, redirect to the login page if the API token is
 * missing, then use the API token to do custom logic and eventually return the
 * page props. This helper eliminates some of that boilerplate.
 *
 * Calling this function doesn't return the page props directly, it returns a
 * `getServerSideProps` function. That returned `getServerSideProps` function is
 * a wrapper around the function you pass into `makeGetServerSideProps`. The
 * wrapper extracts the session, redirects to the login page if the session is
 * invalid, and passes the session along to the function you pass into
 * `makeGetServerSideProps` to run your custom logic.
 *
 * When the page is rendered, this is the flow:
 *
 * 1. Next.js calls the closure returned from `makeGetServerSideProps`
 * 2. That closure extracts the session
 * 3. If the session is valid, it calls the `getServerSidePropsFromSession`
 *    passed to `makeGetServerSideProps`
 * 4. The closure takes the props returned from `getServerSidePropsFromSession`,
 *    adds the `session` to them, and returns the combined props to Next.js,
 *    which it uses to render the page
 *
 * Usage:
 *
 * ```
 * export const getServerSideProps = makeGetServerSideProps<PageProps>(async (session) => {
 *   const ssrClient = makeSsrClient(session.user.apiToken);
 *
 *   // Use the ssrClient to generate the pageData...
 *
 *   return {
 *     props: {
 *       pageData,
 *     },
 *   };
 * });
 * ```
 */
export const makeGetServerSideProps = <PageProps = Record<string, unknown>>(
  // Every time the page is rendered, this function will be called with the session
  // It should use the session to return the props needed to render the page
  getServerSidePropsFromSession: (
    session: Session,
    context: GetServerSidePropsContext,
  ) => Promise<GetServerSidePropsResult<PageProps>>,
): GetServerSideProps<PageProps & PagePropsWithSession> => {
  // Return a getServerSideProps method
  return async (context) => {
    // Start by loading the session and redirecting to the login page if it is missing
    const session = await getSession(context);
    if (!session) {
      return loginRedirect(context);
    }

    // Pass the session to the page's custom logic to generate the page props
    const result = await getServerSidePropsFromSession(session, context);

    // If the page's custom logic returned props, add the session to them.
    // _app.page.tsx will use the session to initialize <SessionProvider>.
    if ('props' in result) {
      // Add the session to the returned props
      return {
        props: {
          session,
          // Props can either be a promise or the actual props
          ...(result.props instanceof Promise
            ? await result.props
            : result.props),
        },
      };
    } else {
      // The custom logic returned a redirect or a not found response, so we
      // return that response without modification. We don't need to add the
      // session to the props.
      return result;
    }
  };
};
