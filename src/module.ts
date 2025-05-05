/**
 * @fileoverview Defines the backend module for the example catalog processor.
 * This module registers the ExampleLocationAnalyzerProcessor with the catalog processing extension point.
 */

import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha'; // Use alpha extension point
import { ScmIntegrationRegistry } from '@backstage/integration';

import { ExampleLocationAnalyzerProcessor } from './processor';
import { ExampleLocationAnalyzer } from './analyzer';

/**
 * Factory function to create the ExampleLocationAnalyzer instance.
 * This follows the pattern used in the original processor.ts.
 */
const analyzerFactory = (options: {
  config: coreServices.RootConfigService;
  logger: coreServices.LoggerService;
  integrations: ScmIntegrationRegistry;
}) => {
  return new ExampleLocationAnalyzer({
    config: options.config,
    logger: options.logger,
    integrations: options.integrations
  });
};

/**
 * Backend module for the catalog-backend-module-example-processor plugin.
 *
 * @public
 */
export const catalogModuleExampleProcessor = createBackendModule({
  pluginId: 'catalog', // Target plugin ID
  moduleId: 'example-processor', // Module ID
  register(reg) {
    // Register the processor with the catalog processing extension point
    reg.registerInit({
      deps: {
        catalogExtensionPoint: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        integrations: coreServices.integration
      },
      async init({ catalogExtensionPoint, logger, config, integrations }) {
        logger.info('Initializing ExampleLocationAnalyzerProcessor module for catalog');

        // Create the analyzer instance using the factory pattern
        const createAnalyzer = () => analyzerFactory({ config, logger, integrations });

        // Create and add the processor instance
        catalogExtensionPoint.addProcessor(
          new ExampleLocationAnalyzerProcessor({
            logger,
            integrations,
            config,
            // Provide the factory to the processor constructor
            analyzerFactory: createAnalyzer as any // Cast might be needed depending on exact type definitions
          })
        );
      }
    });
  }
});
