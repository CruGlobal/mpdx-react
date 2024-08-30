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
    return {
      redirect: {
        destination: '/login',
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

// It is a common pattern in getServerSideProps to need to first extract the API
// token from the session, redirect to the login page if the API token is
// missing, then use the API token to do custom logic and eventually return the
// page props. This helper eliminates some of that boilerplate. Use it like this:
//
// export const getServerSideProps = makeGetServerSideProps<PageProps>(async (session) => {
//   const ssrClient = makeSsrClient(session.user.apiToken);
//   // Use the ssrClient
//   return {
//     props: {
//       pageData,
//     },
//   };
// })
export const makeGetServerSideProps = <PageProps = Record<string, unknown>>(
  getServerSidePropsFromSession: (
    session: Session,
    context: GetServerSidePropsContext,
  ) => Promise<GetServerSidePropsResult<PageProps>>,
): GetServerSideProps<PageProps & PagePropsWithSession> => {
  // Return a getServerSideProps method
  return async (context) => {
    // Start by loading the session and redirecting if it is missing
    const session = await getSession(context);
    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Pass the session off to the page's custom logic to build out the page props
    const result = await getServerSidePropsFromSession(session, context);
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
      // Pass redirects and not found results through without modification
      return result;
    }
  };
};
