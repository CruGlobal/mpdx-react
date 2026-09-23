import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HandoffCardData } from '../types';
import { HandoffCard } from './HandoffCard';

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
    location.href = 'https://example.com/accountLists/1';
  });

  it('shows the summary', () => {
    const { getByText } = render(<HandoffCard card={card} />);

    expect(getByText(card.summary)).toBeInTheDocument();
  });

  it('copies the summary', async () => {
    const { getByRole, getByText } = render(<HandoffCard card={card} />);

    userEvent.click(getByRole('button', { name: 'Copy summary' }));

    expect(writeText).toHaveBeenCalledWith(card.summary);
    await waitFor(() => expect(getByText('Copied')).toBeInTheDocument());
  });

  it('shows a fallback when copying fails', async () => {
    writeText.mockRejectedValueOnce(new Error('Clipboard blocked'));
    const { getByRole, findByText, queryByText } = render(
      <HandoffCard card={card} />,
    );

    userEvent.click(getByRole('button', { name: 'Copy summary' }));

    expect(await findByText('Copy failed')).toBeInTheDocument();
    expect(queryByText('Copied')).not.toBeInTheDocument();
  });

  it('links to the contact form with the name, email, and page url', () => {
    const { getByRole } = render(<HandoffCard card={card} />);

    const link = getByRole('link', { name: 'Contact the help desk' });
    expect(link).toHaveAttribute('target', '_blank');
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.origin + url.pathname).toBe(card.contact_form.url);
    expect(url.searchParams.get('mpdxName')).toBe('First Last');
    expect(url.searchParams.get('mpdxEmail')).toBe('first.last@cru.org');
    expect(url.searchParams.get('mpdxUrl')).toBe(
      'https://example.com/accountLists/1',
    );
  });

  it('hides the link when the contact form url is not http', () => {
    const { queryByRole } = render(
      <HandoffCard
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
