# Celebrity calculation examples: publication and privacy review

Review date: 26 November 2026 (Asia/Bangkok).

## Status and scope

Technical and editorial safeguards have been implemented. **This is not a finding of legal clearance or a completed PDPA legitimate-interest assessment.** No celebrity marketing consent, model release, or legal approval was obtained by this coding task. Copyright-license evidence and personality/privacy permissions are different matters.

The private source contains 156 name strings and 185 candidate person options. The public export contains 153 strings and 181 matched person options. One unresolved identity and three age-review records are withheld before serialization. Their identifiers are in `src/data/celebrityEditorialPolicy.ts`; names and birth dates are not repeated in this document. Do not automatically publish these records when a birthday passes. Reassess sources and the applicable legal conditions first.

## Changes made

- The homepage now demonstrates three generic name strings without celebrity portraits, nicknames, surnames, or biographical claims in that module. The editorial directory has a separate link.
- Every directory grade is explicitly attached to the input name under the website's belief-based numerology criteria. The referenced public identity is displayed separately, including source-name variants. There is no claim that a name caused fame, wealth, health, or success.
- The purpose and non-endorsement notice appears above the directory cards. The five curated articles link to the editorial policy and request channel; their direct premium-search CTA has been removed.
- Tool links from bulk cards only prefill the name, with `mode=prefill`. They do not supply a celebrity surname or assumed birthday and do not automatically run a personal analysis.
- All 78 candidate portrait sources were reviewed against Commons description revisions. There are 39 own-work declarations and five external-source license-review records. The other 34 portraits are withheld pending more evidence. These classifications describe source evidence, not a guarantee of ownership or personality-rights permission.
- The 34 withheld originals and the separate curated copy of one withheld portrait (35 local files) were moved out of `public`. The previous generated image-optimizer cache was also moved to the ignored archive. Tests check that withheld originals are unavailable and do not get reintroduced by the curated-card merge.
- Each displayed portrait has a source file title, creator credit, license, description revision, check date, and resize/framing notice. The public attribution document lists only files still served.
- The public policy and privacy page explain the actual data categories and existing LINE contact channel. They do not claim that a checkbox, credit line, or disclaimer establishes a lawful basis.

## Decisions still needed from the site owner and Thai counsel

1. Identify the legal data controller and publish the appropriate contact details. The site brand and existing LINE account are known; the owner's legal identity and any public privacy email have not been inferred from the local computer's user name.
2. Determine and document the lawful basis for each actual use. If relying on section 24(5), assess the concrete purpose, necessity, less intrusive alternatives, reasonable expectations, potential effects, and balance against the individual's rights. The existence of a public biography or a CC license does not complete this assessment.
3. Consider the complete website context, including the commercial service, internal links, search snippets, article feeds, social previews, and advertising. Do not reuse these portraits as endorsements, customer testimonials, paid advertisements, or promotional creatives without appropriate rights and review.
4. If relying on consent or a commercial release, verify who can grant it and its scope, including the person depicted and the copyright owner where applicable. Agency representation alone is not proof of authority for every use. Review any age-related conditions separately.
5. Confirm the applicable transparency obligations for indirectly obtained data, rights-request handling, recordkeeping, and retention. The policy text is a factual description and a request channel, not a substitute for the controller's full legal obligations.

No legal-basis or consent record has been marked approved in code. A future deployment is a separate action; do not describe these changes as a legal certification.

## Source and image maintenance

Private inputs and snapshots live under ignored `scratch/celebrity-name-import/2026-11-26/`. The workbook SHA-256 is recorded in the generated directory. No raw biography extracts, dates of birth, school records, or family information are exported into the card props.

Use `node scripts/audit-celebrity-image-evidence.cjs [private-input-directory] --refresh` for a fresh Commons source check, then `node scripts/prepare-celebrity-catalog.cjs [private-input-directory]` to prepare the public export. Without `--refresh`, the audit reads the saved description snapshots. `checkedAt` describes the review date; the evidence link is a specific source revision. Inspect changes rather than treating script output as legal approval.

Keep unresolved files outside `public`, rebuild the attribution document, and run the directory tests. If a new audit withholds a previously available image, remove its served original and invalidate the deployed optimizer/CDN caches as appropriate. Do not place research archives under a public route. Removing an image from the page alone is insufficient when its original or cached variants remain served.

## Request handling

The existing LINE Official Account is used as a contact link only. This task did not send messages, create a ticketing backend, promise a response SLA, or claim automatic deletion. Staff should record the affected URL, request, identity/authority verification proportionate to the situation, decision, action, and response. Request only necessary evidence; do not ask for a full identity document in the initial message. Investigate promptly and consider a temporary publication hold where appropriate.

## References

- Thai Personal Data Protection Act: https://www.ccit.go.th/pdpa/document/law_pdpa_2562.pdf
- CC BY 3.0, including the notices about other rights: https://creativecommons.org/licenses/by/3.0/
- Commons reuse guidance: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia

The underlying numerology criteria are belief-based. Reproducible arithmetic does not establish scientific evidence of life outcomes.
