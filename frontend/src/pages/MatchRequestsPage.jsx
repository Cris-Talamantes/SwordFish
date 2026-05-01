import { useEffect, useState } from "react";

import {
  confirmVerification,
  fetchMatchRequests,
  respondToMatchRequest,
  submitVerificationAnswer,
  submitVerificationQuestion,
} from "../api/client.js";

const questionSuggestions = [
  "What phone number do you remember?",
  "What school did you go to?",
  "What was our pet's name?",
  "What is something only you would know about me?",
  "What was my favorite food, song, place, or hobby?",
];

export default function MatchRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [questionById, setQuestionById] = useState({});
  const [answerById, setAnswerById] = useState({});

  async function loadRequests() {
    setError("");
    setLoading(true);

    try {
      const data = await fetchMatchRequests();
      setRequests(data.requests ?? []);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleResponse(requestId, status) {
    setError("");
    setMessage("");

    try {
      await respondToMatchRequest(requestId, status);
      setMessage(`Request ${status}.`);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  async function handleQuestion(requestId) {
    setError("");
    setMessage("");

    try {
      await submitVerificationQuestion(requestId, questionById[requestId] ?? "");
      setMessage("Verification question saved.");
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  async function handleAnswer(requestId) {
    setError("");
    setMessage("");

    try {
      await submitVerificationAnswer(requestId, answerById[requestId] ?? "");
      setMessage("Verification answer saved.");
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  async function handleConfirm(requestId) {
    setError("");
    setMessage("");

    try {
      const data = await confirmVerification(requestId);
      setMessage(data.status === "chat" ? "Both people confirmed. Chat is unlocked." : "Your confirmation was saved.");
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    }
  }

  return (
    <section className="match-page">
      <div className="page-heading">
        <p className="eyebrow">Match requests</p>
        <h1>Review requests</h1>
        <p>Accept or reject incoming requests from people who believe they may be connected to you.</p>
      </div>

      {loading && <div className="status-panel">Loading match requests...</div>}
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="result-list">
        {requests.map((request) => (
          <article className="person-card" key={request.id}>
            <div className="person-card-body">
              <h2>{request.otherProfile?.firstName || request.fromProfile?.firstName || request.fromUid}</h2>
              <p>Status: {request.status}</p>
              {request.message && <p>{request.message}</p>}
              {request.status === "pending" && request.direction === "incoming" && (
                <div className="action-row">
                  <button
                    className="button primary"
                    onClick={() => handleResponse(request.id, "accepted")}
                    type="button"
                  >
                    Accept
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => handleResponse(request.id, "rejected")}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              )}
              {request.status === "pending" && request.direction === "outgoing" && (
                <p>Waiting for the other person to accept or reject your request.</p>
              )}
              {request.status === "verification" && (
                <section className="verification-panel">
                  <div>
                    <h3>Your question</h3>
                    {request.myVerification?.question ? (
                      <p>{request.myVerification.question}</p>
                    ) : (
                      <>
                        <textarea
                          onChange={(event) =>
                            setQuestionById((current) => ({ ...current, [request.id]: event.target.value }))
                          }
                          placeholder="Ask something only the right person is likely to know"
                          value={questionById[request.id] ?? ""}
                        />
                        <div className="suggestion-row">
                          {questionSuggestions.map((suggestion) => (
                            <button
                              className="suggestion-chip"
                              key={suggestion}
                              onClick={() =>
                                setQuestionById((current) => ({ ...current, [request.id]: suggestion }))
                              }
                              type="button"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                        <button className="button secondary" onClick={() => handleQuestion(request.id)} type="button">
                          Save question
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    <h3>Their question</h3>
                    {request.otherVerification?.question ? (
                      <>
                        <p>{request.otherVerification.question}</p>
                        {request.myVerification?.answer ? (
                          <p>Your answer has been saved.</p>
                        ) : (
                          <>
                            <textarea
                              onChange={(event) =>
                                setAnswerById((current) => ({ ...current, [request.id]: event.target.value }))
                              }
                              placeholder="Your answer"
                              value={answerById[request.id] ?? ""}
                            />
                            <button className="button secondary" onClick={() => handleAnswer(request.id)} type="button">
                              Save answer
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <p>Waiting for their question.</p>
                    )}
                  </div>

                  <div className="verification-status">
                    {request.otherVerification?.hasAnswered ? (
                      <div className="answer-review">
                        <h3>Their answer to your question</h3>
                        <p>{request.otherVerification.answer}</p>
                      </div>
                    ) : (
                      <p>Waiting for their answer.</p>
                    )}
                    <p>{request.myVerification?.confirmed ? "You confirmed this match." : "You have not confirmed yet."}</p>
                    <button className="button primary" onClick={() => handleConfirm(request.id)} type="button">
                      Confirm I know this person
                    </button>
                  </div>
                </section>
              )}
              {request.status === "chat" && <p>Both people confirmed this match. You can now chat.</p>}
              {request.status === "rejected" && <p>This match request was rejected.</p>}
            </div>
          </article>
        ))}
        {!loading && requests.length === 0 && <div className="status-panel">No match requests yet.</div>}
      </div>
    </section>
  );
}
