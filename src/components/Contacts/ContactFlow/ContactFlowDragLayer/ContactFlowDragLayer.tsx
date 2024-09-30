import React, { CSSProperties, RefObject } from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import theme from 'src/theme';
import { DraggedContact } from '../ContactFlowRow/ContactFlowRow';
import { ContactFlowRowPreview } from './ContactFlowRowPreview';
import { useAutoScroll } from './useAutoScroll';

export const layerStyles: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: 300,
  height: '100%',
};

export const dragPreviewStyle: CSSProperties = {
  display: 'inline-block',
  border: `1px solid ${theme.palette.cruGrayMedium.main}`,
};

export function getItemStyles(
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

export interface ContactFlowDragLayerProps {
  containerRef: RefObject<HTMLElement>;
}

export const ContactFlowDragLayer: React.FC<ContactFlowDragLayerProps> = ({
  containerRef,
}) => {
  const {
    isDragging,
    item,
    itemType,
    initialOffset,
    currentOffset,
    clientOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  useAutoScroll({
    containerRef,
    enabled: clientOffset !== null,
    mouseX: clientOffset?.x ?? 0,
    scrollThreshold: 100,
    scrollVelocity: 800,
  });

  function renderItem() {
    switch (itemType) {
      case 'contact':
        const contact: DraggedContact = item;
        return (
          <div style={dragPreviewStyle}>
            <ContactFlowRowPreview
              name={contact.name}
              status={contact.status}
              starred={contact.starred}
              width={contact.width}
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
