# Comprehensive Engineering Analysis: Rebranding Sofa to Sofa

This document provides a detailed technical analysis and execution plan for rebranding the `sofa/server` project to `sofa/server`.

## 1. Analysis of `go.mod` Files

The project consists of several interconnected modules. To rename the project, the following `go.mod` files must be updated:

### A. `server/go.mod`
- **Module Declaration**: Change `module github.com/sofa/sofa/server/v8` to `github.com/your-username/sofa/server/v8`.
- **Replace Directives**:
    - Update `replace github.com/sofa/sofa/server/public => ./public` to `replace github.com/your-username/sofa/server/public => ./public`.
- **Note**: Ensure all internal requirements pointing to `github.com/sofa/sofa` are updated to the new path.

### B. `server/public/go.mod`
- **Module Declaration**: Change `module github.com/sofa/sofa/server/public` to `github.com/your-username/sofa/server/public`.
- **Dependencies**: This module sometimes references `server/v8` in tests. Those imports must be updated.

### C. `api/server/go.mod` and `tools/mmgotool/go.mod`
- Both need their module declarations updated to reflect the new organization/project name.

---

## 2. Implementation Plan (Step-by-Step CLI)

Follow these steps in order to ensure a clean transition:

1. **Phase 1: Bulk Text Replacement**
   Use `sed` to replace all occurrences of the old import path with the new one.
   ```bash
   export OLD_PATH="github.com/sofa/sofa"
   export NEW_PATH="github.com/your-username/sofa"

   # Execute replacement across all relevant file types
   find . -type f \( -name "*.go" -o -name "*.sql" -o -name "*.yaml" -o -name "*.yml" -o -name "go.mod" -o -name "go.sum" -o -name "Makefile" -o -name "Dockerfile" \) \
   -exec sed -i "s|$OLD_PATH|$NEW_PATH|g" {} +
   ```

2. **Phase 2: Module Synchronization**
   Refresh the Go dependency graph for each module.
   ```bash
   # 1. Update the public library first
   cd server/public && go mod tidy

   # 2. Update the main server
   cd ../ && go mod tidy

   # 3. Update secondary tools
   cd ../tools/mmgotool && go mod tidy
   cd ../../api/server && go mod tidy
   ```

3. **Phase 3: Code Generation**
   Re-generate mocks and protobuf files that might have encoded the old paths.
   ```bash
   cd server
   go generate ./...
   ```

---

## 3. Import Inspection & Verification

To verify that no old paths remain and that new ones are correctly placed:

```bash
# Check for any remaining 'sofa' references
grep -r "github.com/sofa/sofa" . --exclude-dir=.git

# Verify the new 'sofa' paths in Go files
grep -r "github.com/your-username/sofa" . --include="*.go" | head -n 20
```

---

## 4. Potential Build Warnings & Risks

Several libraries and systems might require manual attention:

1. **GoMock / Mocks**:
   Mocks generated with `mockgen` often include the full package path in the header. If `go generate` doesn't clean them, delete them manually: `find . -name "*_mock.go" -delete`.
2. **Plugin Interface**:
   The `server/public/plugin` package is critical. If you rename it, any existing plugins (e.g., Focalboard, Playbooks) will fail to load due to type mismatch. You must re-compile all plugins against the new `sofa` module.
3. **Internal Tools**:
   Tools like `mmgotool` might have internal logic or default paths that expect the `sofa` directory structure or naming.
4. **Third-party Sofa Libraries**:
   Libraries like `github.com/sofa/logr` are external to this repo. If you fork them, you must use a `replace` directive in `go.mod`:
   ```go
   replace github.com/sofa/logr/v2 => github.com/your-username/sofa-logr/v2 v2.0.x
   ```

---

## 5. Integration & Local Path Testing

To ensure the `replace` directives are working and the local filesystem is prioritized:

1. **Test Local Resolution**:
   ```bash
   cd server
   go list -m -f '{{.Path}} => {{.Replace.Dir}}' github.com/your-username/sofa/server/public
   ```
   *Expected output:* `github.com/your-username/sofa/server/public => ./public`

2. **Build Verification**:
   Try a clean build of the server binary:
   ```bash
   cd server
   go build -o sofa-server ./cmd/sofa
   ```

3. **Subpath / Webapp Consistency**:
   If you have a frontend component, check `webapp/package.json` for any scripts that might hardcode the `sofa-server` path.
