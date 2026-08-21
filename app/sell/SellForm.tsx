"use client";

import { useState } from "react";

export default function SellForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — real users never see or fill this
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const res = await fetch("/api/instructor-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, topic, message, website }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setStatus("idle");
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="card p-6 text-sm" style={{ color: "var(--success)" }}>
        Thanks — we&apos;ve got your details and will reach out when instructor applications open.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="name">
          Your name
        </label>
        <input id="name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor="topic">
          What would you teach?
        </label>
        <input
          id="topic"
          className="field-input"
          placeholder="e.g. Mobile Photography"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor="message">
          Anything else? (optional)
        </label>
        <textarea
          id="message"
          className="field-input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={status === "saving"}>
        {status === "saving" ? "Sending…" : "Submit interest"}
      </button>
    </form>
  );
}
