import { appConfigSchema } from "@/lib/schemas/app-config.schema";
import type { AppConfig } from "@/lib/types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const roleIsKnown = (role: string, roles: Set<string>) => role === "public" || roles.has(role);

const normalize = (value: string) => value.trim().toLowerCase();

const hasPage = (config: AppConfig, pageName: string) =>
  config.ui.pages.some((page) => normalize(page.name) === normalize(pageName));

const hasTable = (config: AppConfig, tableName: string) =>
  config.database.tables.some((table) => normalize(table.name) === normalize(tableName));

const findTable = (config: AppConfig, tableName: string) =>
  config.database.tables.find((table) => table.name === tableName);

const findField = (config: AppConfig, tableName: string, fieldName: string) =>
  findTable(config, tableName)?.fields.find((field) => field.name === fieldName);

const hasApiContaining = (config: AppConfig, token: string) =>
  config.api.endpoints.some((endpoint) => normalize(endpoint.path).includes(normalize(token)));

const containsAny = (haystack: string, needles: string[]) =>
  needles.some((needle) => haystack.includes(needle));

export function validateConfig(config: AppConfig): ValidationResult {
  const schemaResult = appConfigSchema.safeParse(config);

  if (!schemaResult.success) {
    return {
      valid: false,
      errors: schemaResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "root";
        return `Schema error at ${path}: ${issue.message}`;
      }),
      warnings: []
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const roleNames = new Set(config.roles.map((role) => role.name));
  const tableNames = new Set(config.database.tables.map((table) => table.name));
  const apiPaths = new Set(config.api.endpoints.map((endpoint) => endpoint.path));
  const logicText = config.businessLogic.join(" ").toLowerCase();
  const pageText = config.ui.pages.map((page) => `${page.name} ${page.route}`).join(" ").toLowerCase();
  const tableText = config.database.tables.map((table) => table.name).join(" ").toLowerCase();
  const hasProtectedPage = config.ui.pages.some((page) => page.requiredRole !== "public");

  config.api.endpoints.forEach((endpoint) => {
    if (!tableNames.has(endpoint.table)) {
      errors.push(
        `Endpoint ${endpoint.method} ${endpoint.path} references missing table "${endpoint.table}".`
      );
      return;
    }

    if (!roleIsKnown(endpoint.requiredRole, roleNames)) {
      errors.push(
        `Endpoint ${endpoint.method} ${endpoint.path} requires unknown role "${endpoint.requiredRole}".`
      );
    }

    endpoint.validation.request.forEach((field) => {
      if (field.source === "response") {
        errors.push(`Endpoint ${endpoint.method} ${endpoint.path} has response field "${field.name}" inside request validation.`);
        return;
      }

      if (field.source === "body") {
        const dbField = findField(config, endpoint.table, field.name);

        if (!dbField) {
          errors.push(
            `Endpoint ${endpoint.method} ${endpoint.path} request field "${field.name}" does not exist on table "${endpoint.table}".`
          );
          return;
        }

        if (dbField.type !== field.type) {
          errors.push(
            `Endpoint ${endpoint.method} ${endpoint.path} request field "${field.name}" type "${field.type}" does not match table type "${dbField.type}".`
          );
        }
      }
    });

    endpoint.validation.response.forEach((field) => {
      if (field.source !== "response") {
        errors.push(`Endpoint ${endpoint.method} ${endpoint.path} response field "${field.name}" must use source "response".`);
        return;
      }

      const dbField = findField(config, endpoint.table, field.name);

      if (!dbField) {
        errors.push(
          `Endpoint ${endpoint.method} ${endpoint.path} response field "${field.name}" does not exist on table "${endpoint.table}".`
        );
        return;
      }

      if (dbField.type !== field.type) {
        errors.push(
          `Endpoint ${endpoint.method} ${endpoint.path} response field "${field.name}" type "${field.type}" does not match table type "${dbField.type}".`
        );
      }
    });
  });

  config.database.relations.forEach((relation) => {
    if (!tableNames.has(relation.fromTable)) {
      errors.push(`Relation ${relation.fromTable}.${relation.fromField} references missing fromTable "${relation.fromTable}".`);
      return;
    }

    if (!tableNames.has(relation.toTable)) {
      errors.push(`Relation ${relation.fromTable}.${relation.fromField} references missing toTable "${relation.toTable}".`);
      return;
    }

    if (!findField(config, relation.fromTable, relation.fromField)) {
      errors.push(`Relation ${relation.fromTable}.${relation.fromField} uses missing source field "${relation.fromField}".`);
    }

    if (!findField(config, relation.toTable, relation.toField)) {
      errors.push(`Relation ${relation.toTable}.${relation.toField} uses missing target field "${relation.toField}".`);
    }
  });

  config.ui.pages.forEach((page) => {
    page.usesApi.forEach((apiPath) => {
      if (!apiPaths.has(apiPath)) {
        errors.push(`Page "${page.name}" uses unknown API path "${apiPath}".`);
      }
    });

    if (!roleIsKnown(page.requiredRole, roleNames)) {
      errors.push(`Page "${page.name}" requires unknown role "${page.requiredRole}".`);
    }

    if (normalize(page.name).includes("admin") && page.requiredRole === "public") {
      warnings.push(`Admin page "${page.name}" is public; review access control.`);
    }
  });

  config.auth.permissions.forEach((permission) => {
    if (!roleNames.has(permission.role)) {
      errors.push(`Permission for resource "${permission.resource}" uses unknown role "${permission.role}".`);
    }
  });

  config.database.tables.forEach((table) => {
    if (!table.fields.some((field) => field.name === "id")) {
      errors.push(`Table "${table.name}" is missing required id field.`);
    }
  });

  if (!hasPage(config, "Login")) {
    errors.push("App is missing required Login page.");
  }

  if (!hasPage(config, "Dashboard")) {
    errors.push("App is missing required Dashboard page.");
  }

  if (hasProtectedPage && !config.auth.providers.includes("email_password")) {
    errors.push("Protected pages exist but auth provider email_password is not configured.");
  }

  const needsBilling = containsAny(`${logicText} ${pageText} ${tableText}`, [
    "payment",
    "premium",
    "billing",
    "subscription",
    "plan"
  ]);

  if (needsBilling) {
    if (!hasTable(config, "plans")) {
      errors.push("Payments or premium logic exists but plans table is missing.");
    }

    if (!hasPage(config, "Billing")) {
      errors.push("Payments or premium logic exists but Billing page is missing.");
    }
  }

  const needsAnalytics = containsAny(`${logicText} ${pageText}`, ["analytics", "reporting", "insight"]);

  if (needsAnalytics) {
    if (!hasApiContaining(config, "analytics")) {
      errors.push("Analytics logic exists but analytics API endpoint is missing.");
    }

    if (!hasPage(config, "Analytics")) {
      errors.push("Analytics logic exists but Analytics page is missing.");
    }
  }

  const dashboardPages = config.ui.pages.filter((page) => normalize(page.name).includes("dashboard"));
  const hasPublicDashboard = dashboardPages.some((page) => page.requiredRole === "public");
  const hasPrivateDashboard = dashboardPages.some((page) => page.requiredRole !== "public");

  if (hasPublicDashboard && hasPrivateDashboard) {
    warnings.push("Both public and protected dashboards exist; routes should make the distinction explicit.");
  }

  if (logicText.includes("delete all users automatically")) {
    warnings.push("Potentially destructive automation was captured as a safety note instead of an executable flow.");
  }

  if (logicText.includes("role capability hierarchy is inverted")) {
    warnings.push("Role hierarchy is unusual; verify that admin and user permissions are intentional.");
  }

  if (config.assumptions.length > 0) {
    warnings.push(`${config.assumptions.length} assumption(s) were made to produce an executable config.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
