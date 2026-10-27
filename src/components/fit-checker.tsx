"use client";

import { useState, type FormEvent } from "react";
import { JOB_DESCRIPTION_MAX_CHARS, JOB_DESCRIPTION_MIN_CHARS, fitMessages } from "@/lib/fit/input";
import type { FitAssessment } from "@/lib/fit/types";

export function FitChecker() {
  const [jobDescription, setJobDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [assessment, setAssessment] = useState<FitAssessment | null>(null);

  const length = jobDescription.length;
  const trimmed = jobDescription.trim().length;
  const tooLong = length > JOB_DESCRIPTION_MAX_CHARS;
  const tooShort = trimmed < JOB_DESCRIPTION_MIN_CHARS;
  const canSubmit = !pending && !tooLong && !tooShort;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setAssessment(null);
      setError(tooLong ? fitMessages.tooLong : fitMessages.tooShort);
      return;
    }

    setPending(true);
    setError("");
    setAssessment(null);
    try {
      const response = await fetch("/api/fit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: unknown; assessment?: FitAssessment } | null;
      if (!response.ok || !payload?.assessment) {
        setError(typeof payload?.error === "string" ? payload.error : fitMessages.aiUnavailable);
        return;
      }
      setAssessment(payload.assessment);
    } catch {
      setError(fitMessages.aiUnavailable);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="fit-form" onSubmit={onSubmit}>
        <label>
          <span>
            Job description
            <b className={tooLong ? "is-over" : ""}>
              {length.toLocaleString()} / {JOB_DESCRIPTION_MAX_CHARS.toLocaleString()}
            </b>
          </span>
          <textarea
            name="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the role here. Responsibilities, requirements, and stack are enough."
            aria-label="Job description"
            required
            minLength={JOB_DESCRIPTION_MIN_CHARS}
            spellCheck
          />
        </label>
        <div className="fit-actions">
          <p>Compared only with his resume and public projects.</p>
          <button type="submit" disabled={!canSubmit}>
            {pending ? "Comparing…" : "Check fit"}
          </button>
        </div>
        {length > 0 && tooShort ? <p className="fit-hint">{fitMessages.tooShort}</p> : null}
        {tooLong ? <p className="fit-hint">{fitMessages.tooLong}</p> : null}
      </form>
      <div className="fit-results" aria-live="polite" aria-busy={pending}>
        {error ? <p className="fit-error">{error}</p> : null}
        {assessment ? <Assessment assessment={assessment} /> : null}
      </div>
    </>
  );
}

function Assessment({ assessment }: { assessment: FitAssessment }) {
  return (
    <>
      <section className="fit-block">
        <p className="kicker">Assessment</p>
        <p className="fit-summary">{assessment.summary}</p>
        <p className="fit-note">Match evidence below is copied from the profile. The summary is the comparison, not a new claim.</p>
      </section>
      <section className="fit-block">
        <p className="kicker">Matches</p>
        <h2>What the record supports.</h2>
        {assessment.matches.length === 0 ? <p className="fit-empty">Nothing in this description is clearly supported.</p> : null}
        {assessment.matches.map((match) => (
          <article className="fit-card" key={`${match.requirement}-${match.sources.map((source) => source.id).join("-")}`}>
            <h3>{match.requirement}</h3>
            {match.sources.map((source) => (
              <div key={source.id}>
                <p className="fit-source">
                  {[source.title, source.organization, source.dates].filter(Boolean).join(" · ")}
                </p>
                <ul>
                  {source.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </section>
      <section className="fit-block">
        <p className="kicker">Gaps</p>
        <h2>What is missing or only partial.</h2>
        {assessment.gaps.length === 0 ? <p className="fit-empty">No gap stood out against the requirements that were checked.</p> : null}
        {assessment.gaps.map((gap) => (
          <article className="fit-card" key={`${gap.partial ? "partial" : "gap"}-${gap.requirement}`}>
            <p className="fit-source">{gap.partial ? "Partial" : "Gap"}</p>
            <h3>{gap.requirement}</h3>
            <p>{gap.note}</p>
          </article>
        ))}
      </section>
      <section className="fit-block">
        <p className="kicker">Look at</p>
        <h2>Roles and projects to open.</h2>
        <div className="fit-look">
          {assessment.lookAt.map((item) => {
            const body = (
              <>
                <p className="kicker">{item.kind}</p>
                <h3>{item.title}</h3>
                {item.organization ? <p className="fit-source">{item.organization}</p> : null}
                <p>{item.why}</p>
              </>
            );
            return item.url ? (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer">
                {body}
              </a>
            ) : (
              <article key={item.id}>{body}</article>
            );
          })}
        </div>
      </section>
    </>
  );
}
