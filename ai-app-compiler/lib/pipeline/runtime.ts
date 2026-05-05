import { validateConfig } from "@/lib/pipeline/validator";
import type { AppConfig, RuntimePermissionMatrix, RuntimeSimulation } from "@/lib/types";

export function simulateRuntime(config: AppConfig): RuntimeSimulation {
  const validation = validateConfig(config);
  const tableNames = new Set(config.database.tables.map((table) => table.name));

  const pages = config.ui.pages.map((page) => ({
    route: page.route,
    title: page.name,
    layout: page.layout,
    components: page.components,
    connectedApis: page.usesApi
  }));

  const apiMap = config.api.endpoints.map((endpoint) => ({
    method: endpoint.method,
    path: endpoint.path,
    table: endpoint.table,
    requestFields: endpoint.validation.request.map((field) => `${field.name}:${field.type}`),
    responseFields: endpoint.validation.response.map((field) => `${field.name}:${field.type}`),
    executable: tableNames.has(endpoint.table)
  }));

  const databaseMap = config.database.tables.map((table) => ({
    table: table.name,
    fields: table.fields.map((field) => field.name)
  }));

  const relationMap = config.database.relations.map((relation) => ({
    from: `${relation.fromTable}.${relation.fromField}`,
    to: `${relation.toTable}.${relation.toField}`,
    type: relation.type,
    executable:
      tableNames.has(relation.fromTable) &&
      tableNames.has(relation.toTable) &&
      Boolean(
        config.database.tables
          .find((table) => table.name === relation.fromTable)
          ?.fields.some((field) => field.name === relation.fromField)
      ) &&
      Boolean(
        config.database.tables
          .find((table) => table.name === relation.toTable)
          ?.fields.some((field) => field.name === relation.toField)
      )
  }));

  const permissionMatrix: RuntimePermissionMatrix[] = config.roles.map((role) => {
    const pagesForRole = config.ui.pages
      .filter((page) => page.requiredRole === role.name || page.requiredRole === "public")
      .map((page) => page.name);
    const endpointsForRole = config.api.endpoints
      .filter((endpoint) => endpoint.requiredRole === role.name || endpoint.requiredRole === "public")
      .map((endpoint) => endpoint.path);

    return {
      role: role.name,
      pages: Array.from(new Set(pagesForRole)),
      endpoints: Array.from(new Set(endpointsForRole))
    };
  });

  return {
    pages,
    apiMap,
    databaseMap,
    relationMap,
    permissionMatrix,
    executable: validation.valid,
    issues: validation.errors
  };
}
