import { render } from '@testing-library/react';
import { SpouseOverCapSubContent } from './SpouseOverCapSubContent';

describe('SpouseOverCapSubContent', () => {
  it('renders with spouse name and Progressive Approvals link', () => {
    const { getByText, getByRole } = render(
      <SpouseOverCapSubContent spouseName="Jane" />,
    );

    expect(
      getByText(/Please consider submitting your request/),
    ).toBeInTheDocument();
    expect(getByText(/Jane/)).toBeInTheDocument();

    const link = getByRole('link', { name: 'Progressive Approvals' });
    expect(link).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/1Z1WuiIUMrmfrUUV0V-ACCdhyuSd1Cgzg/view?usp=drive_link',
    );
  });
});
