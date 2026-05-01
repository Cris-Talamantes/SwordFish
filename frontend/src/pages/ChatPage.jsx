import { useEffect, useState } from "react";

import {
  blockAccount,
  fetchChatMessages,
  fetchChats,
  leaveChat,
  sendChatMessage,
} from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadChats() {
    setError("");
    setLoading(true);

    try {
      const data = await fetchChats();
      const nextChats = data.chats ?? [];
      setChats(nextChats);
      setActiveChatId((current) => current || nextChats[0]?.id || "");
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(chatId) {
    if (!chatId) {
      setMessages([]);
      return;
    }

    try {
      const data = await fetchChatMessages(chatId);
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    loadMessages(activeChatId);
  }, [activeChatId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      await sendChatMessage(activeChatId, draft);
      setDraft("");
      await loadMessages(activeChatId);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  async function handleLeave() {
    const confirmed = window.confirm("Leave this chat? It will be removed from your chat list.");
    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await leaveChat(activeChatId);
      setActiveChatId("");
      setMessages([]);
      await loadChats();
      setNotice("You left the chat.");
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  async function handleBlock() {
    const confirmed = window.confirm("Block this account? This chat will be removed from your chat list.");
    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await blockAccount(activeChatId);
      setActiveChatId("");
      setMessages([]);
      await loadChats();
      setNotice("Account blocked.");
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <section className="chat-page">
      <div className="page-heading">
        <p className="eyebrow">Chat</p>
        <h1>Confirmed matches</h1>
        <p>Chat unlocks only after both people answer verification questions and confirm the match.</p>
      </div>

      {loading && <div className="status-panel">Loading chats...</div>}
      {notice && <p className="form-success">{notice}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="chat-layout">
        <aside className="chat-list">
          {chats.map((chat) => (
            <button
              className={chat.id === activeChatId ? "chat-list-item active" : "chat-list-item"}
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              type="button"
            >
              {chat.otherProfile?.firstName || "Confirmed match"}
            </button>
          ))}
          {!loading && chats.length === 0 && <p>No unlocked chats yet.</p>}
        </aside>

        <section className="chat-box">
          <h2>{activeChat?.otherProfile?.firstName || "Select a chat"}</h2>
          <div className="message-list">
            {messages.map((message) => (
              <div
                className={message.senderUid === currentUser.uid ? "message-bubble mine" : "message-bubble"}
                key={message.id}
              >
                {message.text}
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              disabled={!activeChatId}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message"
              type="text"
              value={draft}
            />
            <button className="button primary" disabled={!activeChatId || !draft.trim()} type="submit">
              Send
            </button>
          </form>
          {activeChatId && (
            <section className="chat-safety-panel">
              <h3>Chat controls</h3>
              <div className="action-row">
                <button className="button secondary" onClick={handleLeave} type="button">
                  Leave chat
                </button>
                <button className="button danger" onClick={handleBlock} type="button">
                  Block account
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </section>
  );
}
