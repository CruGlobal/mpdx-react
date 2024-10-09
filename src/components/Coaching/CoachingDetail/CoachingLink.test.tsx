import { render } from '@testing-library/react';
import { AccountListTypeEnum } from './CoachingDetail';
import { CoachingLink } from './CoachingLink';

describe('CoachingLink', () => {
  it('are hidden when viewing coaching account list', () => {
    const { queryByRole } = render(
      <CoachingLink accountListType={AccountListTypeEnum.Coaching} href="/page">
        Page
      </CoachingLink>,
    );

    expect(queryByRole('link', { name: 'Page' })).not.toBeInTheDocument();
  });

  it('are shown when viewing own account list', async () => {
    const { getByRole } = render(
      <CoachingLink accountListType={AccountListTypeEnum.Own} href="/page">
        Page
      </CoachingLink>,
    );

    expect(getByRole('link', { name: 'Page' })).toBeInTheDocument();
  });
});
