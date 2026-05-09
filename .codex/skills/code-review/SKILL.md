---
name: code-review
description: Perform comprehensive, read-only code reviews of an entire codebase or explicitly mentioned files. Use when the user asks to carefully review code for bugs, errors, regressions, type issues, security vulnerabilities, performance problems, maintainability risks, architectural concerns, or any user-specified review focus. Trigger on requests such as "Carefully review the entire codebase for bugs or errors", "Analyze the codebase for security or performance", "Perform an in-depth review of the entire codebase", or requests to review all mentioned files. Never modify code while using this skill.
---

# Code Review

## Core Rules

- Keep the review strictly read-only. Do not edit, format, refactor, generate patches, or run commands that intentionally modify files.
- Review the full requested scope: all files in the codebase when the user asks for the entire codebase, or every explicitly mentioned file when the user narrows the scope.
- Follow any user-specified focus areas in addition to the default review categories.
- Prioritize correctness over speed. Build enough understanding of the project before reporting findings.
- Report only evidence-backed issues. Do not pad the report with speculative style preferences.

## Scope Discovery

1. Determine the requested scope from the user prompt.
2. Inspect project structure and documentation first: README files, specs, package manifests, config files, route trees, and test setup.
3. Enumerate files in scope with fast search tools such as `rg --files`, respecting generated output, dependency folders, lockfiles, build artifacts, and ignored paths unless the user explicitly asks to review them.
4. For entire-codebase reviews, sample nothing by default. Read every relevant source, config, and test file in the scope.
5. If the repository is too large to inspect exhaustively in one response, state the coverage limit clearly, prioritize high-risk areas, and continue the review in a structured way rather than pretending full coverage.

## Review Checklist

Check each applicable file for:

- Logic bugs: incorrect branches, stale assumptions, edge cases, race conditions, invalid state transitions, broken data flow, unreachable code, and off-by-one or date/time mistakes.
- Type and API errors: unsafe casts, incorrect generic usage, missing null handling, mismatched function contracts, framework misuse, and dependency API drift.
- Security issues: injection, XSS, CSRF, SSRF, path traversal, insecure auth/session handling, secret exposure, unsafe deserialization, insufficient validation, and excessive data disclosure.
- Performance issues: avoidable repeated work, unnecessary network or database calls, expensive rendering paths, memory leaks, unbounded loops, missing pagination, and cache misuse.
- Error handling and resilience: swallowed failures, misleading fallbacks, user-facing stack traces, partial writes, retry hazards, and inconsistent cleanup.
- Concurrency and data integrity: lost updates, non-atomic operations, ordering assumptions, stale caches, and transaction boundaries.
- Tests and coverage: missing tests for changed or risky behavior, assertions that do not prove behavior, brittle tests, and untested failure paths.
- Maintainability only when it affects risk: confusing ownership, duplicated business logic, overly broad abstractions, dead code, and unclear module boundaries.

## Analysis Workflow

1. Map the architecture: identify entry points, critical flows, shared utilities, state boundaries, data persistence, external services, and security boundaries.
2. Trace important workflows end to end rather than reviewing files only in isolation.
3. Cross-check implementation against tests, specs, comments, configuration, and framework conventions.
4. Run read-only verification commands when useful, such as lint, typecheck, tests, static analysis, or searches. Do not run commands that format, update snapshots, rewrite lockfiles, or modify generated artifacts.
5. Revisit high-risk findings to confirm the exact failure mode and avoid false positives.

## Reporting

Lead with findings, ordered by severity. For each finding include:

- Severity: `Critical`, `High`, `Medium`, or `Low`.
- File and line reference.
- The concrete problem and why it matters.
- A concise reproduction path, exploit scenario, or failure case when applicable.
- The expected direction of a fix without editing the code.

After findings, include:

- Open questions or assumptions.
- Coverage summary: what files or areas were reviewed and any exclusions.
- Verification commands run and their results, including commands that could not be run.

If no issues are found, say so directly and still include coverage and verification notes. Avoid long summaries before findings.
