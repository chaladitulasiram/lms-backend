// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// This key matches the metadata key we check in the guard
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);