// The demo run-through: one step per screen on the demo desk. Shared by the desk (PageDown/PageUp, ] and [ step
// through it) and the presenter window (N opens it). docs/DEMO_SCRIPT.md is the printable copy; keep them in step.
// `core: true` marks the steps that make up the 2-minute version.
"use strict";

window.DEMO_STEPS = [
  { hash: "mail", title: "Monday morning inbox", core: true,
    do: "Side panel open on the right, inbox empty.",
    say: "This is an investor's Monday: a deck, a founder update, call notes, intros. Every one of them makes claims, and nobody checks them against each other." },
  { hash: "mail/acme-deck", title: "Drop the deck", core: true,
    do: "Drag the Acme AI deck.pdf attachment into the side panel.",
    say: "I drop the deck. It's filed under Acme AI, and every claim is checked against SEC Form D, LinkedIn and press." },
  { hash: "decks/acme/2", title: "Deck vs. Form D",
    do: "Point at '$12M raised to date'. In the panel, click the Form D source link on that row.",
    say: "The deck says $12M raised. The Form D says $15M sold, and names a director the deck doesn't. Every row links to its receipt." },
  { hash: "mail/acme-update", title: "Founder email disagrees", core: true,
    do: "⋮ → Copy message text, then ⌘V in the panel (or drag the .eml).",
    say: "Then the founder's update arrives. Same company, different numbers: ARR $3.1M in the deck vs $2.4M here, 25 people vs 18. Your sources disagree." },
  { hash: "notes/acme-call", title: "Call notes", core: true,
    do: "••• → Copy page text, then ⌘V in the panel.",
    say: "My own call notes: on the call she said $15M raised, the deck said $12M. And 'Alex Director helps out', who is on the Form D." },
  { hash: "notes/hallway", title: "A note with no company",
    do: "••• → Copy page text, then ⌘V.",
    say: "A hallway note doesn't even name the company. It's filed under the one I'm working on, and '30 employees' joins the spread." },
  { hash: "portal", title: "Dashboard screenshot",
    do: "⌘⌃⇧4 to screenshot the dashboard to the clipboard, then ⌘V in the panel.",
    say: "Even a screenshot works. The dashboard says 8% month-over-month; the deck said 20%." },
  { hash: "mail/northwind", title: "A brand-new company",
    do: "Drag the email or Copy message text → ⌘V. Open the Questions tab.",
    say: "A new intro with no public footprint: nothing to verify yet, so every claim becomes a question to ask the founder." },
  { hash: "saved/daytona", title: "A real company",
    do: "Copy text → ⌘V. Click a Form D link.",
    say: "This works on real companies too. Daytona's reported Series A, checked against its actual SEC filings." },
  { hash: "mail", title: "The digest", core: true,
    do: "In the panel: Digest → Week → Play briefing.",
    say: "At the end of the week, one digest: what's new, what conflicts, what to ask. Instead of re-reading everything, I walk into Thursday's meeting with the questions." },
];
