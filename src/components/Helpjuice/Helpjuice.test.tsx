import { act, render } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { Helpjuice } from './Helpjuice';

describe('Helpjuice', () => {
  beforeEach(() => {
    process.env.HELPJUICE_ORIGIN = 'https://domain.helpjuice.com';
    document.body.innerHTML = '<a id="helpjuice-contact-link">';
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
});
