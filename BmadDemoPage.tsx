import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyContextForProfile,
  defaultProfileId,
  getDemoProfile,
  getDemoProfiles,
  getPhaseChat,
  getPhasesForProfile,
  getTrackNotes,
  trackLabels,
  type BmadArtifact,
  type BmadPhase,
  type BmadTrack,
} from "./src/bmadDemoContent";
import "./BmadDemoPage.css";

function downloadArtifact(artifact: BmadArtifact) {
  const blob = new Blob([artifact.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = artifact.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function summarizeScenarioFromHumanInput(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "To be determined";
  }

  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] ?? normalized;
  const trimmed = firstSentence.trim();

  if (trimmed.length <= 180) {
    return trimmed;
  }

  return `${trimmed.slice(0, 177)}...`;
}

export function BmadDemoPage() {
  const [profileId, setProfileId] = useState(defaultProfileId);
  const [activeId, setActiveId] = useState(getPhasesForProfile(defaultProfileId)[0].id);
  const [track, setTrack] = useState<BmadTrack>("method");
  const [previewArtifactName, setPreviewArtifactName] = useState<string | null>(null);
  const [completedPhaseIds, setCompletedPhaseIds] = useState<Set<string>>(new Set());
  const [referenceExpanded, setReferenceExpanded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [scenarioByPhase, setScenarioByPhase] = useState<Record<string, string>>({});
  const controlsSentinelRef = useRef<HTMLDivElement | null>(null);
  const artifactPreviewRef = useRef<HTMLElement | null>(null);
  const phaseDetailRef = useRef<HTMLElement | null>(null);

  const profiles = useMemo(() => getDemoProfiles(), []);
  const activeProfile = useMemo(() => getDemoProfile(profileId), [profileId]);
  const phases = useMemo(() => getPhasesForProfile(profileId), [profileId]);
  const trackNotes = useMemo(() => getTrackNotes(profileId), [profileId]);

  const visiblePhases = useMemo(
    () => phases.filter((phase) => phase.tracks.includes(track)),
    [phases, track],
  );

  const activePhase = visiblePhases.find((phase) => phase.id === activeId) ?? visiblePhases[0];
  const activeIndex = visiblePhases.findIndex((phase) => phase.id === activePhase.id);
  const completedVisibleCount = visiblePhases.filter((phase) =>
    completedPhaseIds.has(phase.id),
  ).length;
  const firstIncompleteIndex = visiblePhases.findIndex(
    (phase) => !completedPhaseIds.has(phase.id),
  );
  const maxUnlockedIndex =
    firstIncompleteIndex === -1 ? visiblePhases.length - 1 : firstIncompleteIndex;
  const completedPhases = visiblePhases.filter((phase) => completedPhaseIds.has(phase.id));
  const visibleArtifacts = completedPhases.flatMap((phase) => phase.artifacts);
  const previewArtifact =
    activePhase.artifacts.find((artifact) => artifact.name === previewArtifactName) ??
    activePhase.artifacts[0];
  const progress = Math.round((completedVisibleCount / visiblePhases.length) * 100);
  const scenarioSummary = scenarioByPhase[activePhase.id] ?? "To be determined";

  useEffect(() => {
    document.title = activeProfile.config.pageTitle;
  }, [activeProfile.config.pageTitle]);

  useEffect(() => {
    const sentinel = controlsSentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setControlsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [activePhase.id]);

  function selectTrack(nextTrack: BmadTrack) {
    setTrack(nextTrack);
    const nextPhase = phases.find((phase) => phase.tracks.includes(nextTrack)) ?? phases[0];
    setActiveId(nextPhase.id);
    setPreviewArtifactName(null);
  }

  function selectProfile(nextProfileId: string) {
    const nextPhases = getPhasesForProfile(nextProfileId);
    setProfileId(nextProfileId);
    setTrack("method");
    setActiveId(nextPhases[0].id);
    setPreviewArtifactName(null);
    setCompletedPhaseIds(new Set());
    setReferenceExpanded(false);
    setScenarioByPhase({});
  }

  function resetDemoProgress() {
    setTrack("method");
    setActiveId(phases[0].id);
    setPreviewArtifactName(null);
    setCompletedPhaseIds(new Set());
    setReferenceExpanded(false);
    setScenarioByPhase({});
  }

  function selectPhase(phase: BmadPhase) {
    const nextIndex = visiblePhases.findIndex((item) => item.id === phase.id);

    if (nextIndex > maxUnlockedIndex) {
      return;
    }

    setActiveId(phase.id);
    setPreviewArtifactName(null);
  }

  function scrollToPhaseStart() {
    window.setTimeout(() => {
      phaseDetailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function completePhase(phaseId: string) {
    setCompletedPhaseIds((current) => {
      if (current.has(phaseId)) {
        return current;
      }

      const next = new Set(current);
      next.add(phaseId);
      return next;
    });
  }

  function goToPrevious() {
    const nextPhase = visiblePhases[Math.max(0, activeIndex - 1)];
    selectPhase(nextPhase);
    scrollToPhaseStart();
  }

  function goToNext() {
    const nextIndex = Math.min(visiblePhases.length - 1, activeIndex + 1);
    const nextPhase = visiblePhases[nextIndex];
    selectPhase(nextPhase);
    scrollToPhaseStart();
  }

  function handlePreviewArtifact(artifact: BmadArtifact) {
    setPreviewArtifactName((current) => (current === artifact.name ? null : artifact.name));
    window.setTimeout(() => {
      artifactPreviewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleScenarioDerived(phaseId: string, firstHumanInput: string) {
    setScenarioByPhase((current) => ({
      ...current,
      [phaseId]: summarizeScenarioFromHumanInput(firstHumanInput),
    }));
  }

  function clearScenarioSummary(phaseId: string) {
    setScenarioByPhase((current) => {
      const next = { ...current };
      delete next[phaseId];
      return next;
    });
  }

  return (
    <main className="bmad-demo-shell">
      <section className="bmad-intro" aria-labelledby="bmad-title">
        <div>
          <p className="bmad-kicker">{activeProfile.config.kicker}</p>
          <h1 id="bmad-title">{activeProfile.config.pageTitle}</h1>
          <p>{activeProfile.config.pageSubtitle}</p>
        </div>

        <div className="bmad-track-panel" aria-label="Planning track selector">
          <span>Client profile</span>
          <div className="bmad-profile-selector">
            <select
              aria-label="Client profile"
              value={profileId}
              onChange={(event) => selectProfile(event.target.value)}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={resetDemoProgress}>
              Reset demo
            </button>
          </div>
          <p className="bmad-profile-note">{activeProfile.description}</p>
          <span>Planning track</span>
          <div className="bmad-track-options">
            {(["method", "quick"] as BmadTrack[]).map((item) => (
              <button
                className={track === item ? "selected" : ""}
                key={item}
                type="button"
                onClick={() => selectTrack(item)}
              >
                {trackLabels[item]}
              </button>
            ))}
          </div>
          <p>{trackNotes[track]}</p>
        </div>
      </section>

      <section className="bmad-workspace" aria-label="BMAD workflow explorer">
        <aside className="bmad-timeline" aria-label="BMAD phases">
          <div className="bmad-progress">
            <span>Project progress</span>
            <strong>{progress}%</strong>
            <div>
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>

          {visiblePhases.map((phase, index) => (
            <button
              className={[
                "bmad-phase-button",
                phase.id === activePhase.id ? "active" : "",
                completedPhaseIds.has(phase.id) ? "complete" : "",
                index > maxUnlockedIndex ? "locked" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={index > maxUnlockedIndex}
              key={phase.id}
              type="button"
              onClick={() => selectPhase(phase)}
            >
              <span>{phase.eyebrow}</span>
              <strong>{phase.title}</strong>
              <em>
                {phase.status} · {phase.agent.icon} {phase.agent.name}
              </em>
            </button>
          ))}
        </aside>

        <article className="bmad-phase-detail" ref={phaseDetailRef}>
          <div className="bmad-phase-heading">
            <div>
              <p className="bmad-kicker">{activePhase.eyebrow}</p>
              <h2>{activePhase.title}</h2>
            </div>
            <div className="bmad-phase-badges">
              <span>{activePhase.status}</span>
              <span className="agent">
                <span className="bmad-agent-icon" aria-hidden="true">
                  {activePhase.agent.icon}
                </span>
                Agent: {activePhase.agent.name}
              </span>
            </div>
          </div>

          <p className="bmad-phase-purpose">{activePhase.purpose}</p>

          <div className="bmad-scenario">
            <span>{activeProfile.config.scenarioLabel}</span>
            <p>{activePhase.scenario}</p>
            <p className="bmad-workflow-summary">Summary: {scenarioSummary}</p>
          </div>

          <PhaseChat
            completed={completedPhaseIds.has(activePhase.id)}
            phase={activePhase}
            onComplete={() => completePhase(activePhase.id)}
            onDownload={downloadArtifact}
            onPreview={handlePreviewArtifact}
            profileId={profileId}
            onFirstHumanInput={(text) => handleScenarioDerived(activePhase.id, text)}
            onReset={() => clearScenarioSummary(activePhase.id)}
          />

          <section className={`bmad-reference-panel ${referenceExpanded ? "expanded" : ""}`}>
            <button
              className="bmad-reference-toggle"
              type="button"
              aria-expanded={referenceExpanded}
              onClick={() => setReferenceExpanded((expanded) => !expanded)}
            >
              <span>Inputs, workflows, and outputs</span>
              <strong>{referenceExpanded ? "Minimize" : "Expand"}</strong>
            </button>

            {referenceExpanded ? (
              <div className="bmad-phase-grid">
                <PhaseList title="Inputs" items={activePhase.inputs} tone="inputs" />
                <PhaseList title="Workflows" items={activePhase.workflows} code tone="workflows" />
                <PhaseList title="Expected outputs" items={activePhase.outputs} tone="outputs" />
              </div>
            ) : null}
          </section>

          <div className="bmad-help-panel">
            <span>BMAD-Help</span>
            <p>{activePhase.guide}</p>
          </div>

          <section className="bmad-artifact-preview" ref={artifactPreviewRef}>
            <div className="bmad-preview-heading">
              <div>
                <span>Preview documents</span>
                <strong>{activePhase.artifacts.length} generated</strong>
              </div>
            </div>

            <div className="bmad-preview-documents">
              {activePhase.artifacts.map((artifact) => {
                const isSelected = artifact.name === previewArtifactName;

                return (
                  <article
                    className={`bmad-preview-document ${isSelected ? "selected" : ""}`}
                    key={artifact.name}
                  >
                    <div className="bmad-preview-document-header">
                      <div>
                        <span>{artifact.description}</span>
                        <strong>{artifact.name}</strong>
                      </div>
                      <div className="bmad-preview-actions">
                        <button
                          aria-label={`Preview ${artifact.name}`}
                          className="bmad-icon-button"
                          title="Preview"
                          type="button"
                          onClick={() =>
                            setPreviewArtifactName((current) =>
                              current === artifact.name ? null : artifact.name,
                            )
                          }
                        >
                          👁️
                        </button>
                        <button
                          aria-label={`Download ${artifact.name}`}
                          className="bmad-icon-button"
                          title="Download"
                          type="button"
                          onClick={() => downloadArtifact(artifact)}
                        >
                          ⬇️
                        </button>
                      </div>
                    </div>
                    {isSelected ? <pre>{artifact.content}</pre> : null}
                  </article>
                );
              })}
            </div>
          </section>
        </article>

        <div className="bmad-controls-wrap">
          <div className="bmad-controls-sentinel" ref={controlsSentinelRef} />
          <nav
            className={`bmad-demo-controls ${controlsVisible ? "visible" : ""}`}
            aria-label="Demo controls"
            aria-hidden={!controlsVisible}
          >
            <button type="button" onClick={goToPrevious} disabled={activeIndex === 0}>
              ← Previous
            </button>
            <button type="button" onClick={() => downloadArtifact(previewArtifact)}>
              Download shown
            </button>
            <button
              className="primary"
              type="button"
              onClick={goToNext}
              disabled={activeIndex === visiblePhases.length - 1 || activeIndex >= maxUnlockedIndex}
            >
              Next phase →
            </button>
          </nav>
        </div>

        <aside className="bmad-artifact-stack" aria-label="Accumulated artifacts">
          <div className="bmad-stack-header">
            <span>Artifact stack</span>
            <strong>{visibleArtifacts.length}</strong>
          </div>
          <div className="bmad-stack-list">
            {visibleArtifacts.map((artifact) => (
              <button
                key={artifact.name}
                type="button"
                onClick={() => downloadArtifact(artifact)}
              >
                <span>FILE</span>
                <strong>{artifact.name}</strong>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function PhaseChat({
  completed,
  phase,
  profileId,
  onComplete,
  onPreview,
  onDownload,
  onFirstHumanInput,
  onReset,
}: {
  completed: boolean;
  phase: BmadPhase;
  profileId: string;
  onComplete: () => void;
  onPreview: (artifact: BmadArtifact) => void;
  onDownload: (artifact: BmadArtifact) => void;
  onFirstHumanInput: (text: string) => void;
  onReset: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState<number | null>(null);
  const [systemThinkingIndex, setSystemThinkingIndex] = useState<number | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const chatScreenRef = useRef<HTMLDivElement | null>(null);
  const hasReportedFirstHumanRef = useRef(false);
  const messages = useMemo(
    () =>
      getPhaseChat(phase).map((message) => ({
        ...message,
        text: applyContextForProfile(message.text, profileId),
        artifactName: message.artifactName
          ? applyContextForProfile(message.artifactName, profileId)
          : message.artifactName,
      })),
    [phase, profileId],
  );
  const visibleMessages = messages.slice(0, visibleCount);
  const isStarted = visibleCount > 0;
  const isComplete = visibleCount === messages.length;
  const isStreaming = streamingIndex !== null;
  const isThinking = thinkingIndex !== null;
  const isSystemThinking = systemThinkingIndex !== null;
  const isBusy = isStreaming || isThinking || isSystemThinking;
  const nextHumanIndex = messages.findIndex(
    (message, index) => index >= visibleCount && message.speaker === "human",
  );
  const hasNextHumanInput = nextHumanIndex !== -1;

  useEffect(() => {
    setVisibleCount(completed ? messages.length : 0);
    setStreamingIndex(null);
    setThinkingIndex(null);
    setSystemThinkingIndex(null);
    setStreamedText("");
    hasReportedFirstHumanRef.current = false;
  }, [completed, messages.length, phase.id]);

  useEffect(() => {
    const firstVisibleHuman = visibleMessages.find((message) => message.speaker === "human");

    if (firstVisibleHuman && !hasReportedFirstHumanRef.current) {
      onFirstHumanInput(firstVisibleHuman.text);
      hasReportedFirstHumanRef.current = true;
    }
  }, [onFirstHumanInput, visibleMessages]);

  useEffect(() => {
    if (isComplete && !completed) {
      onComplete();
    }
  }, [completed, isComplete, onComplete]);

  useEffect(() => {
    const chatScreen = chatScreenRef.current;

    if (!chatScreen) {
      return;
    }

    chatScreen.scrollTop = chatScreen.scrollHeight;
  }, [streamedText, thinkingIndex, visibleCount]);

  useEffect(() => {
    if (streamingIndex === null) {
      return;
    }

    const message = messages[streamingIndex];

    if (!message || message.speaker !== "agent") {
      setStreamingIndex(null);
      setStreamedText("");
      return;
    }

    setStreamedText("");
    let nextLength = 0;
    const streamTimer = window.setInterval(() => {
      nextLength += 1;
      setStreamedText(message.text.slice(0, nextLength));

      if (nextLength >= message.text.length) {
        window.clearInterval(streamTimer);
        setStreamingIndex(null);
      }
    }, 32);

    return () => window.clearInterval(streamTimer);
  }, [messages, streamingIndex]);

  useEffect(() => {
    if (!isStarted || isComplete || isBusy) {
      return;
    }

    const nextMessage = messages[visibleCount];

    if (!nextMessage || nextMessage.speaker === "human") {
      return;
    }

    if (nextMessage.speaker === "agent") {
      setThinkingIndex(visibleCount);
      return;
    }

    if (nextMessage.speaker === "system") {
      setSystemThinkingIndex(visibleCount);
      return;
    }

    const autoTimer = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(messages.length, current + 1));
    }, 450);

    return () => window.clearTimeout(autoTimer);
  }, [isBusy, isComplete, isStarted, messages, visibleCount]);

  useEffect(() => {
    if (thinkingIndex === null) {
      return;
    }

    const thinkingTimer = window.setTimeout(() => {
      setThinkingIndex(null);
      setVisibleCount((current) => Math.max(current, thinkingIndex + 1));
      setStreamingIndex(thinkingIndex);
    }, 2000);

    return () => window.clearTimeout(thinkingTimer);
  }, [thinkingIndex]);

  useEffect(() => {
    if (systemThinkingIndex === null) {
      return;
    }

    const systemTimer = window.setTimeout(() => {
      setSystemThinkingIndex(null);
      setVisibleCount((current) => Math.max(current, systemThinkingIndex + 1));
    }, 1100);

    return () => window.clearTimeout(systemTimer);
  }, [systemThinkingIndex]);

  function showNextHumanInput() {
    if (isBusy || !hasNextHumanInput) {
      return;
    }

    setVisibleCount(nextHumanIndex + 1);
  }

  function resetInteraction() {
    setVisibleCount(0);
    setStreamingIndex(null);
    setThinkingIndex(null);
    setSystemThinkingIndex(null);
    setStreamedText("");
    hasReportedFirstHumanRef.current = false;
    onReset();
  }

  function findArtifact(name?: string) {
    return phase.artifacts.find((artifact) => artifact.name === name);
  }

  return (
    <section className="bmad-chat-panel" aria-label={`${phase.title} interaction simulation`}>
      <div className="bmad-chat-header">
        <div>
          <span>Human and BMAD simulation</span>
          <strong>
            {phase.agent.icon} {phase.agent.name}
          </strong>
        </div>
        <div className="bmad-chat-count">
          {visibleCount}/{messages.length}
        </div>
      </div>

      <div className={`bmad-chat-screen ${isStarted ? "" : "empty"}`} ref={chatScreenRef}>
        {!isStarted ? (
          <div className="bmad-chat-empty">
            <span aria-hidden="true">💬</span>
            <strong>Start the BMAD interaction</strong>
            <p>Click start to step through how the human and BMAD agent create this phase output.</p>
          </div>
        ) : (
          <>
            {visibleMessages.map((message, index) => {
              const artifact = findArtifact(message.artifactName);

              return (
                <div className={`bmad-chat-message ${message.speaker}`} key={`${message.text}-${index}`}>
                  {message.speaker !== "artifact" ? (
                    <>
                      <span>
                        {message.speaker === "human"
                          ? "Human"
                          : message.speaker === "agent"
                            ? `${phase.agent.icon} AI Agent: ${phase.agent.name}`
                            : "System"}
                      </span>
                      <p>
                        {message.speaker === "agent" && streamingIndex === index
                          ? streamedText
                          : message.text}
                        {message.speaker === "agent" && streamingIndex === index ? (
                          <i className="bmad-stream-cursor" aria-hidden="true" />
                        ) : null}
                      </p>
                    </>
                  ) : (
                    <div className="bmad-chat-artifact-card">
                      <span>Artifact created</span>
                      <p>{message.text}</p>
                      {artifact ? (
                        <div>
                          <strong>{artifact.name}</strong>
                          <button type="button" onClick={() => onPreview(artifact)}>
                            Preview
                          </button>
                          <button type="button" onClick={() => onDownload(artifact)}>
                            Download
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
            {thinkingIndex !== null ? (
              <div className="bmad-chat-message agent thinking">
                <span>
                  {phase.agent.icon} AI Agent: {phase.agent.name}
                </span>
                <p>
                  BMAD Agent is thinking
                  <i aria-hidden="true" />
                </p>
              </div>
            ) : null}
            {systemThinkingIndex !== null ? (
              <div className="bmad-chat-message system pending">
                <span>System</span>
                <p>Running BMAD action</p>
              </div>
            ) : null}
            <div className="bmad-chat-end" />
          </>
        )}
      </div>

      <div className="bmad-chat-actions">
        <button type="button" onClick={resetInteraction} disabled={!isStarted}>
          Reset
        </button>
        <button
          className="primary"
          type="button"
          onClick={showNextHumanInput}
          disabled={isComplete || isBusy || !hasNextHumanInput}
        >
          {!isStarted
            ? "Start interaction"
            : isThinking
              ? "BMAD Agent is thinking"
              : isSystemThinking
                ? "Running BMAD action"
                : isStreaming
                  ? "Streaming response"
                  : isComplete
                    ? "Interaction complete"
                    : "Next human input"}
        </button>
      </div>
    </section>
  );
}

function PhaseList({
  title,
  items,
  code = false,
  tone,
}: {
  title: string;
  items: string[];
  code?: boolean;
  tone: "inputs" | "workflows" | "outputs";
}) {
  const iconByTitle: Record<string, string> = {
    Inputs: "📥",
    Workflows: "⚙️",
    "Expected outputs": "📤",
  };
  const icon = iconByTitle[title] ?? "•";

  return (
    <section className={`bmad-list-panel ${tone}`}>
      <h3>
        <span className="bmad-list-icon" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{code ? <code>{item}</code> : item}</li>
        ))}
      </ul>
    </section>
  );
}
