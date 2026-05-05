import type {
  ApiEndpoint,
  ApiEndpointValidation,
  AppConfig,
  DatabaseField,
  DatabaseTable,
  RepairLog,
  Role,
  UiPage
} from "@/lib/types";
import { validateConfig, type ValidationResult } from "@/lib/pipeline/validator";

export interface RepairResult {
  config: AppConfig;
  validation: ValidationResult;
  logs: RepairLog[];
  attempts: number;
}

const cloneConfig = (config: AppConfig): AppConfig => JSON.parse(JSON.stringify(config)) as AppConfig;

const hasRole = (config: AppConfig, roleName: string) =>
  roleName === "public" || config.roles.some((role) => role.name === roleName);

const hasTable = (config: AppConfig, tableName: string) =>
  config.database.tables.some((table) => table.name === tableName);

const hasEndpoint = (config: AppConfig, path: string, method?: string) =>
  config.api.endpoints.some((endpoint) => endpoint.path === path && (!method || endpoint.method === method));

const defaultProtectedRole = (config: AppConfig) =>
  config.roles.some((role) => role.name === "user") ? "user" : config.roles[0]?.name ?? "user";

const minimalFields = (): DatabaseField[] => [
  { name: "id", type: "string", required: true },
  { name: "title", type: "string", required: true },
  { name: "createdAt", type: "date", required: true }
];

const validationForFields = (fields: DatabaseField[], method: "GET" | "POST"): ApiEndpointValidation => {
  const response = fields.map((field) => ({
    ...field,
    source: "response" as const
  }));

  if (method === "GET") {
    return {
      request: [
        { name: "limit", type: "number", required: false, source: "query" },
        { name: "offset", type: "number", required: false, source: "query" }
      ],
      response
    };
  }

  return {
    request: fields
      .filter((field) => !["id", "createdAt", "updatedAt"].includes(field.name))
      .map((field) => ({
        ...field,
        source: "body" as const
      })),
    response
  };
};

const layoutFor = (type: "auth" | "dashboard" | "analytics" | "billing" | "admin" | "crud") => {
  const layouts = {
    auth: {
      type: "auth" as const,
      regions: ["auth-panel", "status"],
      navigation: "none" as const,
      dataDensity: "comfortable" as const
    },
    dashboard: {
      type: "dashboard" as const,
      regions: ["header", "sidebar", "metrics", "activity"],
      navigation: "sidebar" as const,
      dataDensity: "compact" as const
    },
    analytics: {
      type: "analytics" as const,
      regions: ["header", "sidebar", "metrics", "charts"],
      navigation: "sidebar" as const,
      dataDensity: "compact" as const
    },
    billing: {
      type: "billing" as const,
      regions: ["header", "sidebar", "plans", "invoices"],
      navigation: "sidebar" as const,
      dataDensity: "comfortable" as const
    },
    admin: {
      type: "admin" as const,
      regions: ["header", "sidebar", "role-matrix", "audit"],
      navigation: "sidebar" as const,
      dataDensity: "compact" as const
    },
    crud: {
      type: "crud" as const,
      regions: ["header", "sidebar", "filters", "table", "detail"],
      navigation: "sidebar" as const,
      dataDensity: "compact" as const
    }
  };

  return layouts[type];
};

const plansFields = (): DatabaseField[] => [
  { name: "id", type: "string", required: true },
  { name: "name", type: "string", required: true },
  { name: "price", type: "number", required: true },
  { name: "interval", type: "enum", required: true },
  { name: "active", type: "boolean", required: true }
];

const analyticsFields = (): DatabaseField[] => [
  { name: "id", type: "string", required: true },
  { name: "eventName", type: "string", required: true },
  { name: "actorId", type: "string", required: false },
  { name: "value", type: "number", required: false },
  { name: "createdAt", type: "date", required: true }
];

function addRole(config: AppConfig, roleName: string): boolean {
  if (hasRole(config, roleName)) {
    return false;
  }

  const role: Role = {
    name: roleName,
    description: `Role inferred during repair for references to ${roleName}.`
  };

  config.roles.push(role);
  return true;
}

function addTable(config: AppConfig, tableName: string, fields = minimalFields()): boolean {
  if (hasTable(config, tableName)) {
    return false;
  }

  const table: DatabaseTable = {
    name: tableName,
    fields
  };

  config.database.tables.push(table);
  return true;
}

function addEndpoint(
  config: AppConfig,
  endpoint: ApiEndpoint,
  logs: RepairLog[],
  attempt: number
): boolean {
  if (hasEndpoint(config, endpoint.path, endpoint.method)) {
    return false;
  }

  config.api.endpoints.push(endpoint);
  logs.push({
    attempt,
    action: "add_endpoint",
    detail: `Added ${endpoint.method} ${endpoint.path} for table "${endpoint.table}".`
  });
  return true;
}

function addPage(config: AppConfig, page: UiPage, logs: RepairLog[], attempt: number): boolean {
  if (config.ui.pages.some((existing) => existing.name === page.name || existing.route === page.route)) {
    return false;
  }

  config.ui.pages.push(page);
  logs.push({
    attempt,
    action: "add_page",
    detail: `Added ${page.name} page at ${page.route}.`
  });
  return true;
}

function addResourceEndpointPair(config: AppConfig, tableName: string, path: string, role: string) {
  const table = config.database.tables.find((candidate) => candidate.name === tableName);
  const fields = table?.fields ?? minimalFields();
  const endpoints: ApiEndpoint[] = [
    {
      path,
      method: "GET",
      description: `List ${tableName} records added by repair.`,
      requiredRole: role,
      table: tableName,
      validation: validationForFields(fields, "GET")
    },
    {
      path,
      method: "POST",
      description: `Create ${tableName} records added by repair.`,
      requiredRole: role,
      table: tableName,
      validation: validationForFields(fields, "POST")
    }
  ];

  endpoints.forEach((endpoint) => {
    if (!hasEndpoint(config, endpoint.path, endpoint.method)) {
      config.api.endpoints.push(endpoint);
    }
  });
}

function repairMissingCorePages(
  config: AppConfig,
  errors: string[],
  logs: RepairLog[],
  attempt: number
) {
  let changed = false;
  const role = defaultProtectedRole(config);

  if (errors.includes("App is missing required Login page.")) {
    changed =
      addPage(
        config,
        {
          name: "Login",
          route: "/login",
          layout: layoutFor("auth"),
          components: ["AuthForm", "ProviderStatus"],
          requiredRole: "public",
          usesApi: []
        },
        logs,
        attempt
      ) || changed;
  }

  if (errors.includes("App is missing required Dashboard page.")) {
    const usableApis = config.api.endpoints
      .filter((endpoint) => endpoint.method === "GET")
      .slice(0, 3)
      .map((endpoint) => endpoint.path);

    changed =
      addPage(
        config,
        {
          name: "Dashboard",
          route: "/dashboard",
          layout: layoutFor("dashboard"),
          components: ["Header", "Sidebar", "MetricGrid", "ActivityFeed"],
          requiredRole: role,
          usesApi: usableApis
        },
        logs,
        attempt
      ) || changed;
  }

  return changed;
}

function repairMissingTables(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;

  errors.forEach((error) => {
    const match = error.match(/references missing table "([^"]+)"/);

    if (!match) {
      return;
    }

    const tableName = match[1];
    const added = addTable(config, tableName);
    changed = added || changed;

    if (added) {
      logs.push({
        attempt,
        action: "add_table",
        detail: `Created minimal table "${tableName}" for an endpoint reference.`
      });
    }
  });

  return changed;
}

function repairUnknownApiUsage(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;

  errors.forEach((error) => {
    const match = error.match(/Page "([^"]+)" uses unknown API path "([^"]+)"/);

    if (!match) {
      return;
    }

    const [, pageName, apiPath] = match;

    config.ui.pages = config.ui.pages.map((page) => {
      if (page.name !== pageName || !page.usesApi.includes(apiPath)) {
        return page;
      }

      changed = true;
      return {
        ...page,
        usesApi: page.usesApi.filter((path) => path !== apiPath)
      };
    });

    if (changed) {
      logs.push({
        attempt,
        action: "remove_unknown_api_usage",
        detail: `Removed unknown API path ${apiPath} from page "${pageName}".`
      });
    }
  });

  return changed;
}

function repairUnknownRoles(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;

  errors.forEach((error) => {
    const match =
      error.match(/requires unknown role "([^"]+)"/) ?? error.match(/uses unknown role "([^"]+)"/);

    if (!match) {
      return;
    }

    const roleName = match[1];
    const added = addRole(config, roleName);
    changed = added || changed;

    if (added) {
      logs.push({
        attempt,
        action: "add_role",
        detail: `Added missing role "${roleName}" referenced by config layers.`
      });
    }
  });

  return changed;
}

function repairMissingIdFields(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;

  errors.forEach((error) => {
    const match = error.match(/Table "([^"]+)" is missing required id field/);

    if (!match) {
      return;
    }

    const tableName = match[1];
    const table = config.database.tables.find((candidate) => candidate.name === tableName);

    if (!table || table.fields.some((field) => field.name === "id")) {
      return;
    }

    table.fields.unshift({ name: "id", type: "string", required: true });
    changed = true;
    logs.push({
      attempt,
      action: "add_id_field",
      detail: `Added id field to table "${tableName}".`
    });
  });

  return changed;
}

function repairAuthProvider(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  if (
    !errors.includes("Protected pages exist but auth provider email_password is not configured.") ||
    config.auth.providers.includes("email_password")
  ) {
    return false;
  }

  config.auth.providers = ["email_password"];
  logs.push({
    attempt,
    action: "add_auth_provider",
    detail: "Added email_password auth provider for protected pages."
  });
  return true;
}

function repairEndpointValidation(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;

  errors.forEach((error) => {
    const match = error.match(/Endpoint (GET|POST|PUT|DELETE) (\/api\/[^\s]+)/);

    if (!match) {
      return;
    }

    const [, method, path] = match;
    const endpoint = config.api.endpoints.find((candidate) => candidate.method === method && candidate.path === path);
    const table = endpoint ? config.database.tables.find((candidate) => candidate.name === endpoint.table) : undefined;

    if (!endpoint || !table) {
      return;
    }

    endpoint.validation = validationForFields(table.fields, method === "GET" ? "GET" : "POST");
    changed = true;
    logs.push({
      attempt,
      action: "sync_endpoint_validation",
      detail: `Rebuilt validation contract for ${method} ${path} from table "${table.name}".`
    });
  });

  return changed;
}

function repairRelations(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;

  errors.forEach((error) => {
    const missingTable = error.match(/Relation ([^.]+)\.([^ ]+) references missing (fromTable|toTable) "([^"]+)"/);

    if (missingTable) {
      const tableName = missingTable[4];
      const added = addTable(config, tableName);
      changed = added || changed;

      if (added) {
        logs.push({
          attempt,
          action: "add_relation_table",
          detail: `Created minimal table "${tableName}" for relation consistency.`
        });
      }
    }

    const missingSource = error.match(/Relation ([^.]+)\.([^ ]+) uses missing source field "([^"]+)"/);

    if (missingSource) {
      const [, tableName, , fieldName] = missingSource;
      const table = config.database.tables.find((candidate) => candidate.name === tableName);

      if (table && !table.fields.some((field) => field.name === fieldName)) {
        table.fields.push({ name: fieldName, type: "string", required: false });
        changed = true;
        logs.push({
          attempt,
          action: "add_relation_source_field",
          detail: `Added missing relation source field "${fieldName}" to table "${tableName}".`
        });
      }
    }

    const missingTarget = error.match(/Relation ([^.]+)\.([^ ]+) uses missing target field "([^"]+)"/);

    if (missingTarget) {
      const [, tableName, , fieldName] = missingTarget;
      const table = config.database.tables.find((candidate) => candidate.name === tableName);

      if (table && !table.fields.some((field) => field.name === fieldName)) {
        table.fields.unshift({ name: fieldName, type: "string", required: true });
        changed = true;
        logs.push({
          attempt,
          action: "add_relation_target_field",
          detail: `Added missing relation target field "${fieldName}" to table "${tableName}".`
        });
      }
    }
  });

  return changed;
}

function repairPayments(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;
  const role = defaultProtectedRole(config);

  if (errors.includes("Payments or premium logic exists but plans table is missing.")) {
    const added = addTable(config, "plans", plansFields());
    changed = added || changed;

    if (added) {
      logs.push({
        attempt,
        action: "add_plans_table",
        detail: "Added plans table required by premium/payment logic."
      });
    }
  }

  if (hasTable(config, "plans")) {
    const before = config.api.endpoints.length;
    addResourceEndpointPair(config, "plans", "/api/plans", role);

    if (config.api.endpoints.length > before) {
      changed = true;
      logs.push({
        attempt,
        action: "add_plans_api",
        detail: "Added /api/plans endpoints for billing pages."
      });
    }
  }

  if (errors.includes("Payments or premium logic exists but Billing page is missing.")) {
    changed =
      addPage(
        config,
        {
          name: "Billing",
          route: "/billing",
          layout: layoutFor("billing"),
          components: ["Header", "Sidebar", "PlanSelector", "InvoiceList"],
          requiredRole: role,
          usesApi: ["/api/plans"]
        },
        logs,
        attempt
      ) || changed;
  }

  return changed;
}

function repairAnalytics(config: AppConfig, errors: string[], logs: RepairLog[], attempt: number) {
  let changed = false;
  const role = hasRole(config, "admin") ? "admin" : defaultProtectedRole(config);

  if (
    errors.includes("Analytics logic exists but analytics API endpoint is missing.") ||
    errors.includes("Analytics logic exists but Analytics page is missing.")
  ) {
    const addedTable = addTable(config, "analytics_events", analyticsFields());

    if (addedTable) {
      changed = true;
      logs.push({
        attempt,
        action: "add_analytics_table",
        detail: "Added analytics_events table for analytics runtime mapping."
      });
    }
  }

  if (errors.includes("Analytics logic exists but analytics API endpoint is missing.")) {
    changed =
      addEndpoint(
        config,
        {
          path: "/api/analytics",
          method: "GET",
          description: "Read aggregated analytics metrics.",
          requiredRole: role,
          table: "analytics_events",
          validation: validationForFields(
            config.database.tables.find((table) => table.name === "analytics_events")?.fields ?? analyticsFields(),
            "GET"
          )
        },
        logs,
        attempt
      ) || changed;
  }

  if (errors.includes("Analytics logic exists but Analytics page is missing.")) {
    changed =
      addPage(
        config,
        {
          name: "Analytics",
          route: "/analytics",
          layout: layoutFor("analytics"),
          components: ["Header", "Sidebar", "MetricGrid", "TrendChart"],
          requiredRole: role,
          usesApi: ["/api/analytics"]
        },
        logs,
        attempt
      ) || changed;
  }

  return changed;
}

export function repairConfig(config: AppConfig, validationResult: ValidationResult): RepairResult {
  const repaired = cloneConfig(config);
  const logs: RepairLog[] = [];
  let validation = validationResult;
  let attempts = 0;

  if (validation.valid) {
    repaired.validationReport = {
      valid: true,
      errors: [],
      warnings: validation.warnings,
      repairAttempts: 0
    };

    return {
      config: repaired,
      validation,
      logs: [
        {
          attempt: 0,
          action: "no_repair_needed",
          detail: "Initial config passed schema and cross-layer validation."
        }
      ],
      attempts
    };
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    attempts = attempt;
    const errors = validation.errors;
    const changes = [
      repairMissingCorePages(repaired, errors, logs, attempt),
      repairMissingTables(repaired, errors, logs, attempt),
      repairUnknownApiUsage(repaired, errors, logs, attempt),
      repairUnknownRoles(repaired, errors, logs, attempt),
      repairMissingIdFields(repaired, errors, logs, attempt),
      repairAuthProvider(repaired, errors, logs, attempt),
      repairEndpointValidation(repaired, errors, logs, attempt),
      repairRelations(repaired, errors, logs, attempt),
      repairPayments(repaired, errors, logs, attempt),
      repairAnalytics(repaired, errors, logs, attempt)
    ];
    const changed = changes.some(Boolean);

    validation = validateConfig(repaired);

    if (validation.valid) {
      break;
    }

    if (!changed) {
      logs.push({
        attempt,
        action: "unrepaired_errors",
        detail: `No targeted repair rule matched ${validation.errors.length} remaining error(s).`
      });
      break;
    }
  }

  repaired.validationReport = {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    repairAttempts: attempts
  };

  return {
    config: repaired,
    validation,
    logs,
    attempts
  };
}
