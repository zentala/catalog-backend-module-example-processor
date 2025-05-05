# About: catalog-backend-module-example-processor

**Architectural Role:** Backend Module Extension for Backstage Software Catalog

**Primary Goal (Developer Experience):** To provide a clear, well-documented, and easily adaptable reference implementation of a Backstage Catalog Processor. It serves as an educational tool and a practical starting point ("copy-paste development") for teams needing to create custom catalog processing logic.

**Key Components & Flow:**

1.  **`module.ts` - The Module Definition:**

    - **Purpose:** Defines the Backstage Backend Module itself (`catalogModuleExampleProcessor`). This is the unit of deployment and registration within the Backstage backend.
    - **Key Function:** `createBackendModule` - Standard Backstage function to declare the module, its `pluginId` ('catalog') and `moduleId` ('example-processor').
    - **Registration:** Uses `registerInit` to hook into the backend initialization lifecycle.
    - **Dependencies:** Declares dependencies on core Backstage services (`coreServices.logger`, `coreServices.rootConfig`, `coreServices.integration`) and the specific extension point it targets (`catalogProcessingExtensionPoint`). This clearly shows how modules interact with the core system.
    - **Instantiation:** Creates an instance of `ExampleLocationAnalyzerProcessor` and registers it with the `catalogProcessingExtensionPoint.addProcessor()`. It demonstrates dependency injection (passing logger, config, integrations) and the use of a factory pattern (`analyzerFactory`) for creating internal components.

2.  **`processor.ts` - The Catalog Processor Implementation:**

    - **Purpose:** Implements the core `CatalogProcessor` interface required by the Backstage catalog backend. This class integrates the specific analysis logic with the catalog's processing pipeline.
    - **Key Class:** `ExampleLocationAnalyzerProcessor`
    - **Key Methods:**
      - `getProcessorName()`: Returns a unique identifier for the processor. Crucial for logging and debugging.
      - `constructor()`: Receives dependencies (logger, config, integrations, analyzerFactory) injected by `module.ts`.
      - `readLocation(location, _resolve, emit)`: The heart of the processor's interaction. It's called by the catalog engine for each discovered `LocationSpec`.
        - **Filtering:** Checks `location.type` and reads configuration (`catalog.processors.exampleLocationAnalyzer.enabled`) to decide if processing should proceed. Demonstrates conditional logic based on entity data and config.
        - **Delegation:** Creates an `analyzer` instance using the injected `analyzerFactory` and calls its `analyze` method. This promotes separation of concerns.
        - **Emission:** Uses the `emit` function with `processingResult` helpers (e.g., `processingResult.location`, `processingResult.generalError`) to communicate outcomes back to the catalog engine. Shows how processors report success, failure, or derived entities. (Note: Emitting derived entities is commented out in the example but shows the capability).

3.  **`analyzer.ts` - The Core Logic:**

    - **Purpose:** Encapsulates the _actual_ work of analyzing a location. This separation makes the logic reusable and testable independently of Backstage integration details.
    - **Key Class:** `ExampleLocationAnalyzer`
    - **Key Methods:**
      - `constructor()`: Receives necessary tools (config, logger, integrations).
      - `analyze(options)`: Performs the analysis based on the target URL. In this example, it's a placeholder simulating work, but it highlights where to integrate external calls, file system operations (via integrations), or complex parsing. Demonstrates interaction with `Logger` and potentially `ScmIntegrationRegistry`.

4.  **`allowLocation.ts` - Configuration Helper:**

    - **Purpose:** Provides a utility function to check if a location's target URL matches configured glob patterns.
    - **Key Function:** `isAllowedLocation(config, location)`
    - **Mechanism:** Reads `catalog.processors.example.allowedLocationTargets` from the `Config` object and uses the `minimatch` library. Shows how to make processors configurable and flexible.

5.  **`index.ts` - Module Export:**
    - **Purpose:** Standard practice to export the primary module definition (`catalogModuleExampleProcessor`) for easy importing by the main backend (`packages/backend/src/index.ts`).

**Overall Purpose Summary:**

This module demonstrates the canonical way to extend the Backstage Software Catalog with custom logic triggered during entity processing. It shows how to:

- Define a backend module.
- Register a processor with the correct extension point.
- Inject and use core Backstage services (Config, Logger, Integrations).
- Implement the `CatalogProcessor` interface, focusing on the `readLocation` step.
- Separate integration logic (`processor.ts`) from core business logic (`analyzer.ts`).
- Make the processor configurable via `app-config.yaml`.
- Provide clear documentation and comments, emphasizing its role as a learning resource and foundation for custom development within the Developer Experience domain.
