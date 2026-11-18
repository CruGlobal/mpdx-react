import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaValues } from 'css-mediaquery';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { AvailableBalanceTooltip } from './AvailableBalanceTooltip';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockCalculations = (
  calculations: Record<string, unknown> | undefined,
  hcmLoading = false,
) =>
  mockUseAdditionalSalaryRequest.mockReturnValue({
    hcmLoading,
    requestData: {
      latestAdditionalSalaryRequest: { calculations },
    },
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

const capFigures = {
  staffAccountBalance: 1500,
  currentSalaryCap: 56750,
  combinedCap: 150000,
  ytdAsrAmount: 0,
};

const renderTooltip = () =>
  render(
    <ThemeProvider theme={theme}>
      <AvailableBalanceTooltip />
    </ThemeProvider>,
  );

const iconName = 'How the amount available for this request is calculated';

const openTooltip = async (
  utils: ReturnType<typeof render>,
): Promise<HTMLElement> => {
  userEvent.hover(utils.getByRole('img', { name: iconName }));
  return utils.findByRole('tooltip');
};

describe('AvailableBalanceTooltip', () => {
  it('breaks the available amount into balance, deficit limit, and unpaid requests', async () => {
    mockCalculations({
      staffAccountBalance: 1500,
      staffAccountDeficitLimit: 500,
      unpaidHouseholdAsrAmount: 1000,
      unpaidHouseholdAsrs: [
        {
          amount: 800,
          status: AsrStatusEnum.Pending,
          submittedAt: null,
          spouse: true,
        },
        {
          amount: 200,
          status: AsrStatusEnum.ApprovedNotPaid,
          submittedAt: null,
          spouse: false,
        },
      ],
    });

    const utils = renderTooltip();
    const tooltip = await openTooltip(utils);

    expect(
      within(tooltip).getByText(
        'Primary balance of $1,500.00, plus deficit limit of $500.00, minus $1,000.00 in other unpaid requests',
      ),
    ).toBeInTheDocument();
    expect(
      within(tooltip).getByText(
        "Your spouse's request, waiting for approval: $800.00",
      ),
    ).toBeInTheDocument();
    expect(
      within(tooltip).getByText(
        'Your request, approved, waiting to be paid: $200.00',
      ),
    ).toBeInTheDocument();
  });

  it('keeps the breakdown hidden until the icon is hovered', () => {
    mockCalculations({ staffAccountBalance: 1500 });

    const { getByRole, queryByRole, queryByText } = renderTooltip();

    expect(getByRole('img', { name: iconName })).toBeInTheDocument();
    expect(queryByRole('tooltip')).not.toBeInTheDocument();
    expect(queryByText(/Primary balance/)).not.toBeInTheDocument();
  });

  // jsdom can't match :focus-visible, which MUI needs to open a tooltip on focus, so a real
  // browser checks that part
  it('is reachable with the keyboard', () => {
    mockCalculations({ staffAccountBalance: 1500 });

    const { getByRole } = renderTooltip();
    userEvent.tab();

    expect(getByRole('img', { name: iconName })).toHaveFocus();
  });

  describe('on a touch screen', () => {
    beforeEach(() => {
      // A phone or tablet has no hover
      matchMediaMock({ hover: 'none' } as Partial<MediaValues>);
      mockCalculations({ staffAccountBalance: 1500 });
    });

    it('opens on a tap and closes on a second tap', async () => {
      const { getByRole, findByRole, queryByRole } = renderTooltip();
      const icon = getByRole('img', { name: iconName });

      userEvent.click(icon);
      expect(await findByRole('tooltip')).toHaveTextContent(
        'Primary balance of $1,500.00',
      );

      userEvent.click(icon);
      await waitFor(() =>
        expect(queryByRole('tooltip')).not.toBeInTheDocument(),
      );
    });

    it('stays open when the pointer leaves, and closes on a tap elsewhere', async () => {
      const { getByRole, findByRole, queryByRole } = renderTooltip();
      const icon = getByRole('img', { name: iconName });

      userEvent.click(icon);
      await findByRole('tooltip');
      // Touch browsers send a mouseleave right after a tap
      userEvent.unhover(icon);
      // Longer than the close transition, so a closing tooltip would be gone
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(getByRole('tooltip')).toBeInTheDocument();

      userEvent.click(document.body);
      await waitFor(() =>
        expect(queryByRole('tooltip')).not.toBeInTheDocument(),
      );
    });
  });

  it('describes the icon with the breakdown while open', async () => {
    mockCalculations({ staffAccountBalance: 1500 });

    const utils = renderTooltip();
    const tooltip = await openTooltip(utils);

    expect(
      utils.getByRole('img', { name: iconName }),
    ).toHaveAccessibleDescription(tooltip.textContent ?? '');
  });

  it('labels a request waiting for changes', async () => {
    mockCalculations({
      staffAccountBalance: 1500,
      staffAccountDeficitLimit: 0,
      unpaidHouseholdAsrAmount: 300,
      unpaidHouseholdAsrs: [
        {
          amount: 300,
          status: AsrStatusEnum.ActionRequired,
          submittedAt: null,
          spouse: false,
        },
      ],
    });

    const tooltip = await openTooltip(renderTooltip());

    expect(
      within(tooltip).getByText('Your request, waiting for changes: $300.00'),
    ).toBeInTheDocument();
  });

  it('leaves out a zero deficit limit and no unpaid requests', async () => {
    mockCalculations({
      staffAccountBalance: 1500,
      staffAccountDeficitLimit: 0,
      unpaidHouseholdAsrAmount: 0,
      unpaidHouseholdAsrs: [],
    });

    const tooltip = await openTooltip(renderTooltip());

    expect(tooltip).toHaveTextContent(/^Primary balance of \$1,500\.00$/);
    expect(within(tooltip).queryByRole('list')).not.toBeInTheDocument();
  });

  it('leaves the approval note to the card', async () => {
    mockCalculations({
      ...capFigures,
      grossAnnualSalary: 30000,
      remainingAllowableSalary: 26750,
    });

    const tooltip = await openTooltip(renderTooltip());

    expect(tooltip).toHaveTextContent('Primary balance of $1,500.00');
    expect(tooltip).not.toHaveTextContent(/needs? approval/);
  });

  it('renders nothing without calculations', () => {
    mockCalculations(undefined);

    const { container } = renderTooltip();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while HCM data loads', () => {
    mockCalculations({ staffAccountBalance: 1500 }, true);

    const { container } = renderTooltip();

    expect(container).toBeEmptyDOMElement();
  });
});
