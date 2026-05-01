import { useState } from "react";

import { searchProfiles, sendMatchRequest } from "../api/client.js";

const initialFilters = {
  firstName: "",
  generalLocation: "",
  age: "",
  relationshipRole: "",
  storyContext: "",
};

export default function SearchPeoplePage() {
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [messageByUid, setMessageByUid] = useState({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [requestingUid, setRequestingUid] = useState("");

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setSearching(true);

    try {
      const data = await searchProfiles(filters);
      setResults(data.users ?? []);
      setStatus(`${data.users?.length ?? 0} possible ${data.users?.length === 1 ? "match" : "matches"} found.`);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(uid) {
    setError("");
    setStatus("");
    setRequestingUid(uid);

    try {
      await sendMatchRequest(uid, messageByUid[uid] ?? "");
      setStatus("Match request sent.");
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    } finally {
      setRequestingUid("");
    }
  }

  return (
    <section className="search-page">
      <div className="page-heading">
        <p className="eyebrow">People search</p>
        <h1>Find a relative</h1>
        <p>
          Add what you know about the person. Search uses only broad profile fields — keep addresses, workplace specifics,
          and immigration case numbers out of messages until you trust the conversation.
        </p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <label>
          First name or nickname
          <input
            onChange={(event) => updateFilter("firstName", event.target.value)}
            placeholder="First name only"
            type="text"
            value={filters.firstName}
          />
        </label>
        <label>
          General living location
          <input
            onChange={(event) => updateFilter("generalLocation", event.target.value)}
            placeholder="City, state, region"
            type="text"
            value={filters.generalLocation}
          />
        </label>
        <label>
          Approximate age
          <input
            min="0"
            onChange={(event) => updateFilter("age", event.target.value)}
            type="number"
            value={filters.age}
          />
        </label>
        <label>
          Who are you looking for?
          <select onChange={(event) => updateFilter("relationshipRole", event.target.value)} value={filters.relationshipRole}>
            <option value="">Any</option>
            <option value="sister">Sister</option>
            <option value="brother">Brother</option>
            <option value="mother">Mother</option>
            <option value="father">Father</option>
            <option value="daughter">Daughter</option>
            <option value="son">Son</option>
            <option value="aunt">Aunt</option>
            <option value="uncle">Uncle</option>
            <option value="cousin">Cousin</option>
            <option value="grandparent">Grandparent</option>
            <option value="other">Other relative</option>
          </select>
        </label>
        <label>
          General story or context
          <textarea
            onChange={(event) => updateFilter("storyContext", event.target.value)}
            placeholder="Separated in 2005, lived near a certain area, shared family detail"
            value={filters.storyContext}
          />
        </label>
        <button className="button primary" disabled={searching} type="submit">
          {searching ? "Searching..." : "Search people"}
        </button>
      </form>

      {status && <p className="form-success">{status}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="result-list">
        {results.map((person) => (
          <article className="person-card" key={person.uid}>
            <div className="person-card-body">
              <h2>{person.firstName || "Unnamed profile"}</h2>
              <p>{[person.age ? `Around ${person.age}` : "", person.relationshipRole, person.generalLocation].filter(Boolean).join(" | ")}</p>
              {person.storyContext && <p>{person.storyContext}</p>}
              <textarea
                onChange={(event) =>
                  setMessageByUid((current) => ({ ...current, [person.uid]: event.target.value }))
                }
                placeholder="Optional note for the match request"
                value={messageByUid[person.uid] ?? ""}
              />
              <button
                className="button secondary motion-button"
                disabled={requestingUid === person.uid}
                onClick={() => handleSendRequest(person.uid)}
                type="button"
              >
                {requestingUid === person.uid ? "Sending..." : "Send match request"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
