import React from 'react';
import { useDragLayer } from 'react-dnd';
import {
  ContactFlowDragLayerProps,
  dragPreviewStyle,
  getItemStyles,
  layerStyles,
} from 'src/components/Contacts/ContactFlow/ContactFlowDragLayer/ContactFlowDragLayer';
import { useAutoScroll } from 'src/components/Contacts/ContactFlow/ContactFlowDragLayer/useAutoScroll';
import { ContactFlowRowPreview } from './ContactFlowRowPreview';

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
