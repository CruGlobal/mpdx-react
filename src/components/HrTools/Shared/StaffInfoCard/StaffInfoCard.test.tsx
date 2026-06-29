import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffInfoCard } from './StaffInfoCard';

interface RenderOptions {
  hasSpouse?: boolean;
  onClick?: () => void;
  staffAccountId?: string | null;
}

const mutationSpy = jest.fn();

const renderCard = ({
  hasSpouse = true,
  onClick = mutationSpy,
  staffAccountId,
}: RenderOptions = {}) =>
  render(
    <StaffInfoCard
      person={{ name: 'John Doe', avatarSrc: 'avatar.jpg', staffAccountId }}
      toggle={hasSpouse ? { name: 'Jane', onClick } : undefined}
    >
      <div>Card body</div>
    </StaffInfoCard>,
  );

describe('StaffInfoCard', () => {
  it('renders the name, avatar, and body children', () => {
    const { getByRole, getByText } = renderCard();

    expect(getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
    expect(getByRole('img', { name: 'John Doe' })).toHaveAttribute(
      'src',
      'avatar.jpg',
    );
    expect(getByText('Card body')).toBeInTheDocument();
  });

  it('shows the toggle button and fires onClick when a spouse is provided', () => {
    const { getByRole } = renderCard();

    userEvent.click(getByRole('button', { name: 'View Jane' }));

    expect(mutationSpy).toHaveBeenCalledTimes(1);
  });

  it('hides the toggle button when no spouse is provided', () => {
    const { queryByRole } = renderCard({ hasSpouse: false });

    expect(
      queryByRole('button', { name: 'View Jane' }),
    ).not.toBeInTheDocument();
  });

  it('renders the staff account number when provided', () => {
    const { getByText } = renderCard({ staffAccountId: '000123456' });

    expect(getByText('Person Number: 000123456')).toBeInTheDocument();
  });

  it('omits the staff account number when not provided', () => {
    const { queryByText } = renderCard();

    expect(queryByText(/Person Number/)).not.toBeInTheDocument();
  });
});
