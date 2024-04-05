import { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession, signIn } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import Login, { LoginProps, getServerSideProps } from './login.page';

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
  signIn: jest.fn(),
}));

interface getServerSidePropsReturn {
  props: LoginProps;
  redirect: unknown;
}

interface ComponentsProps {
  props: LoginProps;
  mutationSpy?: () => void;
}

const Components = ({ props, mutationSpy }: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider onCall={mutationSpy}>
        <I18nextProvider i18n={i18n}>
          <Login {...props} />
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Login - OKTA', () => {
  process.env.AUTH_PROVIDER = 'OKTA';
  const setHeaderMock = jest.fn();
  const context = {
    query: {
      accountListId: 'accountListId',
    },
    res: {
      setHeader: setHeaderMock,
    },
    req: {
      headers: {
        cookie: '',
      },
    },
  } as unknown as GetServerSidePropsContext;

  beforeEach(() => {
    setHeaderMock.mockClear();
  });

  describe('Active session', () => {
    beforeEach(() => {
      (getSession as jest.Mock).mockResolvedValue({
        apiToken: 'apiToken',
      });
    });

    it('should redirect user to account list page', async () => {
      const { props, redirect } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/accountLists',
        permanent: false,
      });
    });

    it('should not redirect user to account list page if impersonate cookie present', async () => {
      context.req.headers.cookie =
        'mpdx-handoff.impersonate=11111;cookieTwo=valueTwo;';

      const { props, redirect } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      expect(props).toEqual({
        signInButtonText: 'Sign In',
        signInAuthProviderId: 'okta',
        immediateSignIn: false,
      });
      expect(redirect).toBeUndefined();
    });
  });

  describe('Inactive session', () => {
    beforeEach(() => {
      (getSession as jest.Mock).mockResolvedValue(null);
    });

    it('should pass down props and render login', async () => {
      const { props, redirect } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      expect(props).toEqual({
        signInButtonText: 'Sign In',
        signInAuthProviderId: 'okta',
        immediateSignIn: false,
      });
      expect(redirect).toBeUndefined();
    });

    it('should immediate sign in if cookie present', async () => {
      context.req.headers.cookie =
        'cookieOne=valueOne;mpdx-handoff.redirect-url=http://URL.org;cookieTwo=valueTwo;';
      const { props, redirect } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      expect(props).toEqual({
        signInButtonText: 'Sign In',
        signInAuthProviderId: 'okta',
        immediateSignIn: true,
      });
      expect(redirect).toBeUndefined();
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Set-Cookie',
        `mpdx-handoff.redirect-url=; HttpOnly; path=/; Max-Age=0`,
      );

      const { getByTestId } = render(<Components props={props} />);

      await waitFor(() => expect(getByTestId('Loading')).toBeInTheDocument());
      expect(signIn).toHaveBeenCalledWith('okta');
    });

    it('calls signin() on button click', async () => {
      context.req.headers.cookie = '';
      const { props } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      const { queryByTestId, getByRole } = render(<Components props={props} />);

      await waitFor(() =>
        expect(queryByTestId('Loading')).not.toBeInTheDocument(),
      );

      const loginButton = getByRole('button', {
        name: /sign in/i,
      });
      await waitFor(() => expect(loginButton).toBeInTheDocument());
      userEvent.click(loginButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledTimes(1);
        expect(signIn).toHaveBeenCalledWith('okta');
      });
    });

    it('should have correct href on help link', async () => {
      context.req.headers.cookie =
        'cookieOne=valueOne;mpdx-handoff.redirect-url=http://URL.org;';
      const { props } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      const { getByRole } = render(<Components props={props} />);

      const findHelpLink = getByRole('link', {
        name: /find help/i,
      });
      await waitFor(() => {
        expect(findHelpLink).toHaveAttribute('href', 'https://help.mpdx.org');
      });
    });
  });
});
