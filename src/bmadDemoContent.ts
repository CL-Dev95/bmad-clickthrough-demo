export type BmadTrack = "method" | "quick";

export type BmadArtifact = {
  name: string;
  description: string;
  content: string;
};

export type ChatMessage = {
  speaker: "human" | "agent" | "system" | "artifact";
  text: string;
  artifactName?: string;
};

export type BmadPhase = {
  id: string;
  eyebrow: string;
  title: string;
  status: string;
  agent: {
    icon: string;
    name: string;
  };
  purpose: string;
  scenario: string;
  workflowSummary: string;
  guide: string;
  workflows: string[];
  inputs: string[];
  outputs: string[];
  artifacts: BmadArtifact[];
  tracks: BmadTrack[];
};

export type DemoClientConfig = {
  pageTitle: string;
  pageSubtitle: string;
  kicker: string;
  scenarioLabel: string;
};

export type DemoDomainContext = {
  projectName: string;
  projectSlug: string;
  organization: string;
  organizationStyle: string;
};

export type DemoProfile = {
  id: string;
  label: string;
  description: string;
  config: DemoClientConfig;
  context: DemoDomainContext;
};

const basePhases: BmadPhase[] = [
  {
    id: "start",
    eyebrow: "Start",
    title: "Install and Ask BMAD-Help",
    status: "Required",
    agent: { icon: "🧭", name: "BMAD-Help" },
    purpose:
      "Initialize the workspace and choose the right BMAD path.",
    scenario:
      "A human project manager, product owner, stakeholder, or project team begins BMAD inside a code IDE and uses StormBrief as the project concept.",
    workflowSummary:
      "The interaction installs BMAD into the project filesystem, then BMAD-Help reads the app request and recommends the right planning path.",
    guide:
      "Next: Run product brief or PRD in a fresh chat.",
    workflows: ["npx bmad-method install", "bmad-help"],
    inputs: ["Project folder", "StormBrief idea", "Preferred AI IDE"],
    outputs: ["_bmad/", "_bmad-output/", "Recommended next workflow"],
    tracks: ["method", "quick"],
    artifacts: [
      {
        name: "stormbrief-bmad-help-guidance.md",
        description: "Initial guidance returned after installation.",
        content: `# BMAD-Help Guidance

Project: StormBrief

Recommended track: BMad Method

Reason:
- Multiple operational user groups
- NOAA weather, coastal, marine, and hydrologic data dependencies
- Human review required before sharing public-safety guidance
- Requirements, architecture, and implementation stories need to stay aligned

Next recommended workflow:
Run bmad-product-brief or bmad-prd in a fresh chat.
`,
      },
    ],
  },
  {
    id: "analysis",
    eyebrow: "Phase 1",
    title: "Analysis",
    status: "Optional",
    agent: { icon: "🕵️", name: "Analyst" },
    purpose:
      "Clarify users, hazards, data sources, and product boundaries.",
    scenario:
      "Emergency managers, harbor operators, and forecasters need concise risk context.",
    workflowSummary:
      "Analysis workflows turn the rough product idea into research, assumptions, and a product brief.",
    guide:
      "Next: Create a product brief, or use PRFAQ to challenge the concept.",
    workflows: [
      "bmad-brainstorming",
      "bmad-market-research",
      "bmad-domain-research",
      "bmad-technical-research",
      "bmad-product-brief",
      "bmad-prfaq",
    ],
    inputs: [
      "Raw product idea",
      "Emergency management workflow notes",
      "NOAA data-source assumptions",
      "Known alerting and briefing pain points",
    ],
    outputs: [
      "brainstorming-report.md",
      "research findings",
      "product-brief.md",
      "prfaq.md",
    ],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-product-brief.md",
        description: "Strategic foundation for the NOAA-related product.",
        content: `# Product Brief: StormBrief

## Problem
Operational teams must synthesize weather alerts, marine forecasts, rainfall outlooks, storm surge guidance, and local vulnerability context into briefings that partners can act on quickly.

## Users
- NOAA/NWS-style forecaster
- Emergency management partner
- Harbor or coastal operations coordinator
- Public works incident lead

## Product Direction
Create an internal briefing workspace that drafts source-backed impact summaries, keeps experts in control, and preserves traceability to source data and reviewer decisions.

## Success Signals
- Faster briefing preparation during severe weather events
- More consistent impact language across offices
- Clearer connection between data inputs and operational recommendations
`,
      },
      {
        name: "stormbrief-prfaq.md",
        description: "Working-backwards challenge document.",
        content: `# PRFAQ: StormBrief

## Press Release
StormBrief helps operational weather teams transform trusted NOAA-style guidance and local risk context into reviewed, impact-focused briefings for emergency managers and coastal operators.

## FAQ
### Does StormBrief publish automatically?
No. Every briefing requires human review and approval.

### What data does it use?
The first release focuses on weather alerts, marine forecast zones, rainfall risk, coastal water level context, and local watch areas.

### What makes it valuable?
It reduces assembly time while improving consistency, auditability, and confidence in briefing language.
`,
      },
    ],
  },
  {
    id: "planning",
    eyebrow: "Phase 2",
    title: "Planning",
    status: "Required",
    agent: { icon: "👩‍💼", name: "Product Manager" },
    purpose:
      "Define users, workflows, constraints, and acceptance boundaries.",
    scenario:
      "The team needs requirements for alerts, maps, briefings, review, and export.",
    workflowSummary:
      "The PRD workflow defines users, requirements, constraints, and success criteria for StormBrief.",
    guide:
      "Next: Run bmad-prd in a fresh chat.",
    workflows: ["bmad-prd"],
    inputs: ["Product brief", "PRFAQ", "Research findings", "Stakeholder constraints"],
    outputs: ["prd.md", "addendum.md", "decision-log.md", "validation-report.html"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-prd.md",
        description: "Requirements for NOAA-related operational users.",
        content: `# PRD: StormBrief

## Goal
Enable operational weather teams to create reviewed, consistent impact briefings from trusted environmental guidance and local context.

## Primary Users
- Forecaster: prepares and edits briefings
- Lead forecaster: reviews and approves briefings
- Emergency manager: receives concise impact summaries
- Harbor operator: monitors marine and coastal hazards

## Requirements
1. Ingest weather alerts, marine forecast zones, rainfall risk, and coastal context.
2. Let users define watch zones and briefing audiences.
3. Generate draft impact language with source traceability.
4. Require human review before export or sharing.
5. Preserve a decision log for each briefing.
6. Meet accessibility expectations for operational dashboards.
`,
      },
      {
        name: "stormbrief-decision-log.md",
        description: "Planning choices that remain visible.",
        content: `# Decision Log

## D-001: Human approval is mandatory
Rationale: Public-safety messaging requires expert judgment.

## D-002: Data provenance must be visible
Rationale: Users need to understand which observations and forecasts shaped the draft.

## D-003: Start with briefings, not automatic alerts
Rationale: A controlled workflow gives the team a measurable first release and avoids premature automation.
`,
      },
    ],
  },
  {
    id: "ux",
    eyebrow: "Optional",
    title: "UX Design",
    status: "Recommended",
    agent: { icon: "👩‍🎨", name: "UX Expert" },
    purpose:
      "Design the dashboard, triage flow, composer, review states, and export path.",
    scenario:
      "Forecasters need a dense workspace that keeps source data visible.",
    workflowSummary:
      "The UX workflow shapes the dashboard, briefing composer, review queue, and export experience.",
    guide:
      "Next: Run UX after PRD because StormBrief is a user-facing tool.",
    workflows: ["bmad-agent-ux-designer", "bmad-ux"],
    inputs: ["PRD", "Primary personas", "Critical user flows", "Accessibility constraints"],
    outputs: ["ux-spec.md", "screen-flow-notes.md", "interaction decisions"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-ux-spec.md",
        description: "Operational interface design notes.",
        content: `# UX Spec: StormBrief

## Primary Views
- Operations dashboard with active hazards, watch zones, and briefing status
- Event detail page with source data, forecast confidence, and local impacts
- Briefing composer with source-linked generated text
- Review queue with approval, requested changes, and export controls

## Interaction Principles
- Keep source timestamps visible
- Make degraded data states explicit
- Separate draft language from approved language
- Avoid decorative UI that slows scanning during events
`,
      },
    ],
  },
  {
    id: "architecture",
    eyebrow: "Phase 3",
    title: "Architecture",
    status: "BMad Method",
    agent: { icon: "👨‍💻", name: "Architect" },
    purpose:
      "Convert requirements into technical decisions before story creation.",
    scenario:
      "StormBrief needs adapters, geospatial services, review controls, and audit logs.",
    workflowSummary:
      "The architecture workflow translates requirements into system components, data boundaries, and technical decisions.",
    guide:
      "Next: Create architecture before epics and stories.",
    workflows: ["bmad-agent-architect", "bmad-create-architecture"],
    inputs: ["PRD", "UX spec", "NOAA data constraints", "Project context"],
    outputs: ["architecture.md", "architecture decision records", "technical risks"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-architecture.md",
        description: "Technical structure for the StormBrief platform.",
        content: `# Architecture: StormBrief

## Components
- Data adapters for alerts, marine zones, rainfall outlooks, and coastal observations
- Geospatial watch-zone service
- Briefing rules engine for local thresholds and impact phrasing
- Review workflow with role-based approval
- Audit log for source data, generated text, edits, and exports

## Key Decisions
- Keep operational users in control of final messaging
- Store source snapshots with each briefing
- Degrade gracefully when a data feed is delayed
- Treat exports as reviewed artifacts, not live data feeds
`,
      },
    ],
  },
  {
    id: "epics",
    eyebrow: "Backlog",
    title: "Epics and Stories",
    status: "Required",
    agent: { icon: "👩‍💼", name: "Product Manager" },
    purpose:
      "Turn the PRD and architecture into implementable work.",
    scenario:
      "First work covers alert ingestion, watch zones, briefings, review, and exports.",
    workflowSummary:
      "The backlog workflow converts planning and architecture into epics, stories, and acceptance criteria.",
    guide:
      "Next: Create stories after architecture decisions are clear.",
    workflows: ["bmad-agent-pm", "bmad-create-epics-and-stories"],
    inputs: ["PRD", "Architecture", "UX spec", "Decision log"],
    outputs: ["epics/", "story files", "acceptance criteria", "implementation sequence"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-epic-alert-ingestion.md",
        description: "First technically informed epic.",
        content: `# Epic 1: Alert and Forecast Ingestion

## Objective
Bring core weather, marine, rainfall, and coastal hazard data into the briefing workspace with clear provenance and freshness indicators.

## Stories
1. Ingest active weather alerts for configured zones.
2. Map marine and coastal zones to user-defined watch areas.
3. Display data freshness and source metadata.
4. Alert the user when required data is stale or unavailable.
`,
      },
      {
        name: "stormbrief-story-watch-zone-alerts.md",
        description: "Example implementation story.",
        content: `# Story: Watch Zone Alerts

## User Story
As a forecaster, I want StormBrief to show active alerts for configured watch zones so that I can quickly decide whether a briefing needs to be drafted or updated.

## Acceptance Criteria
- Given a configured watch zone, active alerts appear in the operations dashboard.
- Each alert shows source, issued time, expiration time, and affected zones.
- Stale or unavailable data is shown as a degraded state.
- The user can open an alert and start a briefing draft from it.
`,
      },
    ],
  },
  {
    id: "readiness",
    eyebrow: "Gate",
    title: "Readiness Check",
    status: "Recommended",
    agent: { icon: "👨‍💻", name: "Architect" },
    purpose:
      "Check that requirements, UX, architecture, and stories align.",
    scenario:
      "The team needs a clear ready, concerns, or blocked decision.",
    workflowSummary:
      "The readiness workflow checks whether the PRD, UX, architecture, and stories are coherent enough to build.",
    guide:
      "Next: Resolve gaps before sprint planning.",
    workflows: ["bmad-agent-architect", "bmad-check-implementation-readiness"],
    inputs: ["PRD", "Architecture", "UX spec", "Epics and stories"],
    outputs: ["readiness-report.md", "PASS / CONCERNS / FAIL decision", "risk list"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-readiness-report.md",
        description: "Implementation readiness gate.",
        content: `# Implementation Readiness Check

Decision: CONCERNS

Strengths:
- PRD, architecture, and first epic align.
- Human approval and audit trail are represented in requirements and architecture.
- Degraded data states are covered in UX and story acceptance criteria.

Concerns:
- Authentication boundary needs confirmation.
- Production data availability expectations need owner review.
- Export retention policy needs a final decision.
`,
      },
    ],
  },
  {
    id: "sprint",
    eyebrow: "Phase 4",
    title: "Sprint Planning",
    status: "Implementation",
    agent: { icon: "👨‍🔧", name: "Developer" },
    purpose:
      "Initialize tracking and choose the first implementation sequence.",
    scenario:
      "The first sprint covers alerts, watch zones, freshness, and draft initiation.",
    workflowSummary:
      "Sprint planning chooses the next implementation sequence and records story status in sprint tracking.",
    guide:
      "Next: Initialize sprint tracking, then select the first story.",
    workflows: ["bmad-agent-dev", "bmad-sprint-planning"],
    inputs: ["Epics", "Story backlog", "Architecture", "Project context"],
    outputs: ["sprint-status.yaml", "selected story sequence", "implementation state"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-sprint-status.yaml",
        description: "Sprint tracking for the demo backlog.",
        content: `project: stormbrief
current_epic: alert-and-forecast-ingestion
stories:
  - id: watch-zone-alerts
    status: ready
  - id: marine-zone-mapping
    status: drafted
  - id: briefing-draft-initiation
    status: backlog
  - id: source-freshness-banner
    status: backlog
`,
      },
    ],
  },
  {
    id: "build",
    eyebrow: "Loop",
    title: "Build Cycle",
    status: "Repeat",
    agent: { icon: "👨‍🔧", name: "Developer" },
    purpose:
      "Build, review, and improve one story at a time.",
    scenario:
      "The team repeats the loop for alerts, maps, briefings, and exports.",
    workflowSummary:
      "The build workflows create one story, implement it, review it, and capture lessons before moving on.",
    guide:
      "Next: Create story, develop story, review, then repeat.",
    workflows: [
      "bmad-create-story",
      "bmad-dev-story",
      "bmad-code-review",
      "bmad-retrospective",
    ],
    inputs: ["Sprint status", "Selected story", "Existing codebase", "Acceptance criteria"],
    outputs: ["story-[slug].md", "working code and tests", "code review notes", "retrospective.md"],
    tracks: ["method"],
    artifacts: [
      {
        name: "stormbrief-code-review.md",
        description: "Example quality validation output.",
        content: `# Code Review: Watch Zone Alerts

Decision: Changes requested

Findings:
- Add tests for stale alert data.
- Expose source timestamps in the alert detail panel.
- Confirm empty-state copy with operational users.
- Ensure keyboard focus returns to the selected alert after closing the detail panel.
`,
      },
      {
        name: "stormbrief-retrospective.md",
        description: "Epic learning captured after implementation.",
        content: `# Retrospective: Alert and Forecast Ingestion

## Worked Well
- Story acceptance criteria were specific enough for implementation.
- Architecture decisions helped avoid source-provenance gaps.

## Improve Next Epic
- Add mock data contracts before implementation.
- Decide export retention rules before story creation.
`,
      },
    ],
  },
  {
    id: "quick-flow",
    eyebrow: "Shortcut",
    title: "Quick Flow",
    status: "Small Scope",
    agent: { icon: "👨‍🔧", name: "Developer" },
    purpose:
      "Use one compact workflow for a small, clear enhancement.",
    scenario:
      "A team wants to add CSV export to an existing approved briefing table.",
    workflowSummary:
      "Quick Flow produces a compact spec and implementation path for one small, well-understood change.",
    guide:
      "Next: Run bmad-quick-dev with clear acceptance criteria.",
    workflows: ["bmad-quick-dev"],
    inputs: ["Clear bug or enhancement", "Existing codebase", "Known acceptance criteria"],
    outputs: ["spec-*.md", "working code", "review summary"],
    tracks: ["quick"],
    artifacts: [
      {
        name: "stormbrief-quick-flow-csv-export.md",
        description: "Compact plan for a small enhancement.",
        content: `# Quick Flow Spec: CSV Export

## Change
Add a CSV export action to the existing approved-briefings table.

## Acceptance Criteria
- Export includes briefing title, event window, zones, impact level, reviewer, and approval timestamp.
- Export is disabled until the briefing is approved.
- CSV output handles commas, quotes, and line breaks safely.
- Export action is keyboard accessible.
`,
      },
    ],
  },
];

export const trackLabels: Record<BmadTrack, string> = {
  method: "BMad Method",
  quick: "Quick Flow",
};

export const defaultProfileId = "noaalink";

const demoProfiles: DemoProfile[] = [
  {
    id: "noaalink",
    label: "NOAA / Weather Ops",
    description: "Operational weather and hazard briefing context.",
    config: {
      pageTitle: "NOAALink Project Management Accelerator",
      pageSubtitle:
        "This tool, using agentic AI frameworks, accelerates the creation of functional and technical artifacts to support agile project execution.",
      kicker: "Building a Tailored Application Using the BMAD Method",
      scenarioLabel: "Scenario",
    },
    context: {
      projectName: "StormBrief",
      projectSlug: "stormbrief",
      organization: "NOAA",
      organizationStyle: "NOAA-style",
    },
  },
  {
    id: "carelink",
    label: "Healthcare Operations",
    description: "Hospital command-center and triage coordination context.",
    config: {
      pageTitle: "CareLink Project Management Accelerator",
      pageSubtitle:
        "This tool, using agentic AI frameworks, accelerates the creation of functional and technical artifacts to support agile project execution.",
      kicker: "Building a Tailored Application Using the BMAD Method",
      scenarioLabel: "Scenario",
    },
    context: {
      projectName: "CareBrief",
      projectSlug: "carebrief",
      organization: "HHS",
      organizationStyle: "public-health-style",
    },
  },
  {
    id: "gridlink",
    label: "Utilities / Grid Operations",
    description: "Utility outage, weather risk, and restoration planning context.",
    config: {
      pageTitle: "GridLink Project Management Accelerator",
      pageSubtitle:
        "This tool, using agentic AI frameworks, accelerates the creation of functional and technical artifacts to support agile project execution.",
      kicker: "Building a Tailored Application Using the BMAD Method",
      scenarioLabel: "Scenario",
    },
    context: {
      projectName: "GridBrief",
      projectSlug: "gridbrief",
      organization: "Regional Utility Operations",
      organizationStyle: "utility-operations-style",
    },
  },
];

export function getDemoProfiles(): DemoProfile[] {
  return demoProfiles;
}

export function getDemoProfile(profileId: string): DemoProfile {
  return demoProfiles.find((profile) => profile.id === profileId) ?? demoProfiles[0];
}

function applyContextToText(value: string, context: DemoDomainContext): string {
  return value
    .replace(/StormBrief/g, context.projectName)
    .replace(/stormbrief/g, context.projectSlug)
    .replace(/NOAA-style/g, context.organizationStyle)
    .replace(/NOAA/g, context.organization);
}

export function applyContextForProfile(value: string, profileId: string): string {
  return applyContextToText(value, getDemoProfile(profileId).context);
}

function applyContextToPhase(phase: BmadPhase, context: DemoDomainContext): BmadPhase {
  return {
    ...phase,
    title: applyContextToText(phase.title, context),
    purpose: applyContextToText(phase.purpose, context),
    scenario: applyContextToText(phase.scenario, context),
    workflowSummary: applyContextToText(phase.workflowSummary, context),
    guide: applyContextToText(phase.guide, context),
    inputs: phase.inputs.map((item) => applyContextToText(item, context)),
    outputs: phase.outputs.map((item) => applyContextToText(item, context)),
    artifacts: phase.artifacts.map((artifact) => ({
      ...artifact,
      name: applyContextToText(artifact.name, context),
      description: applyContextToText(artifact.description, context),
      content: applyContextToText(artifact.content, context),
    })),
  };
}

export function getPhasesForProfile(profileId: string): BmadPhase[] {
  const profile = getDemoProfile(profileId);
  return basePhases.map((phase) => applyContextToPhase(phase, profile.context));
}

export function getTrackNotes(profileId: string): Record<BmadTrack, string> {
  const profile = getDemoProfile(profileId);
  return {
    method: `Best fit for ${profile.context.projectName}: PRD, UX, architecture, epics, and implementation stories stay connected.`,
    quick:
      "Use for a small enhancement when scope and architecture are already settled.",
  };
}

function compactChat(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.speaker !== "artifact" || Boolean(message.artifactName));
}

export function getPhaseChat(phase: BmadPhase): ChatMessage[] {
  const primaryArtifact = phase.artifacts[0];
  const secondaryArtifact = phase.artifacts[1];

  switch (phase.id) {
    case "start":
      return [
        {
          speaker: "human",
          text: "Create an application that helps NOAA-style forecast teams turn alerts, marine forecasts, rainfall risk, and coastal observations into reviewed impact briefings. Use /docs/stormbrief-concept-note.md as the starting reference.",
        },
        {
          speaker: "system",
          text: "Human runs npx bmad-method install in the code IDE terminal. BMAD is installed into the project filesystem with workspace folders for method assets and generated outputs.",
        },
        {
          speaker: "agent",
          text: "I will use the StormBrief concept note as source context. If scope, users, or constraints are missing, I will ask for that context before recommending a BMAD path.",
        },
        {
          speaker: "system",
          text: "BMAD checks scope, risk, users, data dependencies, and implementation surface.",
        },
        {
          speaker: "agent",
          text: "From the context provided, StormBrief has forecast-team users, source-data constraints, human review, and a buildable product surface. Use the BMad Method track.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the initial BMAD guidance document and identify the next planning workflow.",
        },
        {
          speaker: "artifact",
          text: "Guidance created with the recommended next workflow.",
          artifactName: primaryArtifact.name,
        },
      ];
    case "analysis":
      return compactChat([
        {
          speaker: "human",
          text: "We need to clarify the StormBrief opportunity before writing requirements.",
        },
        {
          speaker: "agent",
          text: "I will use the concept context and ask for clarification around users, hazards, NOAA-style data assumptions, pain points, and product boundaries.",
        },
        {
          speaker: "system",
          text: "Running analysis workflows: brainstorming, domain research, product brief, and optional PRFAQ.",
        },
        {
          speaker: "agent",
          text: "Based on the context so far, the strongest direction is an internal briefing workspace for forecasters, emergency managers, and harbor operators.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the product brief and optional PRFAQ for stakeholder review.",
        },
        {
          speaker: "artifact",
          text: "Analysis output created for stakeholder review.",
          artifactName: primaryArtifact.name,
        },
        {
          speaker: "artifact",
          text: "Optional challenge document created to test the product concept.",
          artifactName: secondaryArtifact?.name,
        },
      ]);
    case "planning":
      return compactChat([
        {
          speaker: "human",
          text: "Turn the StormBrief concept into requirements.",
        },
        {
          speaker: "agent",
          text: "I will use the product brief as context. Before drafting the PRD, please confirm the primary user roles and any constraints that should shape the requirements.",
        },
        {
          speaker: "human",
          text: "Use forecasters, lead reviewers, emergency managers, and harbor operators as primary users.",
        },
        {
          speaker: "system",
          text: "Drafting PRD sections: goals, users, functional requirements, review workflow, accessibility, and data provenance.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the PRD and decision log for StormBrief.",
        },
        {
          speaker: "artifact",
          text: "PRD created for the StormBrief build path.",
          artifactName: primaryArtifact.name,
        },
        {
          speaker: "artifact",
          text: "Decision log created to preserve planning choices.",
          artifactName: secondaryArtifact?.name,
        },
      ]);
    case "ux":
      return [
        {
          speaker: "human",
          text: "Design the StormBrief interface for operational use.",
        },
        {
          speaker: "agent",
          text: "I will use the PRD context and ask for any missing workflow details before shaping the dashboard, alert details, briefing composer, and review queue.",
        },
        {
          speaker: "system",
          text: "Translating PRD requirements into screen flows and interaction decisions.",
        },
        {
          speaker: "agent",
          text: "Using the provided workflow context, the interface should prioritize scanning, source timestamps, degraded data states, and clear draft versus approved language.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the UX specification for the StormBrief operational interface.",
        },
        {
          speaker: "artifact",
          text: "UX specification created for design and implementation alignment.",
          artifactName: primaryArtifact.name,
        },
      ];
    case "architecture":
      return [
        {
          speaker: "human",
          text: "Create the technical architecture for StormBrief.",
        },
        {
          speaker: "agent",
          text: "I will use the PRD and UX context. If integration, security, or data-retention details are missing, I will request that context before finalizing architecture.",
        },
        {
          speaker: "system",
          text: "Evaluating data boundaries, resilience, export controls, and implementation risks.",
        },
        {
          speaker: "agent",
          text: "Based on the available technical context, the core architecture keeps experts in control, stores source snapshots, and handles delayed feeds with explicit degraded states.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the architecture documentation for StormBrief.",
        },
        {
          speaker: "artifact",
          text: "Architecture document created for story generation.",
          artifactName: primaryArtifact.name,
        },
      ];
    case "epics":
      return compactChat([
        {
          speaker: "human",
          text: "Break StormBrief into implementable epics and stories.",
        },
        {
          speaker: "agent",
          text: "I will use the PRD, UX spec, architecture, and decision log as context. If priority or sequencing is unclear, I will ask before creating backlog slices.",
        },
        {
          speaker: "system",
          text: "Creating epic sequence: ingestion, watch zones, briefing composition, review, and exports.",
        },
        {
          speaker: "agent",
          text: "Given the current product and architecture context, the first epic should establish trusted alert and forecast ingestion with provenance and freshness indicators.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the first epic and implementation story.",
        },
        {
          speaker: "artifact",
          text: "Epic created with implementation-oriented story boundaries.",
          artifactName: primaryArtifact.name,
        },
        {
          speaker: "artifact",
          text: "First story drafted with acceptance criteria.",
          artifactName: secondaryArtifact?.name,
        },
      ]);
    case "readiness":
      return [
        {
          speaker: "human",
          text: "Check whether StormBrief is ready for implementation.",
        },
        {
          speaker: "agent",
          text: "I will use the PRD, UX, architecture, epics, and stories as context, then call out any missing owner decisions or conflicting assumptions.",
        },
        {
          speaker: "system",
          text: "Assessing requirement coverage, architecture alignment, story completeness, and unresolved risks.",
        },
        {
          speaker: "agent",
          text: "The context is mostly aligned, but I need owner confirmation on authentication, production data expectations, and export retention.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the implementation readiness report and document the remaining concerns.",
        },
        {
          speaker: "artifact",
          text: "Readiness report created with a CONCERNS decision.",
          artifactName: primaryArtifact.name,
        },
      ];
    case "sprint":
      return [
        {
          speaker: "human",
          text: "Initialize sprint planning for the first StormBrief implementation pass.",
        },
        {
          speaker: "agent",
          text: "I will use the backlog and architecture context to select a practical first sequence, and I will ask for capacity or priority context if it is missing.",
        },
        {
          speaker: "system",
          text: "Selecting first sprint: watch-zone alerts, marine zone mapping, draft initiation, and freshness banners.",
        },
        {
          speaker: "agent",
          text: "Based on the available sprint context, the first ready story is watch-zone alerts because it proves ingestion, zone matching, and operational visibility.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the sprint tracking file and first implementation sequence.",
        },
        {
          speaker: "artifact",
          text: "Sprint tracking file created.",
          artifactName: primaryArtifact.name,
        },
      ];
    case "build":
      return compactChat([
        {
          speaker: "human",
          text: "Start the BMAD build loop for the selected story.",
        },
        {
          speaker: "agent",
          text: "I will use the selected story, acceptance criteria, and codebase context. If implementation details are missing, I will request them before coding.",
        },
        {
          speaker: "system",
          text: "Simulating create story, develop story, code review, and retrospective.",
        },
        {
          speaker: "agent",
          text: "Using the implementation context, the review catches stale-data test coverage, source timestamp visibility, and keyboard focus follow-up.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the code review output and retrospective notes.",
        },
        {
          speaker: "artifact",
          text: "Code review output created.",
          artifactName: primaryArtifact.name,
        },
        {
          speaker: "artifact",
          text: "Retrospective captured for the next epic.",
          artifactName: secondaryArtifact?.name,
        },
      ]);
    case "quick-flow":
      return [
        {
          speaker: "human",
          text: "We only need CSV export for approved briefings. Can BMAD stay lightweight?",
        },
        {
          speaker: "agent",
          text: "Yes. Based on the context provided, Quick Flow is appropriate because the change is narrow, the acceptance criteria are clear, and architecture is settled.",
        },
        {
          speaker: "system",
          text: "Creating a compact spec and implementation checklist for one enhancement.",
        },
        {
          speaker: "agent",
          text: "Using that enhancement context, the export must include approved briefing metadata, handle CSV escaping, and stay disabled until approval.",
        },
        {
          speaker: "agent",
          text: "I have enough context to create the Quick Flow specification for the CSV export enhancement.",
        },
        {
          speaker: "artifact",
          text: "Quick Flow spec created.",
          artifactName: primaryArtifact.name,
        },
      ];
    default:
      return [];
  }
}
