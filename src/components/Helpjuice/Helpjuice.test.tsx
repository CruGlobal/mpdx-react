import { act, render, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import { Helpjuice } from './Helpjuice';

describe('Helpjuice', () => {
  beforeEach(() => {
    process.env.HELPJUICE_ORIGIN = 'https://domain.helpjuice.com';
    process.env.HELPJUICE_KNOWLEDGE_BASE_URL =
      'https://domain.helpjuice.com/kb';
    document.body.innerHTML =
      '<a id="helpjuice-contact-link">Contact Us</a><a class="knowledge-base-link">Visit Knowledge Base</a>';
    location.href = 'https://example.com/';
  });

  it('does nothing if the element is missing', () => {
    document.body.innerHTML = '';

    render(<Helpjuice />);

    expect(
      document.getElementById('helpjuice-contact-link'),
    ).not.toBeInTheDocument();
  });

  it('does nothing if the $HELPJUICE_ORIGIN environment variable is missing', () => {
    process.env.HELPJUICE_ORIGIN = '';

    render(<Helpjuice />);

    expect(document.getElementById('helpjuice-contact-link')).toHaveProperty(
      'href',
      '',
    );
  });

  it('updates the contact link', () => {
    const { rerender } = render(<Helpjuice />);

    expect(document.getElementById('helpjuice-contact-link')).toHaveProperty(
      'href',
      'https://domain.helpjuice.com/contact-us?mpdxName=First+Last&mpdxEmail=first.last%40cru.org&mpdxUrl=https%3A%2F%2Fexample.com%2F',
    );

    // Update the session
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: {
        ...session,
        user: {
          ...session.user,
          name: 'John Doe',
          email: 'john.doe@cru.org',
        },
      },
      status: 'authenticated',
      update: () => Promise.resolve(null),
    });
    rerender(<Helpjuice />);

    expect(document.getElementById('helpjuice-contact-link')).toHaveProperty(
      'href',
      'https://domain.helpjuice.com/contact-us?mpdxName=John+Doe&mpdxEmail=john.doe%40cru.org&mpdxUrl=https%3A%2F%2Fexample.com%2F',
    );

    // Update the URL
    location.href = 'https://example.com/page';
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(document.getElementById('helpjuice-contact-link')).toHaveProperty(
      'href',
      'https://domain.helpjuice.com/contact-us?mpdxName=John+Doe&mpdxEmail=john.doe%40cru.org&mpdxUrl=https%3A%2F%2Fexample.com%2Fpage',
    );
  });

  it('omits the user data if the session is missing', () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: null,
      status: 'loading',
      update: () => Promise.resolve(null),
    });

    render(<Helpjuice />);

    expect(document.getElementById('helpjuice-contact-link')).toHaveProperty(
      'href',
      'https://domain.helpjuice.com/contact-us?mpdxUrl=https%3A%2F%2Fexample.com%2F',
    );
  });

  it('updates the knowledge base link', () => {
    render(<Helpjuice />);

    expect(document.querySelector('a.knowledge-base-link')).toHaveProperty(
      'href',
      'https://domain.helpjuice.com/kb',
    );
  });

  it('uses the Apollo client when available', async () => {
    const mutationSpy = jest.fn();
    render(
      <GqlMockedProvider<{ UserOption: UserOptionQuery }>
        mocks={{
          UserOption: {
            userOption: {
              key: 'dismissed',
              value: 'false',
            },
          },
        }}
        onCall={mutationSpy}
      >
        <Helpjuice />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UserOption'),
    );
  });
});
