export interface DeletedConversationCounts {
  conversations: number;
  messages: number;
}

export const deleteAssistantConversations = async (
  token: string,
): Promise<DeletedConversationCounts> => {
  const assistantUrl = process.env.ASSISTANT_URL?.replace(/\/+$/, '');
  const response = await fetch(`${assistantUrl}/conversations`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(
      `Deleting assistant conversations failed with status ${response.status}`,
    );
  }

  const body = await response.json();
  return {
    conversations: Number(body.deleted_conversations ?? 0),
    messages: Number(body.deleted_messages ?? 0),
  };
};
