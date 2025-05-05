# Example Backstage Catalog Processor Module (`catalog-backend-module-example-processor`)

**Created by:** Paweł Zentała ([@zentala](https://github.com/zentala))

**Purpose:** Reference implementation & Copy-Paste Development Resource

---

## Introduction: What is Backstage and the Catalog?

Welcome! This repository serves as a well-commented, practical example of a **Catalog Processor** for [Backstage](https://backstage.io/), an open platform for building developer portals (IDP - Internal Developer Platform).

**What is Backstage?**
Think of Backstage as a central hub for your development teams. It helps organize your microservices, libraries, websites, ML models, documentation, and infrastructure using a unified **Software Catalog**.

**What is the Software Catalog?**
The Catalog is the core of Backstage. It's a system for tracking ownership and metadata for all your software assets (we call them **Entities**). Entities can be things like:

- `Component`: A piece of software (service, website, library).
- `API`: An interface exposed by a Component.
- `Resource`: Infrastructure needed by a Component (database, S3 bucket).
- `Group`: A team owning software.
- `User`: An individual developer.
- `Location`: A pointer to where entity metadata is stored (e.g., a `catalog-info.yaml` file in a Git repo).

You can find more details in the [Backstage Catalog documentation](https://backstage.io/docs/features/software-catalog/).

**What is a Catalog Processor?**
The Catalog needs to be populated and kept up-to-date. That's where **Processors** come in. They are backend plugins that automatically:

1.  **Discover** metadata (e.g., by scanning Git repositories pointed to by `Location` entities).
2.  **Validate** the discovered metadata against rules.
3.  **Process** the metadata (e.g., enriching it with data from external systems, like code owners or analysis results).
4.  **Emit** the final `Entity` data into the Catalog database.

Processors are crucial for automating catalog maintenance and extending its capabilities. Learn more about the [Catalog processing pipeline](https://backstage.io/docs/features/software-catalog/life-of-an-entity).

## What Does This Example Module Do?

This module (`catalog-backend-module-example-processor`) provides a concrete example: the `ExampleLocationAnalyzerProcessor`.

**Core Functionality:**

- **Acts on Locations:** It specifically processes `Location` entities that point to URLs (`spec.type: url`). Locations are often the starting point for discovering other entities defined in files like `catalog-info.yaml`.
- **Analyzes Targets:** It includes a placeholder `ExampleLocationAnalyzer` class. In a real-world scenario, this analyzer would perform tasks based on the `Location`'s target URL, such as:
  - Cloning the repository using Backstage's `ScmIntegrationRegistry`.
  - Reading and parsing files (e.g., checking for specific configurations, running linters).
  - Calling external APIs.
  - Generating reports or metrics.
- **Filters Locations:** It demonstrates how to use configuration (`app-config.yaml`) to allow processing only specific URL patterns (using glob matching via `minimatch`).
- **Enriches Data (Potentially):** Although the current example is basic, a processor like this could emit new `Entities` based on its analysis or add annotations to existing entities.
- **Provides Clear Logging:** It shows how to use the Backstage logger service effectively.

**Why This Example is Useful for Developers (Especially Juniors):**

- **Well-Commented Code:** The TypeScript code (`./src/`) includes detailed JSDoc comments explaining the purpose of classes, methods, and parameters.
- **Clear Structure:** It follows the standard structure for a Backstage backend module.
- **Focus on Core Concepts:** It demonstrates key Backstage backend concepts: Modules, Extension Points, Services (Logger, Config, Integrations), and the Catalog processing flow.
- **Configuration Example:** Shows practical usage of `app-config.yaml` for controlling plugin behavior.
- **Copy-Paste Ready:** You can use this code as a starting point for building your own custom catalog processors. Adapt the `ExampleLocationAnalyzer` logic to fit your specific needs.

## Code Structure

- `src/`
  - `processor.ts`: Defines the main `ExampleLocationAnalyzerProcessor` class implementing the `CatalogProcessor` interface. This is the entry point for the catalog processing steps.
  - `analyzer.ts`: Defines the `ExampleLocationAnalyzer` class containing the _logic_ for analyzing a location. This is separated for clarity – the processor handles _integration_ with Backstage, while the analyzer handles the _core task_.
  - `allowLocation.ts`: Contains the helper function `isAllowedLocation` for filtering locations based on configuration.
  - `module.ts`: Defines the Backstage Backend Module. This file registers the processor with the `catalogProcessingExtensionPoint`, wiring up dependencies like config, logger, and integrations.
  - `index.ts`: Exports the module for use in the main backend.
- `package.json`: Defines dependencies and build scripts.
- `README.md`: This file.
- `.eslintrc.js`: Linting configuration.
- `.gitignore`: Specifies files to ignore in Git (like `node_modules`).

## Configuration

To enable and configure this processor in your Backstage instance, add the following to your `app-config.yaml`:

```yaml
catalog:
  processors:
    exampleLocationAnalyzer:
      # Set to true to enable the processor
      enabled: true # Default is likely false if not specified

      # Optional: Specify glob patterns for allowed location targets.
      # If omitted or empty, all 'url' locations matching Backstage integrations will be processed.
      # Use patterns understood by 'minimatch' library.
      allowedLocationTargets:
        - 'https://github.com/my-org/important-repo/*'
        - 'https://dev.azure.com/my-org/project/_git/another-repo?path=/catalog-info.yaml'
        # Add more patterns as needed
```

**Important:** The `catalog.processors.exampleLocationAnalyzer.enabled` key controls whether the processor runs. The `allowedLocationTargets` provide fine-grained control over _which_ URLs it analyzes.

## Integration into Backstage Backend

1.  **Add Dependency:** Add this module as a dependency to your main backend package (usually `packages/backend`):

    ```bash
    # Run from your Backstage root directory
    yarn --cwd packages/backend add file:../plugins/catalog-backend-module-example-processor
    ```

    _(Adjust the path if your structure differs)_

2.  **Register Module:** Import and add the module in your backend's entry point (usually `packages/backend/src/index.ts`):

    ```typescript
    // packages/backend/src/index.ts
    import { createBackend } from '@backstage/backend-defaults';
    // Import the module
    import { catalogModuleExampleProcessor } from '@internal/backstage-plugin-catalog-backend-module-example-processor'; // Ensure package name matches your setup

    const backend = createBackend();

    // ... add other plugins and modules

    // Add the example processor module
    backend.add(catalogModuleExampleProcessor);

    backend.start();
    ```

3.  **Install Dependencies:** Run `yarn install` in your main Backstage `src/` directory (or project root depending on your setup) to ensure all dependencies are correctly linked.

4.  **Configure:** Update your `app-config.yaml` as shown in the "Configuration" section.

5.  **Restart Backend:** Restart your Backstage backend process. You should see log messages indicating the processor is initializing if enabled.

---

Feel free to explore the code, adapt it, and use it as a learning resource!
