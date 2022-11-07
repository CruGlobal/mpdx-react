import React, { CSSProperties } from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import theme from '../../../../../src/theme';
import { ContactFlowRowPreview } from './ContactFlowRowPreview';

const layerStyles: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: 300,
  height: '100%',
};

const dragPreviewStyle: CSSProperties = {
  display: 'inline-block',
  border: `1px solid ${theme.palette.cruGrayMedium.main}`,
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const ContactFlowDragLayer: React.FC = () => {
  const { isDragging, item, itemType, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  function renderItem() {
    switch (itemType) {
      case 'contact':
        return (
          <div style={dragPreviewStyle}>
            <ContactFlowRowPreview
              name={item.name}
              status={item.status}
              starred={item.starred}
              width={item.width}
            />
          </div>
        );
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
};
