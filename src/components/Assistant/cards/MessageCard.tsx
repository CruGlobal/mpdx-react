import React from 'react';
import { AssistantCard, NavigationIntent } from '../types';
import { ContactCard } from './ContactCard';
import { FiguresCard } from './FiguresCard';
import { HandoffCard } from './HandoffCard';
import { NavigationCard } from './NavigationCard';
import { ProposedActionCard } from './ProposedActionCard';

interface MessageCardProps {
  card: AssistantCard;
  onNavigate: (intent: NavigationIntent) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  card,
  onNavigate,
}) => {
  switch (card.kind) {
    case 'navigation':
      return <NavigationCard card={card} onNavigate={onNavigate} />;
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
