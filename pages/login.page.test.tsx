import { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession, signIn } from 'next-auth/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import Login, { LoginProps, getServerSideProps } from './login.page';

process.env.HELPJUICE_KNOWLEDGE_BASE_URL = 'help.mpdx.org';
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
        <Login {...props} />
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
      )) as GetServerSidePropsReturn;

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
      )) as GetServerSidePropsReturn;

      expect(props).toEqual({
        signInAuthProviderId: 'okta',
        immediateSignIn: false,
        isOkta: true,
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
      )) as GetServerSidePropsReturn;

      expect(props).toEqual({
        signInAuthProviderId: 'okta',
        immediateSignIn: false,
        isOkta: true,
      });
      expect(redirect).toBeUndefined();
    });

    it('should immediate sign in if cookie present', async () => {
      context.req.headers.cookie =
        'cookieOne=valueOne;mpdx-handoff.redirect-url=http://URL.org;cookieTwo=valueTwo;';
      const { props, redirect } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;

      expect(props).toEqual({
        signInAuthProviderId: 'okta',
        immediateSignIn: true,
        isOkta: true,
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
        expect(signIn).toHaveBeenCalledWith('okta');
      });
    });

    it('should have correct href on help link', async () => {
      context.req.headers.cookie =
        'cookieOne=valueOne;mpdx-handoff.redirect-url=http://URL.org;';
      const { props } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;

      const { getByRole } = render(<Components props={props} />);

      const findHelpLink = getByRole('link', {
        name: /find help/i,
      });
      await waitFor(() => {
        expect(findHelpLink).toHaveAttribute('href', 'help.mpdx.org');
      });
    });
  });

  it('renders create account help text', () => {
    const { getByText } = render(
      <Components
        props={{
          signInAuthProviderId: 'okta',
          immediateSignIn: false,
          isOkta: true,
        }}
      />,
    );

    expect(getByText(/Don't have an Okta account\?/)).toBeInTheDocument();
  });
});

// An element is on screen at a width only if neither it nor any of its
// parents is hidden with `display: none` at that width.
const isShownAtWidth = (element: Element, width: number): boolean => {
  for (
    let node: Element | null = element;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (getStyleAtWidth(node, 'display', width) === 'none') {
      return false;
    }
  }
  return true;
};

// Renders the page inside the layout it declares, the same way _app does
const PageWithLayout = ({ props }: { props: LoginProps }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <Login.layout>
        <Login {...props} />
      </Login.layout>
    </TestRouter>
  </ThemeProvider>
);

describe('Login - phone and desktop layout', () => {
  const oktaProps: LoginProps = {
    signInAuthProviderId: 'okta',
    immediateSignIn: false,
    isOkta: true,
  };

  const shownLogos = (logos: HTMLElement[], width: number) =>
    logos.filter((logo) => isShownAtWidth(logo, width));

  it('shows only one logo on phones, in the top bar', () => {
    const { getAllByAltText } = render(<PageWithLayout props={oktaProps} />);
    const logos = getAllByAltText('logo');

    [phoneWidth, 599].forEach((width) => {
      const shown = shownLogos(logos, width);
      expect(shown).toHaveLength(1);
      expect(shown[0].closest('header')).not.toBeNull();
    });
  });

  it('still shows the big logo in the page content on tablets and desktops', () => {
    const { getAllByAltText, getByRole } = render(
      <PageWithLayout props={oktaProps} />,
    );
    const logos = getAllByAltText('logo');
    const contentLogo = logos.find((logo) =>
      getByRole('main').contains(logo),
    ) as HTMLElement;

    expect(contentLogo).toHaveAttribute('height', '50');
    [600, desktopWidth].forEach((width) => {
      expect(isShownAtWidth(contentLogo, width)).toBe(true);
      expect(shownLogos(logos, width)).toHaveLength(2);
    });
  });

  it('shows the Sign In button on phones and signs in with the provider id', async () => {
    const { getByRole } = render(<PageWithLayout props={oktaProps} />);
    const signInButton = getByRole('button', { name: 'Sign In' });

    expect(isShownAtWidth(signInButton, phoneWidth)).toBe(true);
    expect(isShownAtWidth(signInButton, desktopWidth)).toBe(true);

    userEvent.click(signInButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('okta');
    });
  });

  it('signs in with a non-Okta provider id', async () => {
    process.env.API_OAUTH_VISIBLE_NAME = 'Example Login';
    const { getByRole } = render(
      <PageWithLayout
        props={{
          signInAuthProviderId: 'apioauth',
          immediateSignIn: false,
          isOkta: false,
        }}
      />,
    );

    userEvent.click(
      getByRole('button', { name: 'Sign In with Example Login' }),
    );

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('apioauth');
    });
    delete process.env.API_OAUTH_VISIBLE_NAME;
  });
});
