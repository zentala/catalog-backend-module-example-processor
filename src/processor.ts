/**
 * @fileoverview This file defines the ExampleLocationAnalyzerProcessor class, which is responsible for
 * processing location entities and potentially adding custom annotations or data based on
 * analysis results. It integrates with the Backstage catalog processing pipeline.
 */

import { CatalogProcessor, CatalogProcessorEmit, LocationSpec, processingResult } from '@backstage/plugin-catalog-node';
import { Location } from '@backstage/catalog-model';
import { Logger } from 'winston';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { Config } from '@backstage/config';
import { compare } from 'semver';
import { CodeOwnersProcessor } from '@backstage/plugin-catalog-backend-module-codeowners';
import { ANNOTATION_LOCATION, ANNOTATION_ORIGIN_LOCATION } from '@backstage/catalog-model';
import { YamlProcessor } from './yamlProcessor'; // Assuming YamlProcessor might be needed or is part of the example logic

// Assuming these types are defined elsewhere or need to be defined/imported
type AnalyzeFunc = (options: {
  target: string;
  config: Config;
  logger: Logger;
}) => Promise<{ count: number; msg: string }>;

type AnalyzerFactory = (options: { config: Config; logger: Logger; integrations: ScmIntegrationRegistry }) => {
  analyze: AnalyzeFunc;
};

/**
 * A processor that analyzes locations and potentially enriches entities.
 * This processor demonstrates how to integrate custom analysis logic into the
 * Backstage catalog processing pipeline. It interacts with configuration,
 * logging, and SCM integrations.
 *
 * @public
 */
export class ExampleLocationAnalyzerProcessor implements CatalogProcessor {
  private readonly logger: Logger;
  private readonly integrations: ScmIntegrationRegistry;
  private readonly config: Config;
  private readonly analyzerFactory: AnalyzerFactory; // Keep the factory pattern if needed

  /**
   * Creates an instance of ExampleLocationAnalyzerProcessor.
   *
   * @param options - Configuration options for the processor.
   * @param options.logger - Winston logger instance.
   * @param options.integrations - SCM integration registry.
   * @param options.config - Backstage configuration object.
   * @param options.analyzerFactory - A factory function to create the analyzer instance.
   */
  constructor(options: {
    logger: Logger;
    integrations: ScmIntegrationRegistry;
    config: Config;
    analyzerFactory: AnalyzerFactory; // Inject the factory
  }) {
    this.logger = options.logger;
    this.integrations = options.integrations;
    this.config = options.config;
    this.analyzerFactory = options.analyzerFactory; // Store the factory
  }

  /**
   * Provides a unique identifier for this processor.
   * @returns The processor name.
   */
  getProcessorName(): string {
    return 'ExampleLocationAnalyzerProcessor';
  }

  /**
   * Reads the location spec and triggers the analysis if applicable.
   * This method is called by the catalog processing engine for each discovered location.
   *
   * @param location - The location entity being processed.
   * @param _resolve - A function to resolve relative paths (unused here).
   * @param emit - A function to emit processing results (entities, errors, etc.).
   * @returns A promise indicating whether the location was processed.
   */
  async readLocation(
    location: LocationSpec,
    _resolve: (url: string) => string, // Mark as unused if applicable
    emit: CatalogProcessorEmit
  ): Promise<boolean> {
    // Skip analysis for non-URL locations or if type is not 'url'
    if (location.type !== 'url') {
      this.logger.debug(`Skipping location ${location.target} as it's not of type 'url'.`);
      return false;
    }

    const enabled = this.config.getOptionalBoolean('catalog.processors.exampleLocationAnalyzer.enabled');
    if (enabled === false) {
      this.logger.info('ExampleLocationAnalyzerProcessor is disabled.');
      return false;
    }

    const analyzer = this.analyzerFactory({
      // Create analyzer instance using the factory
      config: this.config,
      logger: this.logger,
      integrations: this.integrations
    });

    this.logger.info(`Analyzing location: ${location.target}`);

    try {
      const { count, msg } = await analyzer.analyze({
        // Call the analyze method
        target: location.target,
        config: this.config, // Pass necessary context
        logger: this.logger
      });

      this.logger.info(`Analysis complete for ${location.target}: Found ${count} items. Message: ${msg}`);

      // Example: Emit an entity based on analysis results
      // This part needs to be adapted based on what the analyzer actually does
      // and what kind of entities should be emitted.
      if (count > 0) {
        // Example: Create a placeholder entity - replace with actual logic
        const syntheticEntity: Location = {
          // Use Location type or a more specific entity type
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Location', // Or another kind like 'Resource', 'Component' etc.
          metadata: {
            name: `analysis-result-${Date.now()}`, // Generate a unique name
            namespace: 'default', // Or determine namespace dynamically
            annotations: {
              'example.com/analysis-message': msg,
              'example.com/item-count': String(count),
              // Crucially, link back to the original location
              [ANNOTATION_LOCATION]: `url:${location.target}`,
              [ANNOTATION_ORIGIN_LOCATION]: `url:${location.target}`
            }
          },
          spec: {
            // Spec depends on the 'kind'. For 'Location', it might be empty or specify targets.
            // For other kinds, fill accordingly.
            type: 'url', // Or another relevant type
            target: location.target // Or a derived target
          }
        };
        emit(processingResult.location(location, false)); // Indicate location was processed
        // Optionally emit the derived entity
        // emit(processingResult.entity(syntheticEntity, syntheticEntity)); // Emitting entity derived from analysis
      } else {
        emit(processingResult.location(location, false)); // Still mark location as processed
      }

      return true; // Indicate that this processor handled the location
    } catch (error: any) {
      this.logger.error(`Failed to analyze location ${location.target}: ${error.message}`, { stack: error.stack });
      emit(processingResult.generalError(error, location));
      return false; // Indicate failure or inability to process fully
    }
  }
}
