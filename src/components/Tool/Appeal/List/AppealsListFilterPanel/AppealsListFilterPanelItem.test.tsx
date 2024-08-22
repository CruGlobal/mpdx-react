import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';
import {
  AppealsListFilterPanelItem,
  AppealsListFilterPanelItemProps,
} from './AppealsListFilterPanelItem';

const onClick = jest.fn();
const initialProps = {
  id: AppealStatusEnum.Asked,
  title: 'Test Title',
  isSelected: false,
  count: 15,
  loading: false,
  onClick,
};

const Components = (props: AppealsListFilterPanelItemProps) => (
  <ThemeProvider theme={theme}>
    <AppealsListFilterPanelItem {...props} />
  </ThemeProvider>
);

describe('AppealsListFilterPanelItem', () => {
  it('should show a skeleton when loading', () => {
    const props = { ...initialProps, loading: true, count: undefined };
    const { getByText, getByTestId, queryByText } = render(
      <Components {...props} />,
    );

    expect(getByText(initialProps.title)).toBeInTheDocument();
    expect(getByTestId('panel-item-skeleton')).toBeInTheDocument();
    expect(queryByText(initialProps.count)).not.toBeInTheDocument();
  });

  it('default', () => {
    const { getByText } = render(<Components {...initialProps} />);

    expect(getByText(initialProps.title)).toBeInTheDocument();
    expect(getByText(initialProps.count)).toBeInTheDocument();
  });

  it('should fire onClick', () => {
    const { getByText } = render(<Components {...initialProps} />);

    expect(onClick).not.toHaveBeenCalled();
    userEvent.click(getByText(initialProps.title));
    expect(onClick).toHaveBeenCalled();
  });

  describe('Count styles', () => {
    it('shows excluded count', () => {
      const { getByText, getByTestId } = render(
        <Components {...initialProps} id={AppealStatusEnum.Excluded} />,
      );

      expect(getByText(initialProps.title)).toBeInTheDocument();
      expect(getByTestId('panel-item-count-box')).toHaveStyle({
        color: '#ffffff',
        'background-color': theme.palette.statusDanger.main,
      });
    });

    it('shows given count', () => {
      const { getByText, getByTestId } = render(
        <Components {...initialProps} id={AppealStatusEnum.Processed} />,
      );

      expect(getByText(initialProps.title)).toBeInTheDocument();
      expect(getByTestId('panel-item-count-box')).toHaveStyle({
        color: '#ffffff',
        'background-color': theme.palette.mpdxGreen.main,
      });
    });

    it('shows received count', () => {
      const { getByText, getByTestId } = render(
        <Components
          {...initialProps}
          id={AppealStatusEnum.ReceivedNotProcessed}
        />,
      );

      expect(getByText(initialProps.title)).toBeInTheDocument();
      expect(getByTestId('panel-item-count-box')).toHaveStyle({
        color: theme.palette.cruGrayDark.main,
        'background-color': theme.palette.cruYellow.main,
      });
    });

    it('shows asked count', () => {
      const { getByText, getByTestId } = render(
        <Components {...initialProps} id={AppealStatusEnum.Asked} />,
      );

      expect(getByText(initialProps.title)).toBeInTheDocument();
      expect(getByTestId('panel-item-count-box')).toHaveStyle({
        color: '#ffffff',
        'background-color': theme.palette.cruGrayMedium.main,
      });
    });
  });
});
