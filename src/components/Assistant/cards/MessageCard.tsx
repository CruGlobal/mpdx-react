import React from 'react';
import { AssistantCard } from '../types';
import { ContactCard } from './ContactCard';
import { FiguresCard } from './FiguresCard';
import { HandoffCard } from './HandoffCard';
import { NavigationCard } from './NavigationCard';
import { ProposedActionCard } from './ProposedActionCard';

interface MessageCardProps {
  card: AssistantCard;
}

export const MessageCard: React.FC<MessageCardProps> = ({ card }) => {
  switch (card.kind) {
    case 'navigation':
      return <NavigationCard card={card} />;
    case 'handoff':
      return <HandoffCard card={card} />;
    case 'figures':
      return <FiguresCard card={card} />;
    case 'contact':
      return <ContactCard card={card} />;
    case 'proposed_action':
      return <ProposedActionCard card={card} />;
    default:
      return null;
  }
};
