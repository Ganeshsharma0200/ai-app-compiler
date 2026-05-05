import type {
  DatabaseField,
  DesignEntity,
  DesignPage,
  ExtractedIntent,
  Feature,
  Role,
  SystemDesign
} from "@/lib/types";

const titleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const routeFor = (name: string) => `/${name.replace(/_/g, "-")}`;

const defaultFields = (entity: string): DatabaseField[] => {
  const base: DatabaseField[] = [
    { name: "id", type: "string", required: true },
    { name: "title", type: "string", required: true },
    { name: "description", type: "string", required: false },
    { name: "createdAt", type: "date", required: true }
  ];

  const fieldMap: Record<string, DatabaseField[]> = {
    users: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "role", type: "enum", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    contacts: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: false },
      { name: "company", type: "string", required: false },
      { name: "ownerId", type: "string", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    products: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "price", type: "number", required: true },
      { name: "stock", type: "number", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    orders: [
      { name: "id", type: "string", required: true },
      { name: "customerId", type: "string", required: true },
      { name: "status", type: "enum", required: true },
      { name: "total", type: "number", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    invoices: [
      { name: "id", type: "string", required: true },
      { name: "customerId", type: "string", required: true },
      { name: "amount", type: "number", required: true },
      { name: "dueDate", type: "date", required: true },
      { name: "paid", type: "boolean", required: true }
    ],
    projects: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "ownerId", type: "string", required: true },
      { name: "status", type: "enum", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    tasks: [
      { name: "id", type: "string", required: true },
      { name: "projectId", type: "string", required: true },
      { name: "title", type: "string", required: true },
      { name: "status", type: "enum", required: true },
      { name: "dueDate", type: "date", required: false }
    ],
    courses: [
      { name: "id", type: "string", required: true },
      { name: "title", type: "string", required: true },
      { name: "teacherId", type: "string", required: true },
      { name: "level", type: "enum", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    students: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "active", type: "boolean", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    teachers: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "specialty", type: "string", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    progress: [
      { name: "id", type: "string", required: true },
      { name: "studentId", type: "string", required: true },
      { name: "courseId", type: "string", required: true },
      { name: "percentComplete", type: "number", required: true },
      { name: "updatedAt", type: "date", required: true }
    ],
    transactions: [
      { name: "id", type: "string", required: true },
      { name: "userId", type: "string", required: true },
      { name: "amount", type: "number", required: true },
      { name: "category", type: "string", required: true },
      { name: "postedAt", type: "date", required: true }
    ],
    budgets: [
      { name: "id", type: "string", required: true },
      { name: "userId", type: "string", required: true },
      { name: "category", type: "string", required: true },
      { name: "limit", type: "number", required: true },
      { name: "active", type: "boolean", required: true }
    ],
    customers: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "phone", type: "string", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    slots: [
      { name: "id", type: "string", required: true },
      { name: "startsAt", type: "date", required: true },
      { name: "endsAt", type: "date", required: true },
      { name: "available", type: "boolean", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    bookings: [
      { name: "id", type: "string", required: true },
      { name: "customerId", type: "string", required: true },
      { name: "slotId", type: "string", required: true },
      { name: "status", type: "enum", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    suppliers: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: false },
      { name: "leadTimeDays", type: "number", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    tickets: [
      { name: "id", type: "string", required: true },
      { name: "subject", type: "string", required: true },
      { name: "priority", type: "enum", required: true },
      { name: "status", type: "enum", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    agents: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "queue", type: "string", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    candidates: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "status", type: "enum", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    companies: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "industry", type: "string", required: false },
      { name: "approved", type: "boolean", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    applications: [
      { name: "id", type: "string", required: true },
      { name: "candidateId", type: "string", required: true },
      { name: "companyId", type: "string", required: true },
      { name: "status", type: "enum", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    members: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "planId", type: "string", required: false },
      { name: "joinedAt", type: "date", required: true }
    ],
    trainers: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "specialty", type: "string", required: false },
      { name: "createdAt", type: "date", required: true }
    ],
    teams: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "managerId", type: "string", required: true },
      { name: "active", type: "boolean", required: true },
      { name: "createdAt", type: "date", required: true }
    ],
    plans: [
      { name: "id", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "price", type: "number", required: true },
      { name: "interval", type: "enum", required: true },
      { name: "active", type: "boolean", required: true }
    ],
    analytics_events: [
      { name: "id", type: "string", required: true },
      { name: "eventName", type: "string", required: true },
      { name: "actorId", type: "string", required: false },
      { name: "value", type: "number", required: false },
      { name: "createdAt", type: "date", required: true }
    ]
  };

  return fieldMap[entity] ?? base;
};

function appNameFor(intent: ExtractedIntent) {
  const names = {
    crm: "CRM Command Center",
    ecommerce: "Commerce Operations Hub",
    learning_platform: "Learning Platform Console",
    task_manager: "Team Task Manager",
    finance_app: "Finance Insight Tracker",
    custom_app: "Custom Workflow App"
  };

  return names[intent.appType];
}

function roleDescription(role: string) {
  const descriptions: Record<string, string> = {
    admin: "Owns platform governance, analytics, and high-risk actions.",
    manager: "Coordinates team workflows and reviews operational records.",
    seller: "Manages catalog, orders, and selling workflows.",
    customer: "Uses self-service workflows and manages personal records.",
    teacher: "Manages courses and reviews learner progress.",
    student: "Consumes course content and tracks progress.",
    agent: "Handles support queues and ticket updates.",
    candidate: "Manages profile and job applications.",
    trainer: "Manages member sessions and training activity.",
    user: "Uses protected application workflows."
  };

  return descriptions[role] ?? `Custom role for ${titleCase(role)} workflows.`;
}

function requiredRoleForEntity(entity: string, roles: string[]) {
  if (["users", "analytics_events", "companies"].includes(entity) && roles.includes("admin")) {
    return "admin";
  }

  if (["products", "orders"].includes(entity) && roles.includes("seller")) {
    return "seller";
  }

  if (["courses", "progress"].includes(entity) && roles.includes("teacher")) {
    return "teacher";
  }

  if (["tickets", "agents"].includes(entity) && roles.includes("agent")) {
    return "agent";
  }

  if (["members", "trainers"].includes(entity) && roles.includes("trainer")) {
    return "trainer";
  }

  if (roles.includes("manager")) {
    return "manager";
  }

  return roles.includes("user") ? "user" : roles[0];
}

const entityPageComponents = (entity: string) => {
  if (entity === "analytics_events") {
    return ["Header", "Sidebar", "MetricGrid", "TrendChart"];
  }

  return ["Header", "Sidebar", "FilterBar", "DataTable", "DetailDrawer"];
};

function buildPages(intent: ExtractedIntent): DesignPage[] {
  const pages: DesignPage[] = [];
  const roles = intent.roles;
  const defaultRole = roles.includes("user") ? "user" : roles[0];

  if (intent.features.includes("login")) {
    pages.push({
      name: "Login",
      route: "/login",
      components: ["AuthForm", "ProviderStatus"],
      requiredRole: "public",
      usesEntities: []
    });
  }

  if (intent.conflicts.some((conflict) => conflict.includes("public and private dashboards"))) {
    pages.push({
      name: "Public Dashboard",
      route: "/dashboard/public",
      components: ["Header", "OverviewStats", "FeatureHighlights"],
      requiredRole: "public",
      usesEntities: []
    });
  }

  pages.push({
    name: "Dashboard",
    route: "/dashboard",
    components: ["Header", "Sidebar", "MetricGrid", "ActivityFeed"],
    requiredRole: defaultRole,
    usesEntities: intent.entities.filter((entity) => entity !== "users").slice(0, 3)
  });

  if (intent.features.includes("admin_panel")) {
    pages.push({
      name: "Admin",
      route: "/admin",
      components: ["Header", "Sidebar", "RoleMatrix", "AuditLog"],
      requiredRole: intent.conflicts.some((conflict) => conflict.includes("admin capabilities publicly"))
        ? "public"
        : "admin",
      usesEntities: ["users"]
    });
  }

  if (intent.features.includes("analytics")) {
    pages.push({
      name: "Analytics",
      route: "/analytics",
      components: ["Header", "Sidebar", "MetricGrid", "TrendChart"],
      requiredRole: roles.includes("admin") ? "admin" : defaultRole,
      usesEntities: ["analytics_events"]
    });
  }

  if (intent.features.includes("payments") || intent.features.includes("premium")) {
    pages.push({
      name: "Billing",
      route: "/billing",
      components: ["Header", "Sidebar", "PlanSelector", "InvoiceList"],
      requiredRole: roles.includes("customer") ? "customer" : defaultRole,
      usesEntities: ["plans"]
    });
  }

  if (intent.features.includes("cart")) {
    pages.push({
      name: "Cart",
      route: "/cart",
      components: ["Header", "CartItems", "CheckoutSummary"],
      requiredRole: roles.includes("customer") ? "customer" : defaultRole,
      usesEntities: ["products", "orders"]
    });
  }

  intent.entities
    .filter((entity) => !["analytics_events", "plans"].includes(entity))
    .forEach((entity) => {
      if (entity === "users" && !roles.includes("admin")) {
        return;
      }

      const name = titleCase(entity);
      const route = routeFor(entity);
      const exists = pages.some((page) => page.route === route);

      if (!exists) {
        pages.push({
          name,
          route,
          components: entityPageComponents(entity),
          requiredRole: requiredRoleForEntity(entity, roles),
          usesEntities: [entity]
        });
      }
    });

  return pages;
}

function buildFlows(intent: ExtractedIntent): string[] {
  const flows: string[] = [];

  if (intent.features.includes("login")) {
    flows.push("Users authenticate with email/password before protected workflows.");
  }

  if (intent.features.includes("crud")) {
    flows.push("Core entities support deterministic CRUD-style list and create operations.");
  }

  if (intent.features.includes("role_based_access")) {
    flows.push("Role-based access maps pages, endpoints, and permissions across layers.");
  }

  if (intent.features.includes("analytics")) {
    flows.push("Analytics aggregates activity events into admin-facing reporting views.");
  }

  if (intent.features.includes("payments") || intent.features.includes("premium")) {
    flows.push("Premium plan and billing workflows are represented without external payment services.");
  }

  if (intent.features.includes("booking")) {
    flows.push("Customers can reserve available slots and admins can review bookings.");
  }

  if (intent.features.includes("alerts")) {
    flows.push("Operational alerts are represented as dashboard warnings for records that need attention.");
  }

  if (intent.features.includes("approval")) {
    flows.push("Approval flows gate sensitive records before they become visible to end users.");
  }

  intent.conflicts.forEach((conflict) => flows.push(`Conflict captured for review: ${conflict}`));
  intent.safetyNotes.forEach((note) => flows.push(`Safety note: ${note}`));

  return flows.length > 0 ? flows : ["A default authenticated CRUD workflow is generated for the requested idea."];
}

export function designSystem(intent: ExtractedIntent): SystemDesign {
  const normalizedRoles = intent.roles.includes("user") ? intent.roles : [...intent.roles, "user"];
  const roles: Role[] = normalizedRoles.map((role) => ({
    name: role,
    description: roleDescription(role)
  }));
  const entities: DesignEntity[] = intent.entities.map((entity) => ({
    name: entity,
    fields: defaultFields(entity),
    description: `${titleCase(entity)} data model used by pages, APIs, and runtime preview.`
  }));
  const features = intent.features;
  const featureSummary = features.map((feature: Feature) => feature.replace(/_/g, " ")).join(", ");

  return {
    app: {
      name: appNameFor(intent),
      description: `A deterministic ${titleCase(intent.appType)} configuration with ${featureSummary || "core"} capabilities.`
    },
    appType: intent.appType,
    features,
    roles,
    pages: buildPages({ ...intent, roles: normalizedRoles }),
    entities,
    flows: buildFlows(intent),
    assumptions: intent.assumptions,
    conflicts: intent.conflicts,
    safetyNotes: intent.safetyNotes
  };
}
