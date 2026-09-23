import React from 'react';
import { render } from '@testing-library/react';
import { MessageCard } from './MessageCard';

describe('MessageCard', () => {
  it('renders the figures placeholder', () => {
    const { getByText } = render(
      <MessageCard
        card={{
          kind: 'figures',
          items: [{ label: 'Monthly support', value: 1200, unit: 'USD' }],
        }}
      />,
    );

    expect(getByText('Monthly support: 1200 USD')).toBeInTheDocument();
  });

  it('renders the contact placeholder', () => {
    const { getByText } = render(
      <MessageCard card={{ kind: 'contact', contact_id: 'contact-1' }} />,
    );

    expect(getByText('Contact: contact-1')).toBeInTheDocument();
  });

  it('renders the proposed action placeholder', () => {
    const { getByText } = render(
      <MessageCard
        card={{
          kind: 'proposed_action',
          action: { type: 'log_task', params: { subject: 'Call' } },
        }}
      />,
    );

    expect(getByText('Proposed action: log_task')).toBeInTheDocument();
    expect(getByText(/"subject": "Call"/)).toBeInTheDocument();
  });

  it('renders nothing for an unknown kind', () => {
    const { container } = render(
      <MessageCard card={{ kind: 'unknown' } as never} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
