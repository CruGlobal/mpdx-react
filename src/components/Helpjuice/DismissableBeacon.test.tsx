import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DismissableBeacon } from './DismissableBeacon';

const setDismissed = jest.fn();

describe('DismissableBeacon', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="helpjuice-widget">
  <a id="helpjuice-widget-trigger" />
  <div id="helpjuice-widget-expanded" />
    <div id="helpjuice-widget-content" />
    <div id="helpjuice-widget-contact" />
  </div>
</div>`;
  });

  it('toggles visible class to widget', () => {
    const { rerender } = render(
      <DismissableBeacon dismissed={false} setDismissed={setDismissed} />,
    );
    expect(document.getElementById('helpjuice-widget')).toHaveClass('visible');

    rerender(
      <DismissableBeacon dismissed={true} setDismissed={setDismissed} />,
    );
    expect(document.getElementById('helpjuice-widget')).not.toHaveClass(
      'visible',
    );
  });

  it('creates Hide Beacon link that hides the popup and removes the visible class from the widget', () => {
    render(<DismissableBeacon dismissed={false} setDismissed={setDismissed} />);

    expect(document.getElementById('helpjuice-widget')).toHaveClass('visible');

    // Simulating expanding the widget
    const expandedWidget = document.getElementById('helpjuice-widget-expanded');
    expandedWidget?.classList.add('hj-shown');

    userEvent.click(document.getElementById('dismiss-beacon')!);

    expect(setDismissed).toHaveBeenCalledWith(true);
    expect(expandedWidget).not.toHaveClass('hj-shown');
  });

  it('undismisses the beacon when the trigger is clicked', () => {
    render(<DismissableBeacon dismissed={true} setDismissed={setDismissed} />);

    userEvent.click(document.getElementById('helpjuice-widget-trigger')!);
    expect(setDismissed).toHaveBeenCalledWith(false);
  });
});
