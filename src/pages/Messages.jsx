import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { SkeletonList } from '../components/common/Skeleton';
import { timeAgo } from '../utils/format';

export default function Messages() {
  const { user, getUserById, users } = useContext(AuthContext);
  const { dataLoading, getConversations, getConversationMessages, sendMessage } = useContext(AppContext);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const conversations = getConversations();
  const activeMessages = selectedUserId ? getConversationMessages(selectedUserId) : [];
  const otherUser = selectedUserId ? getUserById(selectedUserId) : null;

  // People the user follows they haven't messaged yet — lets them start a new chat.
  const startable = users.filter(
    (u) => u.id !== user.id && user.following.includes(u.id) && !conversations.some((c) => c.userId === u.id)
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedUserId) return;
    sendMessage(selectedUserId, draft);
    setDraft('');
  };

  return (
    <Layout fullBleed>
      <div className="messages-layout">
        <div className="conversations-list">
          <h3 className="conversations-title">Messages</h3>
          {dataLoading ? (
            <SkeletonList count={4} />
          ) : conversations.length === 0 && startable.length === 0 ? (
            <EmptyState icon="💬" title="No conversations yet" message="Follow people to start chatting with them." />
          ) : (
            <>
              {conversations.map((conv) => {
                const cUser = getUserById(conv.userId);
                if (!cUser) return null;
                return (
                  <button
                    key={conv.userId}
                    className={`conversation-item ${selectedUserId === conv.userId ? 'active' : ''}`}
                    onClick={() => setSelectedUserId(conv.userId)}
                  >
                    <Avatar src={cUser.avatar} name={cUser.fullName} size="md" />
                    <div className="conversation-preview">
                      <span className="conversation-name">{cUser.username}</span>
                      <span className="conversation-last-message">
                        {conv.lastMessage.senderId === user.id ? 'You: ' : ''}
                        {conv.lastMessage.text}
                      </span>
                    </div>
                  </button>
                );
              })}
              {startable.map((u) => (
                <button key={u.id} className={`conversation-item ${selectedUserId === u.id ? 'active' : ''}`} onClick={() => setSelectedUserId(u.id)}>
                  <Avatar src={u.avatar} name={u.fullName} size="md" />
                  <div className="conversation-preview">
                    <span className="conversation-name">{u.username}</span>
                    <span className="conversation-last-message text-secondary">Say hi 👋</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="chat-area">
          {!otherUser ? (
            <div className="chat-placeholder">
              <span aria-hidden="true">💬</span>
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <Avatar src={otherUser.avatar} name={otherUser.fullName} size="sm" />
                <h4>{otherUser.username}</h4>
              </div>

              <div className="chat-messages" ref={scrollRef}>
                {activeMessages.length === 0 ? (
                  <EmptyState icon="👋" title="Say hello" message={`This is the start of your conversation with ${otherUser.username}.`} />
                ) : (
                  activeMessages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble-row ${msg.senderId === user.id ? 'mine' : ''}`}>
                      <div className="chat-bubble">
                        <span>{msg.text}</span>
                        <span className="chat-bubble-time">{timeAgo(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleSend}>
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <input
                  id="chat-input"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
