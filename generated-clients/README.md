# Generated client experiments

This folder is used for local SDK/client generation experiments from OpenAPI contracts.

## WorkOS TypeScript Fetch client spike

The WorkOS TypeScript Fetch client was generated locally from:

```text
external/workos/open-api-spec.yaml
```

Generation command:

```bash
npm run generate:workos-client
```

The generated output is intentionally ignored from Git:

```text
generated-clients/workos-typescript-fetch/
```

## Why the generated output is ignored

The generated client output produced:

```text
Size: 5.6M
Files: 941
```

The output is useful for inspection, but too noisy to commit directly into this portfolio repository.

This mirrors a production documentation engineering decision: generated SDK/client output may belong in a build artifact, package repository, or dedicated SDK repository rather than being committed directly into a documentation site.

## Evaluation focus

The spike is used to evaluate:

* generated package structure
* generated API classes and method names
* generated README quality
* authentication guidance
* runnable example quality
* error handling
* developer ergonomics
* what still needs human-authored SDK documentation

The goal is not to present the generated client as an official SDK.

The goal is to understand what OpenAPI-based SDK generation can produce, and what a documentation/platform team would still need to review before release.
