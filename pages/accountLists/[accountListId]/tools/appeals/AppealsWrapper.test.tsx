import React, { useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import {
  AppealsContext,
  TableViewModeEnum,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import theme from 'src/theme';
import { AppealsWrapper } from './AppealsWrapper';

const accountListId = 'account-list-1';
const appealId = 'appeal-1';

const router = {
  query: { accountListId, appealId: [appealId] },
  isReady: true,
};

const ViewModeDisplay: React.FC = () => {
  const context = useContext(AppealsContext);
  return (
    <div>
      <div data-testid="view-mode" data-view-mode={context?.viewMode || 'null'}>
        {context?.viewMode || 'null'}
      </div>
      <button
        data-testid="change-to-list"
        onClick={() => context?.setViewMode(TableViewModeEnum.List)}
      ></button>
      <button
        data-testid="change-to-flows"
        onClick={() => context?.setViewMode(TableViewModeEnum.Flows)}
      ></button>
    </div>
  );
};

interface TestComponentProps {
  value?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({ value }) => {
  const mocks = {
    GetUserOptions: {
      userOptions:
        value === undefined
          ? []
          : [
              {
                value: value,
              },
            ],
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
          mocks={mocks}
        >
          <AppealsWrapper>
            <ViewModeDisplay />
          </AppealsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('AppealsWrapper', () => {
  it('should default to Flows when preference is invalid', async () => {
    const { getByTestId } = render(<TestComponent value="invalid_value" />);

    await waitFor(() => {
      expect(getByTestId('view-mode')).toHaveAttribute(
        'data-view-mode',
        TableViewModeEnum.Flows,
      );
    });
  });

  it('should default to Flows view mode and allow user to change view mode', async () => {
    const { getByTestId } = render(<TestComponent value={undefined} />);

    // Default
    await waitFor(() => {
      expect(getByTestId('view-mode')).toHaveAttribute(
        'data-view-mode',
        TableViewModeEnum.Flows,
      );
    });

    userEvent.click(getByTestId('change-to-list'));

    expect(getByTestId('view-mode')).toHaveAttribute(
      'data-view-mode',
      TableViewModeEnum.List,
    );
  });
});
