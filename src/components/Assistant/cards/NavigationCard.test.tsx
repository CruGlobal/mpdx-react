import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationCard } from './NavigationCard';

describe('NavigationCard', () => {
  it('calls onNavigate with the intent when clicked', () => {
    const onNavigate = jest.fn();
    const intent = { type: 'contact', params: { contactId: 'contact-1' } };
    const { getByRole } = render(
      <NavigationCard
        card={{ kind: 'navigation', intent, label: 'Open John Doe' }}
        onNavigate={onNavigate}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Open John Doe' }));

    expect(onNavigate).toHaveBeenCalledWith(intent);
  });
});
