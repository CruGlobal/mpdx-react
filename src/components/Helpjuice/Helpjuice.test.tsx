import { act, render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import { Helpjuice } from './Helpjuice';
import { widgetHTML } from './widget.mock';

describe('Helpjuice', () => {
  beforeEach(() => {
    process.env.HELPJUICE_ORIGIN = 'https://domain.helpjuice.com';
    process.env.HELPJUICE_KNOWLEDGE_BASE_URL =
      'https://domain.helpjuice.com/kb';
    document.body.innerHTML = widgetHTML;
    location.href = 'https://example.com/';
  });

  it('adds close icon svg path', () => {
    render(<Helpjuice />);

    expect(document.querySelector('path.close')).toBeInTheDocument();
  });

  it('turns header into a link', async () => {
    render(<Helpjuice />);

    document
      .getElementsByClassName('hj-swifty')[0]
      .setAttribute('data-current-question-id', 'article-1');
    expect(
      await screen.findByRole('link', { name: 'Article Name' }),
    ).toHaveAttribute('href', 'https://domain.helpjuice.com/article-1');

    // Simulate clicking on another article, which will replace #article-content-name and change data-current-question-id
    document.getElementById('article-content-name')!.textContent =
      'Another Article Name';
    document
      .getElementsByClassName('hj-swifty')[0]
      .setAttribute('data-current-question-id', 'article-2');
    expect(
      await screen.findByRole('link', { name: 'Another Article Name' }),
    ).toHaveAttribute('href', 'https://domain.helpjuice.com/article-2');
  });

  it('makes links absolute URLs', async () => {
    render(<Helpjuice />);

    document
      .getElementsByClassName('hj-swifty')[0]
      .setAttribute('data-current-question-id', 'article-1');

    expect(
      await screen.findByRole('link', { name: 'Question Link' }),
    ).toHaveAttribute('href', 'https://domain.helpjuice.com/question/123');
    expect(screen.getByRole('link', { name: 'External Link' })).toHaveAttribute(
      'href',
      'https://google.com/',
    );
    expect(screen.getByRole('link', { name: 'Email Link' })).toHaveAttribute(
      'href',
      'mailto:test@example.com',
    );
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
