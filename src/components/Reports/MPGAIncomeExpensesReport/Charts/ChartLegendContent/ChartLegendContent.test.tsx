import React from 'react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { ChartLegendContent } from './ChartLegendContent';

const payload = [
  { value: 'Income', color: theme.palette.statusSuccess.main },
  { value: 'Expenses', color: theme.palette.chipRedDark.main },
];

describe('ChartLegendContent', () => {
  it('renders an item per payload entry', () => {
    const { getAllByRole, getByText } = render(
      <ChartLegendContent payload={payload} />,
    );

    expect(getAllByRole('listitem')).toHaveLength(2);
    expect(getByText('Income')).toBeInTheDocument();
    expect(getByText('Expenses')).toBeInTheDocument();
  });

  it('colors each box from its own entry', () => {
    const { getAllByRole } = render(<ChartLegendContent payload={payload} />);

    const boxes = getAllByRole('listitem').map((item) => item.firstChild);

    expect(boxes[0]).toHaveStyle({
      backgroundColor: theme.palette.statusSuccess.main,
    });
    expect(boxes[1]).toHaveStyle({
      backgroundColor: theme.palette.chipRedDark.main,
    });
  });

  it('renders no items when recharts supplies no payload', () => {
    const { queryAllByRole } = render(<ChartLegendContent />);

    expect(queryAllByRole('listitem')).toHaveLength(0);
  });
});
