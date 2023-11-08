import { render } from '@testing-library/react';
import { CollapsibleEmailList } from './CollapsibleEmailList';

describe('CollapsibleEmailList', () => {
  it('renders the primary email address and location', () => {
    const { getByTestId } = render(
      <CollapsibleEmailList
        emails={[
          {
            id: 'email-1',
            primary: false,
            email: 'example1@example.com',
            location: null,
          },
          {
            id: 'email-2',
            primary: true,
            email: 'example2@example.com',
            location: 'Home',
          },
        ]}
      />,
    );

    expect(getByTestId('EmailAddress')).toHaveTextContent(
      'example2@example.com - Home',
    );
    expect(getByTestId('ExpandMoreIcon')).toBeInTheDocument();
  });

  it('renders the first email address if none are primary', () => {
    const { getByTestId, getByText } = render(
      <CollapsibleEmailList
        emails={[
          {
            id: 'email-1',
            primary: false,
            email: 'example1@example.com',
            location: null,
          },
          {
            id: 'email-2',
            primary: false,
            email: 'example2@example.com',
            location: 'Home',
          },
        ]}
      />,
    );

    expect(getByText('example1@example.com')).toBeInTheDocument();
    expect(getByTestId('ExpandMoreIcon')).toBeInTheDocument();
  });

  it('renders missing email locations', () => {
    const { getByTestId } = render(
      <CollapsibleEmailList
        emails={[
          {
            id: 'email-1',
            primary: false,
            email: 'example1@example.com',
            location: null,
          },
        ]}
      />,
    );

    expect(getByTestId('EmailAddress')).toHaveTextContent(
      'example1@example.com',
    );
  });

  it('hides the toggle when there are zero emails', () => {
    const { queryByTestId } = render(<CollapsibleEmailList emails={[]} />);

    expect(queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
  });

  it('hides the toggle when there is only one email', () => {
    const { queryByTestId } = render(
      <CollapsibleEmailList
        emails={[
          {
            id: 'email-1',
            primary: false,
            email: 'example1@example.com',
            location: null,
          },
        ]}
      />,
    );

    expect(queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
  });
});
