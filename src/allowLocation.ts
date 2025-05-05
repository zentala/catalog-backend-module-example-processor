/**
 * @fileoverview Defines helper functions for determining if a location should be allowed
 * based on configuration rules. This is typically used by processors to decide whether
 * to act on a specific location target.
 */

import { Config } from '@backstage/config';
import { LocationSpec } from '@backstage/plugin-catalog-node';
import { minimatch } from 'minimatch';

/**
 * Checks if a given location is allowed based on configured patterns.
 *
 * Reads 'catalog.processors.example.allowedLocationTargets' from the config,
 * which should be an array of glob patterns.
 *
 * @param config - The Backstage configuration object.
 * @param location - The location specification to check.
 * @returns `true` if the location target matches any of the allowed patterns or if no patterns are defined,
 *          `false` otherwise.
 */
export function isAllowedLocation(config: Config, location: LocationSpec): boolean {
  const patterns = config.getOptionalStringArray('catalog.processors.example.allowedLocationTargets');
  if (!patterns) {
    return true; // Allow all if no specific patterns are configured
  }

  return patterns.some((pattern) => minimatch(location.target, pattern));
}
