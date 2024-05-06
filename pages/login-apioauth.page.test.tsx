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

interface GetServerSidePropsReturn {
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

describe('Login - API_OAUTH', () => {
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

  process.env.AUTH_PROVIDER = 'API_OAUTH';
  process.env.API_OAUTH_VISIBLE_NAME = 'Third-party oAuth';

  it('should pass down props and render login', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const { props, redirect } = (await getServerSideProps(
      context,
    )) as GetServerSidePropsReturn;

    expect(props).toEqual({
      signInButtonText: 'Sign In with Third-party oAuth',
      signInAuthProviderId: 'apioauth',
      immediateSignIn: false,
    });
    expect(redirect).toBeUndefined();
  });

  it('should immediate Sign In if cookie present', async () => {
    context.req.headers.cookie =
      'cookieOne=valueOne;mpdx-handoff.redirect-url=http://URL.org;cookieTwo=valueTwo;';
    const { props, redirect } = (await getServerSideProps(
      context,
    )) as GetServerSidePropsReturn;

    expect(props).toEqual({
      signInButtonText: 'Sign In with Third-party oAuth',
      signInAuthProviderId: 'apioauth',
      immediateSignIn: true,
    });
    expect(redirect).toBeUndefined();
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Set-Cookie',
      `mpdx-handoff.redirect-url=; HttpOnly; path=/; Max-Age=0`,
    );

    const { getByTestId } = render(<Components props={props} />);

    await waitFor(() => expect(getByTestId('Loading')).toBeInTheDocument());
    expect(signIn).toHaveBeenCalledWith('apioauth');
  });

  it('calls signin on button click', async () => {
    context.req.headers.cookie = '';
    const { props } = (await getServerSideProps(
      context,
    )) as GetServerSidePropsReturn;

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
      expect(signIn).toHaveBeenCalledWith('apioauth');
    });
  });
});
