import type { AppType, ExtractedIntent, Feature } from "@/lib/types";

const uniq = <T>(items: T[]) => Array.from(new Set(items));

const includesAny = (text: string, needles: string[]) =>
  needles.some((needle) => text.includes(needle));

const addFeature = (features: Feature[], feature: Feature) => {
  if (!features.includes(feature)) {
    features.push(feature);
  }
};

const addIfMentioned = (text: string, entities: string[], entity: string, needles: string[]) => {
  if (includesAny(text, needles)) {
    entities.push(entity);
  }
};

function detectAppType(text: string): AppType {
  if (includesAny(text, ["crm", "contacts", "leads"])) {
    return "crm";
  }

  if (includesAny(text, ["ecommerce", "e-commerce", "store", "cart", "seller", "orders"])) {
    return "ecommerce";
  }

  if (includesAny(text, ["learning", "courses", "students", "teachers", "progress"])) {
    return "learning_platform";
  }

  if (includesAny(text, ["task manager", "tasks", "projects", "teams"])) {
    return "task_manager";
  }

  if (includesAny(text, ["finance", "transactions", "budgets", "invoices"])) {
    return "finance_app";
  }

  return "custom_app";
}

function defaultEntitiesFor(appType: AppType): string[] {
  switch (appType) {
    case "crm":
      return ["users", "contacts"];
    case "ecommerce":
      return ["users", "products", "orders"];
    case "learning_platform":
      return ["users", "courses", "students", "progress"];
    case "task_manager":
      return ["users", "projects", "tasks"];
    case "finance_app":
      return ["users", "transactions", "budgets"];
    default:
      return ["users", "records"];
  }
}

export function extractIntent(prompt: string): ExtractedIntent {
  const text = prompt.toLowerCase();
  const explicitNoLogin = includesAny(text, ["no login", "without login", "no auth", "without authentication"]);
  const appType = detectAppType(text);
  const features: Feature[] = [];
  const entities: string[] = [];
  const roles: string[] = [];
  const vagueRequirements: string[] = [];
  const conflicts: string[] = [];
  const assumptions: string[] = [];
  const safetyNotes: string[] = [];

  if (!explicitNoLogin && includesAny(text, ["login", "auth", "sign in", "user login", "private", "protected"])) {
    addFeature(features, "login");
  }

  if (includesAny(text, ["dashboard", "panel", "portal"])) {
    addFeature(features, "dashboard");
  }

  if (includesAny(text, ["analytics", "reports", "reporting", "insights"])) {
    addFeature(features, "analytics");
  }

  if (includesAny(text, ["payment", "payments", "billing", "checkout", "subscription"])) {
    addFeature(features, "payments");
  }

  if (includesAny(text, ["premium", "plan", "plans", "subscription", "membership"])) {
    addFeature(features, "premium");
  }

  if (includesAny(text, ["role-based", "role based", "roles", "admin", "manager", "seller", "teacher", "agent"])) {
    addFeature(features, "role_based_access");
  }

  if (includesAny(text, ["crud", "manage", "management", "contacts", "products", "orders", "tasks", "projects"])) {
    addFeature(features, "crud");
  }

  if (includesAny(text, ["admin panel", "admin approval", "admin-only", "admins can"])) {
    addFeature(features, "admin_panel");
  }

  if (text.includes("cart")) {
    addFeature(features, "cart");
  }

  if (includesAny(text, ["appointment", "booking", "bookings", "slots"])) {
    addFeature(features, "booking");
  }

  if (includesAny(text, ["alerts", "stock alerts", "notifications"])) {
    addFeature(features, "alerts");
  }

  if (includesAny(text, ["approval", "approve"])) {
    addFeature(features, "approval");
  }

  addIfMentioned(text, entities, "users", ["users", "user login", "login", "auth"]);
  addIfMentioned(text, entities, "contacts", ["contacts", "crm", "leads"]);
  addIfMentioned(text, entities, "products", ["products", "inventory", "store"]);
  addIfMentioned(text, entities, "orders", ["orders", "checkout"]);
  addIfMentioned(text, entities, "invoices", ["invoices"]);
  addIfMentioned(text, entities, "tasks", ["tasks"]);
  addIfMentioned(text, entities, "projects", ["projects"]);
  addIfMentioned(text, entities, "courses", ["courses"]);
  addIfMentioned(text, entities, "students", ["students"]);
  addIfMentioned(text, entities, "teachers", ["teachers"]);
  addIfMentioned(text, entities, "progress", ["progress"]);
  addIfMentioned(text, entities, "transactions", ["transactions"]);
  addIfMentioned(text, entities, "budgets", ["budgets"]);
  addIfMentioned(text, entities, "customers", ["customers"]);
  addIfMentioned(text, entities, "slots", ["slots"]);
  addIfMentioned(text, entities, "bookings", ["bookings", "booking"]);
  addIfMentioned(text, entities, "suppliers", ["suppliers"]);
  addIfMentioned(text, entities, "tickets", ["tickets", "helpdesk"]);
  addIfMentioned(text, entities, "agents", ["agents"]);
  addIfMentioned(text, entities, "candidates", ["candidates"]);
  addIfMentioned(text, entities, "companies", ["companies"]);
  addIfMentioned(text, entities, "applications", ["applications"]);
  addIfMentioned(text, entities, "members", ["members"]);
  addIfMentioned(text, entities, "plans", ["plans", "premium", "membership"]);
  addIfMentioned(text, entities, "trainers", ["trainer", "trainers"]);
  addIfMentioned(text, entities, "teams", ["teams"]);

  if (features.includes("analytics")) {
    entities.push("analytics_events");
  }

  if (features.includes("payments") || features.includes("premium")) {
    entities.push("plans");
  }

  if (includesAny(text, ["admin", "admin-only", "admins"])) {
    roles.push("admin");
  }

  if (includesAny(text, ["manager", "teams"])) {
    roles.push("manager");
  }

  if (text.includes("seller")) {
    roles.push("seller");
  }

  if (includesAny(text, ["customer", "customers", "cart", "booking"])) {
    roles.push("customer");
  }

  if (includesAny(text, ["teacher", "teachers"])) {
    roles.push("teacher");
  }

  if (includesAny(text, ["student", "students"])) {
    roles.push("student");
  }

  if (includesAny(text, ["agent", "agents", "helpdesk"])) {
    roles.push("agent");
  }

  if (includesAny(text, ["candidate", "candidates"])) {
    roles.push("candidate");
  }

  if (includesAny(text, ["trainer", "trainers"])) {
    roles.push("trainer");
  }

  if (includesAny(text, ["user", "users", "login", "role-based", "role based"])) {
    roles.push("user");
  }

  if (prompt.trim().length < 28 || includesAny(text, ["something useful", "an app", "make app"])) {
    vagueRequirements.push("Prompt does not specify domain, core entities, or access rules.");
    assumptions.push("Defaulted to a simple records workflow with login, dashboard, and CRUD.");
    addFeature(features, "login");
    addFeature(features, "dashboard");
    addFeature(features, "crud");
  }

  if (explicitNoLogin && includesAny(text, ["admin", "private", "protected", "admin-only"])) {
    conflicts.push("Prompt asks for no login while also requiring protected/admin-only capabilities.");
    assumptions.push("Protected capabilities require email/password authentication in the final config.");
  }

  if (text.includes("no database") || text.includes("do not use database")) {
    conflicts.push("Prompt asks for no database, but executable CRUD/API/runtime preview requires persisted entities.");
    assumptions.push("A minimal database model is generated so APIs and pages can execute deterministically.");
  }

  if (includesAny(text, ["guests can access admin", "guest can access admin", "public admin"])) {
    conflicts.push("Prompt asks to expose admin capabilities publicly.");
    assumptions.push("Admin access is surfaced with a warning and can be tightened by changing requiredRole.");
  }

  if (text.includes("admin can do nothing") && text.includes("user can manage everything")) {
    conflicts.push("Role capability hierarchy is inverted compared with common access-control expectations.");
    assumptions.push("The config preserves the requested roles but flags access-control review in validation warnings.");
  }

  if (text.includes("premium plan but no payment") || text.includes("premium plan but no payments")) {
    conflicts.push("Premium plan is requested while payment processing is explicitly excluded.");
    assumptions.push("Plan management is modeled locally without requiring a payment provider.");
  }

  if (text.includes("public dashboard") && text.includes("private dashboard")) {
    conflicts.push("Prompt requests both public and private dashboards.");
    assumptions.push("Separate public and protected dashboard routes are generated.");
  }

  if (text.includes("delete all users automatically")) {
    safetyNotes.push("Destructive automation request detected: delete all users automatically.");
    assumptions.push("Destructive automation is documented but not wired as an executable business flow.");
  }

  const normalizedEntities = uniq([...defaultEntitiesFor(appType), ...entities]);
  const normalizedRoles = uniq(roles.length > 0 ? roles : ["user"]);

  if (!features.includes("dashboard")) {
    addFeature(features, "dashboard");
    assumptions.push("A dashboard page was added because the runtime requires an entry point.");
  }

  if (!explicitNoLogin && !features.includes("login")) {
    addFeature(features, "login");
    assumptions.push("Email/password login was added for protected app workflows.");
  }

  return {
    appType,
    promptSummary: prompt.trim(),
    features: uniq(features),
    entities: normalizedEntities,
    roles: normalizedRoles,
    vagueRequirements,
    conflicts,
    assumptions: uniq(assumptions),
    safetyNotes
  };
}
