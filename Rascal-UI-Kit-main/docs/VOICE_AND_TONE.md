# Voice & Tone

> 🏛 **OFFICIAL STANDARD** — copy guidelines for all Rascal apps.

Internal tools — short, factual, second person. Any new user-facing string in a Rascal app **MUST** follow these conventions; deviation = bug, not creative license.

---

## Principles

1. **Humanise step labels.** "Set up · Choose reviewers · Sent ✓" — not "Step 1: Cycle metadata".
2. **Action verbs in CTAs.** "Open →", "Continue Self-Review →", "Submit review ✓" — not "Click here", "Go", "Proceed".
3. **Time deltas in plain English.** "Cycle locks in 3d" — not "Cycle ends 2026-05-15".
4. **Anonymity is loud.** Surface attribution prominently in any reviewer surface and recap email.
5. **No marketing fluff.** No "amazing", "powerful", "delightful". Stick to verbs that describe what happened or what to do.

---

## Tense & person

- **Second person** for instructions and prompts: "Submit your self-review", "Send reminder to 3 pending →".
- **Third person** for status descriptions: "Q2 momentum: 2 KRs closed in April." (subject is the data, not the user).
- **Past tense** for completion: "Self-review submitted", "Reminder sent".
- **Imperative** for buttons: "Open", "Submit", "Send", "Cancel".

---

## Numbers

- Whole numbers for counts: `2 closed` (not `2.0 closed`).
- Ratios as `numer / denom`: `1/2`, `4/5` — same in tables, emails, badges.
- Percentages for progress: `50%` — only when denominator can vary. For fixed-denominator ratios, prefer `2/5` over `40%`.
- Tabular numerals (`tabular-nums`) for any column of numbers so digits align.

---

## Status copy

| State condition                            | Wording                                                    |
| ------------------------------------------ | ---------------------------------------------------------- |
| Nothing started yet                        | "{Quarter} ramping up — no closures yet this quarter."     |
| Some closed, no new this month             | "{Quarter} holds at {N} KRs closed (no new wins in {month})." |
| First month of quarter, with new closures  | "{Quarter} momentum: {N} KRs closed in {month}."           |
| Mid-quarter, with new this month            | "{Quarter} momentum: {N} closed this quarter (+{M} in {month})." |

| Approval state                            | Wording                              |
| ----------------------------------------- | ------------------------------------ |
| Awaiting submission                       | "Self-review Pending"                |
| Submitted, awaiting next stage             | "Self-review Submitted"              |
| Manager hasn't reviewed yet               | "Manager Review Pending"             |
| Done                                      | "Signed Off"                          |

---

## Empty states

Lead with a single emoji (from the allowlist) + one short line + a CTA verb when applicable.

```
📭 No active review cycle
HR will notify you when the next cycle opens.
```

```
✓ All caught up
No reviews waiting on you.
```

```
📭 No closures recorded for April 2026.
```

---

## Error copy

- Lead with the user's recovery path, not the failure.
- One sentence. No "Oops!" / "Whoops!" / "Sorry!".

| Bad                                            | Good                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| "An error occurred. Please try again."         | "Couldn't save. Check your connection and retry."     |
| "Invalid input"                                | "Score must be between 1 and 5."                       |
| "Unauthorized"                                 | "This link has expired. Contact HR for a new one."     |

---

## Confidentiality reminders

Every reviewer surface ends with one of:

- "Attributed review · Confidential — internal use only" (line manager, self)
- "Anonymous in admin reports · Confidential — internal use only" (peer, direct report)

Email recaps end with: "Per-leader reports are attached. Confidential — internal use only."

---

## Anti-patterns

- ❌ "Click here to..." — never use "click", describe the destination.
- ❌ "Please" before button labels — formal, slows the read.
- ❌ Marketing words: "powerful", "smart", "delightful", "seamless".
- ❌ Adverbs in body text: "really", "very", "quite", "extremely".
- ❌ "Oops!" / "Whoops!" / "Uh oh" — alarming and infantilising.
- ❌ Long deadline phrasing — "The cycle will be locked at end of business on Friday May 15, 2026 at 5pm AWST" → "Cycle locks Friday".
