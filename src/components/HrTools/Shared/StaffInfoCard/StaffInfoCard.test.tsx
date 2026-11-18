import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffInfoCard } from './StaffInfoCard';

interface RenderOptions {
  hasSpouse?: boolean;
  onClick?: () => void;
}

const mutationSpy = jest.fn();

const renderCard = ({
  hasSpouse = true,
  onClick = mutationSpy,
}: RenderOptions = {}) =>
  render(
    <StaffInfoCard
      person={{ name: 'John Doe', avatarSrc: 'avatar.jpg' }}
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

  it('places the toggle button beside the name', () => {
    const { getByRole } = renderCard();

    const row = getByRole('button', { name: 'View Jane' }).parentElement;
    expect(row).toContainElement(getByRole('heading', { name: 'John Doe' }));
    expect(row).toHaveStyle({ flexWrap: 'wrap' });
    expect(row).not.toHaveStyle({ justifyContent: 'space-between' });
  });

  it('keeps the avatar and name together when the row wraps', () => {
    const { getByRole } = renderCard();

    const nameGroup = getByRole('heading', { name: 'John Doe' }).parentElement;
    expect(nameGroup).toContainElement(getByRole('img', { name: 'John Doe' }));
    expect(nameGroup).not.toContainElement(
      getByRole('button', { name: 'View Jane' }),
    );
  });

  it('hides the toggle button when no spouse is provided', () => {
    const { queryByRole } = renderCard({ hasSpouse: false });

    expect(
      queryByRole('button', { name: 'View Jane' }),
    ).not.toBeInTheDocument();
  });
});
