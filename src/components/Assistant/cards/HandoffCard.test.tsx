import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { HandoffCardData } from '../types';
import { HandoffCard } from './HandoffCard';

const TestComponent: React.FC<{ card: HandoffCardData }> = ({ card }) => (
  <TestRouter router={{ asPath: '/accountLists/1/contacts' }}>
    <HandoffCard card={card} />
  </TestRouter>
);

const card: HandoffCardData = {
  kind: 'handoff',
  summary: 'The user cannot find their donations.',
  contact_form: {
    name: 'First Last',
    email: 'first.last@cru.org',
    url: 'https://domain.helpjuice.com/contact-us',
  },
};

describe('HandoffCard', () => {
  const writeText = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it('shows the summary under a level 3 heading', () => {
    const { getByRole, getByText } = render(<TestComponent card={card} />);

    expect(
      getByRole('heading', { level: 3, name: 'Summary for the help desk' }),
    ).toBeInTheDocument();
    expect(getByText(card.summary)).toBeInTheDocument();
  });

  it('copies the summary', async () => {
    const { getByRole, getByText } = render(<TestComponent card={card} />);

    userEvent.click(getByRole('button', { name: 'Copy summary' }));

    expect(writeText).toHaveBeenCalledWith(card.summary);
    await waitFor(() => expect(getByText('Copied')).toBeInTheDocument());
  });

  it('shows a fallback when copying fails', async () => {
    writeText.mockRejectedValueOnce(new Error('Clipboard blocked'));
    const { getByRole, findByText, queryByText } = render(
      <TestComponent card={card} />,
    );

    userEvent.click(getByRole('button', { name: 'Copy summary' }));

    expect(await findByText('Copy failed')).toBeInTheDocument();
    expect(queryByText('Copied')).not.toBeInTheDocument();
  });

  it('links to the contact form with the name, email, and current route', () => {
    const { getByRole } = render(<TestComponent card={card} />);

    const link = getByRole('link', { name: 'Contact the help desk' });
    expect(link).toHaveAttribute('target', '_blank');
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.origin + url.pathname).toBe(card.contact_form.url);
    expect(url.searchParams.get('mpdxName')).toBe('First Last');
    expect(url.searchParams.get('mpdxEmail')).toBe('first.last@cru.org');
    expect(url.searchParams.get('mpdxUrl')).toBe(
      'http://localhost/accountLists/1/contacts',
    );
  });

  it('hides the link when the contact form url is not http', () => {
    const { queryByRole } = render(
      <TestComponent
        card={{
          ...card,
          contact_form: { ...card.contact_form, url: 'javascript:alert(1)' },
        }}
      />,
    );

    expect(
      queryByRole('link', { name: 'Contact the help desk' }),
    ).not.toBeInTheDocument();
  });
});
