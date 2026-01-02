import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Resolves the correct templates folder for NestJS Mailer
 * Works in both development (ts-node) and production (dist)
 */
export function resolveTemplateDir(): string {
  // Development: src folder
  const devPath = join(process.cwd(), 'src/mail/templates');

  // Production: dist folder
  const prodPath = join(process.cwd(), 'dist/mail/templates');

  if (existsSync(devPath)) return devPath;
  if (existsSync(prodPath)) return prodPath;

  throw new Error('Mailer templates folder not found');
}
