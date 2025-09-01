# Contributing to Geode

Thank you for your interest in contributing to Geode! This guide covers how to set up your development environment, run tests, and understand the testing workflow.

## Testing

Geode uses [Bun's test runner](https://bun.sh/docs/test/overview) for all unit and integration tests.

### Running Tests

```sh
bun test
```

### Test Directory Structure

```
test/
  unit/           # Unit tests for core functions
  integration/    # Integration tests with input files and expected output zips
  helpers/        # Test helpers (e.g., zipCompare)
```

### Integration Tests

Each integration test case contains:
- `input/` directory with pack.lua and data pack files
- `expected.zip` file with the expected output

The test runs the CLI build command on the input, then compares the generated zip to the expected zip using a helper.

See `test/integration/build_cli.test.ts` and `test/helpers/zipCompare.ts` for examples.

### Adding New Tests

- Use Bun's test API (`import { test, expect } from "bun:test"`) for all new tests.
- Place unit tests in `test/unit/` and integration tests in `test/integration/`.
- Use helpers from `test/helpers/` as needed.

### Development Workflow

1. Clone the repository and install dependencies.
2. Make your changes.
3. Add or update tests as needed.
4. Run `bun test` to verify all tests pass.
5. Submit a pull request with a description of your changes and any relevant test cases.

For questions or help, please open an issue or join the discussion on the project's repository.
