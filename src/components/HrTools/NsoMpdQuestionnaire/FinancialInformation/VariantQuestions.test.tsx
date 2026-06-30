import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { NewStaffQuestionnaireVariantEnum } from 'src/graphql/types.generated';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { VariantQuestions } from './VariantQuestions';

const mutationSpy = jest.fn();

const TestComponent: React.FC<{
  onCall?: MockLinkCallHandler;
  newStaffQuestionnaire?: React.ComponentProps<
    typeof NsoMpdQuestionnaireTestWrapper
  >['newStaffQuestionnaire'];
}> = ({ onCall, newStaffQuestionnaire }) => (
  <NsoMpdQuestionnaireTestWrapper
    onCall={onCall}
    newStaffQuestionnaire={newStaffQuestionnaire}
  >
    <VariantQuestions />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('VariantQuestions', () => {
  it('renders no questions for the single or married variant', async () => {
    const { queryByRole } = render(
      <TestComponent
        onCall={mutationSpy}
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.SingleMarried,
        }}
      />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('NewStaffQuestionnaire'),
    );

    expect(queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(
      queryByRole('spinbutton', {
        name: 'How many total dependents would you like to cover by your Cru healthcare?',
      }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('spinbutton', {
        name: "What is Jane's current requested annual salary?",
      }),
    ).not.toBeInTheDocument();
  });

  describe('SOSA', () => {
    it('shows only the healthcare dependents question', async () => {
      const { findByRole, queryByRole } = render(
        <TestComponent
          newStaffQuestionnaire={{
            variant: NewStaffQuestionnaireVariantEnum.Sosa,
          }}
        />,
      );

      expect(
        await findByRole('spinbutton', {
          name: 'How many total dependents would you like to cover by your Cru healthcare?',
        }),
      ).toBeInTheDocument();
      expect(
        queryByRole('spinbutton', {
          name: "What is Jane's current requested annual salary?",
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Spouse Senior Staff', () => {
    it('shows the spouse salary, 403(b), MHA, and account-transfer questions', async () => {
      const { findByRole, getByRole, queryByRole } = render(
        <TestComponent
          newStaffQuestionnaire={{
            variant: NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff,
          }}
        />,
      );

      expect(
        await findByRole('spinbutton', {
          name: "What is Jane's current requested annual salary?",
        }),
      ).toBeInTheDocument();
      expect(
        getByRole('spinbutton', {
          name: "What is Jane's 403(b) contribution percentage?",
        }),
      ).toBeInTheDocument();
      expect(
        getByRole('spinbutton', {
          name: "What is Jane's current requested MHA?",
        }),
      ).toBeInTheDocument();
      expect(
        getByRole('spinbutton', {
          name: 'How much do you set aside automatically each month for biannual staff conference?',
        }),
      ).toBeInTheDocument();
      expect(
        getByRole('spinbutton', {
          name: 'How much do you transfer in giving to other staff each month from your staff account?',
        }),
      ).toBeInTheDocument();
      expect(
        getByRole('spinbutton', {
          name: 'How much do you have raised in Solid Support?',
        }),
      ).toBeInTheDocument();
      expect(
        queryByRole('spinbutton', {
          name: 'How many total dependents would you like to cover by your Cru healthcare?',
        }),
      ).not.toBeInTheDocument();
    });

    it("interpolates the spouse's first name into the questions", async () => {
      const { findByRole } = render(
        <TestComponent
          newStaffQuestionnaire={{
            variant: NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff,
            spouseFirstName: 'Maria',
          }}
        />,
      );

      expect(
        await findByRole('spinbutton', {
          name: "What is Maria's current requested annual salary?",
        }),
      ).toBeInTheDocument();
    });

    it('falls back to "your spouse" when the spouse first name is missing', async () => {
      const { findByRole } = render(
        <TestComponent
          newStaffQuestionnaire={{
            variant: NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff,
            spouseFirstName: null,
          }}
        />,
      );

      expect(
        await findByRole('spinbutton', {
          name: "What is your spouse's current requested annual salary?",
        }),
      ).toBeInTheDocument();
    });
  });
});
