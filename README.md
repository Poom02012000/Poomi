# Poomi — Claude Code Remote Control

> A spec for driving Claude Code agents remotely — start, steer, and monitor
> coding sessions from your phone, the web, or a chat app, without sitting at
> the terminal.

**Status:** Draft spec (v0.1). No implementation yet — this document defines
what we intend to build before any code lands.

---

## 1. Problem

Claude Code is powerful at the terminal, but real work doesn't wait for you to
be at your desk. You want to:

- Kick off a task while you're away ("fix the failing CI on `main`").
- Check in on a long-running agent from your phone.
- Approve or reject a risky action (a `git push`, a destructive command)
  without SSHing in.
- Pick a session back up later, with its full context intact.

**Poomi** is the remote-control layer that makes a Claude Code session
reachable from anywhere, safely.

---

## 2. Goals & Non-Goals

### Goals
- **Remote start** — launch a Claude Code session from a phone/web client.
- **Remote steer** — send follow-up messages into a live session.
- **Remote monitor** — stream progress, tool calls, and results back to the client.
- **Approval gating** — surface permission prompts remotely and let the user
  approve/deny before a risky action runs.
- **Session continuity** — a session survives disconnects and can be resumed.
- **Secure by default** — authenticated, authorized, auditable.

### Non-Goals (for v0.1)
- Multi-user collaboration on a single session (one owner per session).
- A full IDE experience — this is control + monitoring, not editing.
- Running arbitrary shell outside the agent's sandbox.

---

## 3. Core Concepts

| Concept | Meaning |
|---|---|
| **Session** | A running Claude Code agent bound to one repo + working directory. Has an ID, an owner, and a lifecycle (starting → active → idle → ended). |
| **Environment** | The sandboxed container a session runs in (repo cloned fresh, ephemeral disk). |
| **Client** | A remote surface — mobile app, web dashboard, or chat integration — that talks to a session. |
| **Command** | A message or instruction sent *into* a session (a prompt, an approval, a stop). |
| **Event** | A message streamed *out* of a session (agent text, tool call, permission request, completion). |
| **Trigger** | A scheduled or event-driven rule that wakes/starts a session automatically (e.g. cron, PR webhook). |

---

## 4. Architecture (proposed)

```
  ┌────────────┐        ┌──────────────────┐        ┌─────────────────────┐
  │  Client(s) │  <-->  │   Poomi Gateway  │  <-->  │  Session Runner(s)  │
  │ phone/web/ │  WS/   │  auth · routing  │  RPC/  │  Claude Code agent  │
  │   chat     │ HTTPS  │  approval queue  │ queue  │  in sandboxed env   │
  └────────────┘        └──────────────────┘        └─────────────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │  Persistence  │  sessions, events, audit log
                      └───────────────┘
```

- **Gateway** — the always-on service. Authenticates clients, routes commands
  to the right session, buffers events, and holds the approval queue.
- **Session Runner** — hosts one Claude Code agent in an isolated environment.
  Ephemeral; state worth keeping is committed/pushed by the agent itself.
- **Persistence** — durable store for session metadata, an event log (for
  replay/resume), and an immutable audit trail.

---

## 5. Interaction Model

### 5.1 Start a session
```
POST /sessions
{ "repo": "Poom02012000/Poomi", "branch": "main", "prompt": "Fix failing tests" }
→ 201 { "sessionId": "sess_abc", "status": "starting" }
```

### 5.2 Stream events (client subscribes)
```
WS /sessions/sess_abc/events
← { "type": "agent_text",      "text": "Looking at the test suite…" }
← { "type": "tool_call",       "tool": "Bash", "summary": "run pytest" }
← { "type": "permission_req",  "id": "perm_1", "action": "git push origin main" }
← { "type": "completed",       "summary": "3 tests fixed, pushed to PR #12" }
```

### 5.3 Steer / approve
```
POST /sessions/sess_abc/messages   { "text": "also update the changelog" }
POST /sessions/sess_abc/approvals  { "id": "perm_1", "decision": "allow" }
POST /sessions/sess_abc/stop
```

### 5.4 Resume later
```
GET  /sessions/sess_abc            → status + last N events
POST /sessions/sess_abc/messages   → continues the same conversation
```

---

## 6. Permission & Approval Flow

The heart of "remote" safety. When the agent wants to do something gated:

1. Runner pauses the action and emits a `permission_req` event.
2. Gateway pushes a notification to the client (push/email/chat).
3. Client shows **what** will run and asks allow / deny / always-allow.
4. Decision flows back; runner proceeds or adjusts.
5. Every decision is written to the audit log.

Default posture: **deny-by-default for irreversible/outbound actions**
(pushes, deletes, external network writes) unless the user pre-authorized
that class of action for the session.

---

## 7. Security

- **AuthN** — every client is authenticated (token/OAuth); no anonymous access.
- **AuthZ** — a session has one owner; only the owner can command it.
- **Repo scope** — a session may only touch repos it was granted at start.
- **Transport** — TLS everywhere; WebSocket over HTTPS.
- **Secrets** — never streamed to clients or logged in the event trail.
- **Audit** — append-only log of commands, approvals, and outbound actions.
- **Untrusted input** — content from PRs/issues/webhooks is treated as
  untrusted; it can inform the agent but cannot silently escalate its scope.

---

## 8. Triggers (automation, later phase)

Beyond manual control, sessions can be started by rules:

- **Schedule** — cron-style ("every weekday 9am, triage new issues").
- **Webhook** — a PR opened / CI failed event wakes a session to respond.
- **One-shot** — "in 2 hours, check if the deploy is green."

Each trigger targets either a **fresh session** (clean slate per firing) or a
**persistent session** (resumes the same conversation).

---

## 9. Milestones

- **M0 — Spec** ✅ *(this document)*
- **M1 — Local control loop** — start a session, stream events, send messages
  over WebSocket, on one machine.
- **M2 — Approval gating** — permission requests surfaced and answered remotely.
- **M3 — Persistence & resume** — sessions survive reconnects; event replay.
- **M4 — Remote clients** — mobile + web dashboards.
- **M5 — Triggers** — scheduled and webhook-driven sessions.

---

## 10. Open Questions

- Transport: raw WebSocket vs. SSE + POST vs. a message queue (NATS/Redis)?
- Where do Session Runners live — self-hosted pool, managed cloud, or both?
- How long do idle sessions persist before the environment is reclaimed?
- Notification channels for approvals — push only, or email/Slack/Line too?
- Do we allow "always allow" scoped per-session, or per-owner globally?

---

*This is a living spec. Comments and revisions welcome before M1 begins.*
