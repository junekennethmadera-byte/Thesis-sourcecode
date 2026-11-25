# External Services Activation Checklist

The application has adapters and fail-safe checks for the services below. Do not commit any secret to `.env.example`, source control, screenshots, or chat.

## 1. OpenAI embeddings

Set `OPENAI_API_KEY` and optionally `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`. Set `SEARCH_EMBEDDINGS_REQUIRED=true` in the production environment. Run `npm run reindex:search`, then run `npm run config:check` and verify the readiness endpoint reports `embeddings: true`.

## 2. ClamAV

Install ClamAV using the institution-approved Windows/Linux package, update virus definitions, and configure the absolute path to `clamscan` in `CLAMSCAN_PATH`. Set `MALWARE_SCAN_REQUIRED=true`. Upload a known-clean test PDF and a harmless security-test sample approved by the administrator; confirm clean files pass and detections are rejected.

## 3. External plagiarism provider

Select and contract an approved provider first. Configure its HTTPS endpoint in `PLAGIARISM_API_URL` and credential in `PLAGIARISM_API_KEY`. The adapter sends `{ text }` and accepts `similarity`, `originality`, and `report`/`matches`. Confirm the provider's data-processing agreement permits thesis content to leave the institution.

## 4. Password-reset delivery

Configure an approved mail/security service webhook in `PASSWORD_RESET_WEBHOOK_URL`. The application stores only a hash of the reset token, never the token itself. Test delivery, expiry, single-use behavior, and session revocation before enabling production mode.

## 5. Usability respondents

Recruit separate student-researcher, faculty-reviewer, and administrator participants. Obtain participation consent, run the tasks in `docs/USABILITY_EVALUATION.md`, anonymize results, and attach the signed evaluator summary. The software cannot generate valid respondent evidence without real participants.

Run the final gate:

```bash
npm run config:check
npm test
```

The configuration checker must show all provider checks as `true` before claiming operational production readiness.
