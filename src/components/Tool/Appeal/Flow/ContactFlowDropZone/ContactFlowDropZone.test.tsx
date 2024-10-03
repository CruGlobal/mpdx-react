import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';
import { ContactFlowDropZone } from './ContactFlowDropZone';

describe('ContactFlowDropZone', () => {
  it('renders column title', () => {
    const { getByText } = render(
      <DndProvider backend={HTML5Backend}>
        <ContactFlowDropZone
          status={AppealStatusEnum.Asked}
          title="Asked"
          changeContactStatus={jest.fn()}
        />
      </DndProvider>,
    );

    expect(getByText('Asked')).toBeInTheDocument();
  });
});
