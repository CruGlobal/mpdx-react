import { render } from '@testing-library/react';
import { CollapsiblePhoneList } from './CollapsiblePhoneList';

describe('CollapsiblePhoneList', () => {
  it('renders the primary phone address and location', () => {
    const { getByTestId } = render(
      <CollapsiblePhoneList
        phones={[
          {
            id: 'phone-1',
            primary: false,
            number: '111-111-1111',
            location: null,
          },
          {
            id: 'phone-2',
            primary: true,
            number: '222-222-2222',
            location: 'Home',
          },
        ]}
      />,
    );

    expect(getByTestId('PhoneNumber')).toHaveTextContent('222-222-2222 - Home');
    expect(getByTestId('ExpandMoreIcon')).toBeInTheDocument();
  });

  it('renders the first phone address if none are primary', () => {
    const { getByTestId, getByText } = render(
      <CollapsiblePhoneList
        phones={[
          {
            id: 'phone-1',
            primary: false,
            number: '111-111-1111',
            location: null,
          },
          {
            id: 'phone-2',
            primary: false,
            number: '222-222-2222',
            location: 'Home',
          },
        ]}
      />,
    );

    expect(getByText('111-111-1111')).toBeInTheDocument();
    expect(getByTestId('ExpandMoreIcon')).toBeInTheDocument();
  });

  it('renders missing phone locations', () => {
    const { getByTestId } = render(
      <CollapsiblePhoneList
        phones={[
          {
            id: 'phone-1',
            primary: false,
            number: '111-111-1111',
            location: null,
          },
        ]}
      />,
    );

    expect(getByTestId('PhoneNumber')).toHaveTextContent('111-111-1111');
  });

  it('hides the toggle when there are zero phones', () => {
    const { queryByTestId } = render(<CollapsiblePhoneList phones={[]} />);

    expect(queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
  });

  it('hides the toggle when there is only one phone', () => {
    const { queryByTestId } = render(
      <CollapsiblePhoneList
        phones={[
          {
            id: 'phone-1',
            primary: false,
            number: '111-111-1111',
            location: null,
          },
        ]}
      />,
    );

    expect(queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
  });
});
