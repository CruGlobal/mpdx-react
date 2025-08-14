import * as React from 'react';

const Original = jest.requireActual('recharts');

const MockResponsiveContainer = ({ height, aspect, children }) => {
  const w = 800;
  const h =
    typeof height === 'number' ? height : aspect ? Math.round(w / aspect) : 400;
  return React.createElement(
    'div',
    {
      className: 'recharts-responsive-container',
      style: { width: w, height: h },
    },
    React.cloneElement(React.Children.only(children), { width: w, height: h }),
  );
};

jest.mock('recharts', () => ({
  ...Original,
  ResponsiveContainer: MockResponsiveContainer,
}));
