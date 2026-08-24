# PostHog Self-driving setup report

Generated: 2026-08-24

## Summary

PostHog Self-driving is now configured for memedrop: error tracking, session replay, and support are on as signal sources, the scout troop is tuned to this project's active surfaces, and two Replay Vision monitors are armed to push inbox findings the moment recordings arrive. Findings will start appearing in your [Self-driving inbox](https://eu.posthog.com/project/256559/inbox) within approximately 30 minutes.

---

## AI data processing

**Approved.** Organization-level AI data processing consent was granted before this run.

---

## GitHub

**Connected during this run.** GitHub App installed by Eli Gachago (ManNjoro), integration id `79877`. Self-driving can now research findings in this repo and open draft PRs for fixes.

---

## Products enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | already enabled | Server-side toggle was already on. Mobile SDK (`posthog-react-native`) needs session replay explicitly configured to capture recordings — see follow-ups. |
| Error Tracking | already enabled | Server-side toggle was already on. `errorTracking.autocapture` (uncaughtExceptions + unhandledRejections) is wired in `lib/posthog.ts`. |
| Support (Conversations) | enabled | Turned on this run. Tickets only arrive once an inbound channel is connected — see follow-ups. |

---

## Signal sources

| source\_product | source\_type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | Skipped — on by default, no config row needed |
| `health_checks` | `health_issue` | Enabled (id: `01a03491-c7b5-7c61-8a5e-a469d6c03bec`) |
| `error_tracking` | `issue_created` | Enabled (id: `01a03491-c9cb-72fb-ab71-59ebfaa2c137`) |
| `error_tracking` | `issue_reopened` | Enabled (id: `01a03491-d052-7394-8daf-0e23ed274ece`) |
| `error_tracking` | `issue_spiking` | Enabled (id: `01a03491-d260-7b45-bbf9-32d4efd156a3`) |
| `session_replay` | `session_analysis_cluster` | Enabled (id: `01a03491-d766-73d4-8854-a07d1717d6a9`, sample rate: 10%) |
| `conversations` | `ticket` | Enabled (id: `01a03491-d962-78f8-8b94-144339d07517`) |
| `replay_vision` | — | Skipped — scanners are self-authorizing via `emits_signals` flag; no config row needed |
| `llm_analytics` | — | Skipped — no LLM/AI observability in this project |
| `logs` | — | Skipped — PostHog logs product not in use |

---

## Connected tools

| Tool | Status |
|---|---|
| GitHub Issues | Not used — user declined |
| Linear | Not used — user declined |
| Jira | Not used — user declined |
| Sentry | Not used — user declined |
| Zendesk | Not used — user declined |
| All others | Not used — user declined |

---

## Scout troop

**Run budget:** 100 runs/day (early access default, confirmed via `scout-metadata-get`). 0 runs used today.  
**Banner:** "Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."

### Enabled (4 scouts)

| Scout | What it watches |
|---|---|
| `signals-scout-general` | Cross-product correlations and surfaces no specialist covers. Already enabled. |
| `signals-scout-product-analytics` | Saved funnels, retention, lifecycle, and stickiness flows for conversion or retention regressions. |
| `signals-scout-health-checks` | PostHog's own health issues, weighted by blast radius — catches instrumentation gaps early. |
| `signals-scout-observability-gaps` | Events with significant volume that lack any insight, dashboard, or alert coverage. |

### Disabled (23 scouts)

| Scout | Reason |
|---|---|
| `signals-scout-error-tracking` | **Intentional** — covered by native error tracking sources (issue_created / reopened / spiking). Re-enable not recommended. |
| `signals-scout-session-replay` | **Intentional** — covered by native session_replay / session_analysis_cluster source. Re-enable not recommended. |
| `signals-scout-feature-flags` | No confirmed feature flag usage in this project. Enable in PostHog if you add flags. |
| `signals-scout-surveys` | No surveys in use. Enable in PostHog if you add surveys. |
| `signals-scout-revenue-analytics` | No payment SDK detected. Enable if you integrate Stripe or another revenue source. |
| `signals-scout-ai-observability` | No `$ai_*` events or LLM SDK detected. Enable if you add AI observability. |
| `signals-scout-web-analytics` | Mobile app — no web traffic or UTM/referrer tracking. |
| `signals-scout-web-vitals` | Mobile app — no Core Web Vitals. |
| `signals-scout-csp-violations` | Mobile app — no Content Security Policy configured. |
| `signals-scout-experiments` | No active A/B experiments detected. Enable in PostHog if you launch experiments. |
| `signals-scout-logs` | PostHog logs product not in use. Enable if you add logs. |
| `signals-scout-customer-analytics` | No group/accounts analytics (B2B). Enable if you add account-level tracking. |
| `signals-scout-data-pipelines` | No CDP destinations or hog flows configured. Enable if you add pipelines. |
| `signals-scout-data-warehouse` | No warehouse imports detected. Enable if you connect external data. |
| `signals-scout-apm` | No OpenTelemetry/APM spans detected. |
| `signals-scout-conversations` | Support just enabled — no conversation events yet. Enable later once you have support volume. |
| `signals-scout-anomaly-detection` | Disabled — no dashboards or insights to watch for anomalies yet; re-enable once you have saved analytics. |
| `signals-scout-replay-vision` | Disabled — this scout watches trends across accumulated scanner observations; scanners were just created so there are no observations yet. Re-enable once recordings are flowing. |
| `signals-scout-inbox-validation` | Disabled — no resolved reports to validate yet (fresh setup). Enable later. |
| `signals-scout-insight-alerts` | No configured insight alerts. Enable if you create alerts. |
| `signals-scout-mcp-tool-calls` | No `$mcp_tool_call` telemetry. |
| `signals-scout-skills-store` | No custom skills requiring hygiene checks. |
| `signals-scout-tasks` | No PostHog task telemetry. |

---

## Custom scouts

**Proposed 2, declined by user:**

| Proposed scout | Surface | Ruling |
|---|---|---|
| Upload funnel drop-off | `upload_media_selected` → `upload_details_started` → `meme_uploaded` conversion rate | **Declined by user** |
| Content engagement health | `meme_downloaded` + `meme_shared` rate vs `meme_uploaded` rate | **Declined by user** |

**Surfaces considered and ruled out:**

| Surface | Why ruled out |
|---|---|
| Sign-up funnel | Only `user_signed_up` exists; no start event (e.g. `sign_up_started`), so conversion can't be measured. Record note: add a `sign_up_started` event to make this watchable. |
| Per-meme virality | `meme_downloaded` / `meme_shared` don't include a `meme_id` property, so per-content analysis isn't possible. Record note: add `meme_id` to these events. |
| Upload errors | Caught by error tracking native source (PostHogErrorBoundary + uncaughtExceptions autocapture). No explicit `upload_failed` event; the upload error state (`stage === 'error'` in `upload/details.tsx`) is silent to PostHog. |

**Noise escape hatch:** if any custom scout you create later turns noisy, set `emit: false` on its config in PostHog to switch it to dry-run — it keeps running and logging but stops writing to the inbox.

---

## Replay Vision scanners

Replay Vision scanners are LLM agents that watch individual session recordings on a schedule and push what they find directly to the Self-driving inbox. They are the only part of this setup that spends Replay Vision quota. Findings arrive at **half weight** and need corroboration before being promoted into a full inbox report.

This project has no recordings yet (mobile session replay needs SDK configuration — see follow-ups). Both scanners are armed and will start working the day recordings begin, with no further setup.

| Scanner | Type | What it watches | Query scope | Sampling | Est. monthly credits |
|---|---|---|---|---|---|
| Upload flow breakage | monitor | Visible product breakage during the upload details flow — frozen progress bars, unresponsive Drop It button, unexpected error states, success screen never appearing | Sessions where `$current_url` contains `/upload/details` | 50% | 0 (no recordings yet) |
| Meme app frustration | monitor | Rage-click sessions where users got visibly stuck — hammering disabled buttons, retrying after validation errors, repeated download taps, upload restarts | Sessions with a `$rageclick` event | 100% | 0 (no recordings yet) |

Both scanners have `emits_signals: true` — findings feed the inbox automatically once recordings flow.

---

## Follow-ups

- [ ] **Configure mobile session replay in SDK.** The server-side Session Replay toggle is on, but `posthog-react-native` needs session replay explicitly enabled in `lib/posthog.ts`. Add `sessionReplay: { androidDebouncerDelayMs: 500, iOSDebouncerDelayMs: 500 }` (or the equivalent for your SDK version) to the PostHog init options. Once recordings flow, the two Replay Vision monitors and the session_analysis_cluster source will activate automatically.
- [ ] **Connect a Support inbound channel.** Conversations (Support) is enabled but the ticket source stays dormant until an email, inbox, or Slack channel is connected in PostHog [Settings → Support](https://eu.posthog.com/project/256559/settings/environment-integrations).
- [ ] **Add `meme_id` property to engagement events.** `meme_downloaded`, `meme_shared`, and `meme_link_copied` currently only capture `media_type`. Adding a `meme_id` property would enable per-content virality analysis and make these events watchable by a custom scout.
- [ ] **Add a `sign_up_started` event** (e.g. on form first-touch or the Create Account button tap in `app/(auth)/sign-up.tsx`) to make the sign-up funnel measurable.
- [ ] **Enable `signals-scout-replay-vision`** once recordings are flowing and the two monitors have had a few weeks to accumulate observations. It watches trends across scanner observations — it needs data to be useful.
- [ ] **Connect issue tracker if you use one.** None were connected during this run (user declined). You can connect GitHub Issues, Linear, Jira, and others later from [new data warehouse source](https://eu.posthog.com/project/256559/pipeline/new/source).
- [ ] **Enable `signals-scout-anomaly-detection`** once you have saved insights and dashboards — it watches them for anomalies and is most useful once you have analytics coverage.

---

## What happens next

1. The scout coordinator picks up fresh configs within ~30 minutes. The first scans run on the next coordinator tick.
2. Each enabled scout runs once per day and draws from the project's budget (100 runs/day during early access).
3. Findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/256559/inbox). Immediately-actionable reports can spin up coding tasks automatically.
4. The Replay Vision monitors start scanning sessions the moment mobile session replay is enabled and recordings begin arriving.
