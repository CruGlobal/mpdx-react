import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { mockSession } from '__tests__/util/mockSession';
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
    writeText.mockClear();
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it('shows the summary under a level 3 heading', () => {
    const { getByRole, getByText } = render(<TestComponent card={card} />);

    expect(
      getByRole('heading', { level: 3, name: 'Summary for the help desk' }),
    ).toBeInTheDocument();
    expect(getByText(card.summary)).toBeInTheDocument();
  });

  describe('copy summary', () => {
    const failedCopy =
      'Could not copy. The summary is selected so you can copy it.';

    afterEach(() => {
      jest.useRealTimers();
      window.getSelection()?.removeAllRanges();
    });

    it('copies the summary and says Copied for a few seconds', async () => {
      jest.useFakeTimers();
      const { getByRole, findByRole } = render(<TestComponent card={card} />);

      userEvent.click(getByRole('button', { name: 'Copy summary' }));

      expect(writeText).toHaveBeenCalledWith(card.summary);
      expect(
        await findByRole('button', { name: 'Copied' }),
      ).toBeInTheDocument();
      expect(getByRole('status')).toHaveTextContent(/^Copied$/);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(getByRole('button', { name: 'Copy summary' })).toBeInTheDocument();
      expect(getByRole('status')).toBeEmptyDOMElement();
    });

    it('copies from the keyboard', async () => {
      const { getByRole, findByRole } = render(<TestComponent card={card} />);
      const button = getByRole('button', { name: 'Copy summary' });

      for (
        let press = 0;
        press < 5 && document.activeElement !== button;
        press++
      ) {
        userEvent.tab();
      }
      expect(button).toHaveFocus();
      userEvent.keyboard('{Enter}');

      expect(writeText).toHaveBeenCalledWith(card.summary);
      expect(
        await findByRole('button', { name: 'Copied' }),
      ).toBeInTheDocument();
    });

    it('selects the summary when the clipboard refuses', async () => {
      writeText.mockRejectedValueOnce(new Error('Clipboard blocked'));
      const { getByRole, queryByRole } = render(<TestComponent card={card} />);

      userEvent.click(getByRole('button', { name: 'Copy summary' }));

      await waitFor(() =>
        expect(getByRole('status')).toHaveTextContent(failedCopy),
      );
      expect(window.getSelection()?.toString()).toBe(card.summary);
      expect(queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();
    });

    it('selects the summary when there is no clipboard', async () => {
      Object.assign(navigator, { clipboard: undefined });
      const { getByRole } = render(<TestComponent card={card} />);

      userEvent.click(getByRole('button', { name: 'Copy summary' }));

      await waitFor(() =>
        expect(getByRole('status')).toHaveTextContent(failedCopy),
      );
      expect(window.getSelection()?.toString()).toBe(card.summary);
    });
  });

  it('tells the user where to paste the summary', () => {
    const { getByText } = render(<TestComponent card={card} />);

    expect(
      getByText(
        'Paste the summary into the description box on the help desk form.',
      ),
    ).toBeInTheDocument();
  });

  it('links to the contact form with the name, email, and current route', () => {
    const { getByRole } = render(<TestComponent card={card} />);

    const link = getByRole('link', { name: 'Contact the help desk' });
    expect(link).toHaveAttribute('target', '_blank');
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.origin + url.pathname).toBe(card.contact_form.url);
    expect(url.searchParams.get('mpdxName')).toBe('First Last');
    expect(url.searchParams.get('mpdxEmail')).toBe('first.last@cru.org');
    expect(url.searchParams.get('mpdxUrl')).toBe('/accountLists/1/contacts');
    expect(url.searchParams.get('mpdxSummary')).toBe(card.summary);
  });

  it('fills a blank name and email from the signed-in user', () => {
    mockSession({ name: 'Session User', email: 'session.user@cru.org' });
    const { getByRole } = render(
      <TestComponent
        card={{
          ...card,
          contact_form: { ...card.contact_form, name: '', email: '' },
        }}
      />,
    );

    const url = new URL(
      getByRole('link', { name: 'Contact the help desk' }).getAttribute(
        'href',
      ) ?? '',
    );
    expect(url.searchParams.get('mpdxName')).toBe('Session User');
    expect(url.searchParams.get('mpdxEmail')).toBe('session.user@cru.org');
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
