import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

interface PagePropsWithSession {
  session: Session;
}

// Return a redirect to the login page
export const loginRedirect = (
  context: GetServerSidePropsContext,
): GetServerSidePropsResult<never> => ({
  redirect: {
    destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
    permanent: false,
  },
});

// Redirect back to the dashboard if the user isn't an admin
export const enforceAdmin: GetServerSideProps<PagePropsWithSession> = async (
  context,
) => {
  const session = await getSession(context);
  if (!session?.user.admin) {
    return {
      redirect: {
        destination: `/accountLists/${context.query.accountListId ?? ''}`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};

// Redirect back to login screen if user isn't logged in
export const loadSession: GetServerSideProps<PagePropsWithSession> = async (
  context,
) => {
  const session = await getSession(context);
  if (!session?.user.apiToken) {
    return loginRedirect(context);
  }

  return {
    props: {
      session,
    },
  };
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
