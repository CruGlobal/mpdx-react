import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import { NewsletterSelect } from './NewsletterSelect';

describe('NewsletterSelect', () => {
  it('should render a Select with a valid NewsletterEnum option', async () => {
    const { getByRole, getByText } = render(
      <NewsletterSelect value="" onChange={() => {}} />,
    );
    await userEvent.click(getByRole('combobox'));
    expect(getByText('Both')).toBeInTheDocument();
  });

  it('should pass props to Select and show selected value', () => {
    const { getByTestId, getByText } = render(
      <NewsletterSelect
        value={SendNewsletterEnum.Both}
        onChange={() => {}}
        data-testid="newsletter-select"
      />,
    );
    expect(getByTestId('newsletter-select')).toBeInTheDocument();
    expect(getByText('Both')).toBeInTheDocument();
  });
});
