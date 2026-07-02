# Security Policy

## Supported Versions

This repository is currently in pre-release development with package version `0.0.0`.

Security fixes are handled on the active development line. Once release versioning exists,
this policy can be expanded with supported release ranges.

## Reporting A Vulnerability

Do not disclose secrets, credentials, private data, exploit steps, proof-of-concept code or
sensitive vulnerability details in public GitHub Issues, pull requests, discussions or
comments.

Use the safest repository-available path:

1. If GitHub private vulnerability reporting is enabled for this repository, use the
   repository's **Security** tab and the **Report a vulnerability** flow.
2. If private vulnerability reporting is not available, open a public GitHub Issue with
   only a minimal non-sensitive note such as `Private security report needed`. Do not
   include technical details, exploit instructions, logs with secrets or affected private
   systems in that public issue.

Maintainers should enable GitHub private vulnerability reporting or provide another private
security contact before asking for sensitive details.

## Ordinary Issues

Use GitHub Issues for ordinary questions, bugs, feature requests and documentation feedback
that do not include sensitive security details.

## Handling Secrets

If you accidentally exposed a secret, rotate or revoke it with the provider that issued it.
Do not paste the secret into this repository, even while reporting the problem.
