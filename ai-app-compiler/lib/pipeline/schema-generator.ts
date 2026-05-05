import type {
  ApiEndpoint,
  ApiEndpointValidation,
  AppConfig,
  DatabaseRelation,
  DatabaseTable,
  PageDataDensity,
  PageLayoutType,
  PageNavigation,
  Permission,
  PermissionAction,
  SystemDesign,
  UiPage
} from "@/lib/types";

const titleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const entityPath = (entity: string) =>
  entity === "analytics_events" ? "/api/analytics" : `/api/${entity.replace(/_/g, "-")}`;

const uniqueBy = <T>(items: T[], keyFn: (item: T) => string) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = keyFn(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

function endpointRoleFor(table: string, design: SystemDesign) {
  const roleNames = design.roles.map((role) => role.name);

  if (table === "analytics_events" && roleNames.includes("admin")) {
    return "admin";
  }

  if (table === "users" && roleNames.includes("admin")) {
    return "admin";
  }

  if (["products", "orders"].includes(table) && roleNames.includes("seller")) {
    return "seller";
  }

  if (["courses", "progress"].includes(table) && roleNames.includes("teacher")) {
    return "teacher";
  }

  if (["tickets", "agents"].includes(table) && roleNames.includes("agent")) {
    return "agent";
  }

  if (["members", "trainers"].includes(table) && roleNames.includes("trainer")) {
    return "trainer";
  }

  if (roleNames.includes("manager")) {
    return "manager";
  }

  return roleNames.includes("user") ? "user" : roleNames[0];
}

function validationForEndpoint(table: DatabaseTable, method: "GET" | "POST"): ApiEndpointValidation {
  const response = table.fields.map((field) => ({
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
    request: table.fields
      .filter((field) => !["id", "createdAt", "updatedAt", "postedAt", "joinedAt"].includes(field.name))
      .map((field) => ({
        ...field,
        source: "body" as const
      })),
    response
  };
}

function generateEndpoints(tables: DatabaseTable[], design: SystemDesign): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = tables.flatMap((table) => {
    const path = entityPath(table.name);
    const role = endpointRoleFor(table.name, design);
    const label = titleCase(table.name);

    return [
      {
        path,
        method: "GET",
        description: `List ${label} records for authorized users.`,
        requiredRole: role,
        table: table.name,
        validation: validationForEndpoint(table, "GET")
      },
      {
        path,
        method: "POST",
        description: `Create ${label} records with validated input.`,
        requiredRole: role,
        table: table.name,
        validation: validationForEndpoint(table, "POST")
      }
    ];
  });

  return uniqueBy(endpoints, (endpoint) => `${endpoint.method}:${endpoint.path}`);
}

function layoutForPage(pageName: string): {
  type: PageLayoutType;
  regions: string[];
  navigation: PageNavigation;
  dataDensity: PageDataDensity;
} {
  const name = pageName.toLowerCase();

  if (name.includes("login")) {
    return {
      type: "auth",
      regions: ["auth-panel", "status"],
      navigation: "none",
      dataDensity: "comfortable"
    };
  }

  if (name.includes("analytics")) {
    return {
      type: "analytics",
      regions: ["header", "sidebar", "metrics", "charts"],
      navigation: "sidebar",
      dataDensity: "compact"
    };
  }

  if (name.includes("billing")) {
    return {
      type: "billing",
      regions: ["header", "sidebar", "plans", "invoices"],
      navigation: "sidebar",
      dataDensity: "comfortable"
    };
  }

  if (name.includes("admin")) {
    return {
      type: "admin",
      regions: ["header", "sidebar", "role-matrix", "audit"],
      navigation: "sidebar",
      dataDensity: "compact"
    };
  }

  if (name.includes("dashboard")) {
    return {
      type: "dashboard",
      regions: ["header", "sidebar", "metrics", "activity"],
      navigation: "sidebar",
      dataDensity: "compact"
    };
  }

  if (name.includes("public")) {
    return {
      type: "public",
      regions: ["header", "main"],
      navigation: "topbar",
      dataDensity: "comfortable"
    };
  }

  return {
    type: "crud",
    regions: ["header", "sidebar", "filters", "table", "detail"],
    navigation: "sidebar",
    dataDensity: "compact"
  };
}

function generatePages(design: SystemDesign): UiPage[] {
  return design.pages.map((page) => ({
    name: page.name,
    route: page.route,
    layout: layoutForPage(page.name),
    components: page.components,
    requiredRole: page.requiredRole,
    usesApi: page.usesEntities.map(entityPath)
  }));
}

function actionsFor(role: string, resource: string, design: SystemDesign): PermissionAction[] {
  const conflictText = design.conflicts.join(" ").toLowerCase();

  if (role === "admin") {
    return conflictText.includes("admin can do nothing") ? ["read"] : ["read", "create", "update", "delete"];
  }

  if (conflictText.includes("user can manage everything") && role === "user") {
    return ["read", "create", "update", "delete"];
  }

  if (resource === "analytics_events") {
    return ["read"];
  }

  if (resource === "users") {
    return ["read", "update"];
  }

  return ["read", "create", "update"];
}

function generatePermissions(design: SystemDesign, tables: DatabaseTable[]): Permission[] {
  return design.roles.flatMap((role) =>
    tables.map((table) => ({
      role: role.name,
      resource: table.name,
      actions: actionsFor(role.name, table.name, design)
    }))
  );
}

const relationTargets: Record<string, string> = {
  actorId: "users",
  candidateId: "candidates",
  companyId: "companies",
  courseId: "courses",
  customerId: "customers",
  managerId: "users",
  ownerId: "users",
  planId: "plans",
  projectId: "projects",
  slotId: "slots",
  studentId: "students",
  teacherId: "teachers",
  userId: "users"
};

function generateRelations(tables: DatabaseTable[]): DatabaseRelation[] {
  const tableNames = new Set(tables.map((table) => table.name));
  const relations = tables.flatMap((table) =>
    table.fields.flatMap((field) => {
      const targetTable = relationTargets[field.name];

      if (!targetTable || !tableNames.has(targetTable)) {
        return [];
      }

      return [
        {
          fromTable: table.name,
          fromField: field.name,
          toTable: targetTable,
          toField: "id",
          type: "many_to_one" as const,
          description: `${titleCase(table.name)}.${field.name} references ${titleCase(targetTable)}.id.`
        }
      ];
    })
  );

  return uniqueBy(relations, (relation) => `${relation.fromTable}.${relation.fromField}->${relation.toTable}.${relation.toField}`);
}

function generateBusinessLogic(design: SystemDesign) {
  const logic = [...design.flows];

  if (design.features.includes("premium") && !design.features.includes("payments")) {
    logic.push("Premium plans are tracked locally without invoking an external payment processor.");
  }

  if (design.features.includes("payments")) {
    logic.push("Payment-related pages model billing intent without requiring a live payment service.");
  }

  if (design.features.includes("alerts")) {
    logic.push("Alert rules can be evaluated from table fields such as stock, status, or due dates.");
  }

  return logic;
}

export function generateSchemas(design: SystemDesign): AppConfig {
  const tables: DatabaseTable[] = uniqueBy(
    design.entities.map((entity) => ({
      name: entity.name,
      fields: entity.fields
    })),
    (table) => table.name
  );
  const relations = generateRelations(tables);
  const endpoints = generateEndpoints(tables, design);
  const pages = generatePages(design);
  const hasProtectedPage = pages.some((page) => page.requiredRole !== "public");
  const hasAuth = design.features.includes("login") || hasProtectedPage;
  const providers: Array<"email_password"> = hasAuth ? ["email_password"] : [];

  return {
    app: design.app,
    assumptions: design.assumptions,
    roles: design.roles,
    database: {
      tables,
      relations
    },
    api: {
      endpoints
    },
    ui: {
      pages
    },
    auth: {
      providers,
      permissions: generatePermissions(design, tables)
    },
    businessLogic: generateBusinessLogic(design),
    validationReport: {
      valid: false,
      errors: [],
      warnings: [],
      repairAttempts: 0
    }
  };
}
