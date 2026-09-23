import { deleteAssistantConversations } from './deleteAssistantConversations';
import { mockJsonResponse } from './sse.mock';

describe('deleteAssistantConversations', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.ASSISTANT_URL = 'https://assistant.test/';
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    process.env.ASSISTANT_URL = '';
    fetchSpy.mockRestore();
  });

  it('deletes every conversation with the assistant token and returns the counts', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse({ deleted_conversations: 3, deleted_messages: 42 }),
    );

    await expect(deleteAssistantConversations('token-1')).resolves.toEqual({
      conversations: 3,
      messages: 42,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://assistant.test/conversations',
      { method: 'DELETE', headers: { Authorization: 'Bearer token-1' } },
    );
  });

  it('throws when the service refuses', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse({}, { ok: false, status: 401 }),
    );

    await expect(deleteAssistantConversations('token-1')).rejects.toThrow(
      'status 401',
    );
  });
});
