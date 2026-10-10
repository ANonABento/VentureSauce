# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are **seed to Series A VC associates**. Each one screens 20 or more companies a week. Material arrives in pieces and out of order: a pitch deck, follow-up emails from the founder, the associate's own call notes, and screenshots. Their job is to work out what is actually true about a company before a partner meeting, and to walk into the next founder call with sharp questions. Angels and scouts are a secondary audience and aren't designed for separately.

## Product Purpose

VentureSauce is a deal inbox. The associate drops in anything about a company: a deck (PDF, scanned PDF or slides), an email, call notes, or a screenshot. Each item is filed under its company. Every claim in it is checked in two ways:

1. **Against public records:** SEC Form D, LinkedIn and the press.
2. **Against the associate's other items for the same company:** these are "contradictions."

Every discrepancy, contradiction or unverifiable claim becomes a non-accusatory question to ask the founder. A daily or weekly digest, optionally spoken, rolls this up across companies.

Success means an associate trusts the result enough to skip re-checking it by hand, and leaves with the right questions.

## Positioning

The product catches the moments when a founder's own materials disagree with each other or with the public record. For example, the deck says 25 people, the email says 40, and the call notes say 12. Every number links to its source.

Database products (PitchBook, Harmonic, Crunchbase) describe a company. CRMs (Affinity) store deal flow. General chat assistants summarize. None of them reconcile what *this founder told you*, across *your* sources, against the filings.

## Operating Context

- The main surface is a **Chrome side panel, about 380px wide**, used next to whatever the associate is reading (a deck, Gmail, a company site, LinkedIn).
- The associate's workflow: drop an item in, check where it was filed, scan the checks and contradictions, copy the questions into call prep, then read or listen to the digest at the end of the day.
- The panel has these states:
  - Idle or drop
  - Company detected
  - Loading, shown as a live status log
  - Report
  - No filing found
  - Error, with cached replay
  - Inbox list
  - Company view, with Checks, Items and Questions tabs
  - Digest
- The demo is a live drag-and-drop in front of hackathon judges, sometimes on a projector, with a cached fallback.

## Capabilities and Constraints

- **Every number links to a source.** Nothing is shown without a receipt. If a claim can't be verified, the product says so.
- **Non-accusatory language.** Discrepancies are differences between sources, not findings of wrongdoing.
- **Works offline for the demo.** Fonts and art are bundled locally. Cached replay mode is available. No remote assets.
- **The Chrome side panel at about 380px is the primary surface.** Separate web views are secondary.
- **The status vocabulary follows the backend:** discrepancy, consistent, not disclosed, unverified. "Your sources disagree" marks a contradiction between the user's own items.
- **Item kinds:** Deck, Slides, Screenshot, Email, Call notes, Note.
- **API:** `/analyze`, `/jobs/{id}`, `/companies`, `/companies/{id}`, `/api/delta`, `/digest`, `/digest/audio` (Fish Audio).
- **Stack:** Next.js frontend (`frontend/`), FastAPI backend (`backend/`), MV3 extension.
- **Undecided:** authentication and multi-user ownership. The `/companies` routes have no owner check yet.

## Brand Commitments

- **Name:** VentureSauce. It is never "Filing Delta" or "SignalEngine."
- **Voice:** plain and factual, like an analyst's notes. Say what was checked and where. No "AI-powered," no exclamation marks, no "Oops."
- **Existing assets:** the ASCII-dithered mist-valley art and the sunrise mark. The visual system is recorded in the Figma kit and `Research/Design/`. This file doesn't restate it.

## Evidence on Hand

- **User research:** `Research/User Research/` (personas, pain quotes, the Sense Check question bank) and `Research/Sense Check Log/`.
- **Demo companies:** Daytona public claims and the fictional Acme. The fictional demo audio is `demo/acme_briefing_FICTIONAL.mp3`. Fictional data must always be labeled as fictional.
- **Do not fabricate:** testimonials, customer logos, fund names, usage numbers or accuracy rates. None exist yet.

## Product Principles

1. **Receipts over assertions.** A claim without a source is shown as unverifiable, never smoothed over.
2. **Show the disagreement, then the question.** The product's value is the moment sources conflict and what to ask about it.
3. **Calm under density.** Associates scan a lot of material quickly. Quiet surfaces, and emphasis only where something disagrees.
4. **Never accuse.** The founder may have a good explanation, so the product's job is to surface it.
5. **The demo must survive bad wifi.**

## Accessibility & Inclusion

The target is WCAG 2.2 AA:
- Status is never shown by color alone.
- Minimum target size is 24px, and 44px for row toggles.
- `prefers-reduced-motion` is respected.
- Everything stays legible on a projector.
