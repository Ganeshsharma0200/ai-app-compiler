export type AppType =
  | "crm"
  | "ecommerce"
  | "learning_platform"
  | "task_manager"
  | "finance_app"
  | "custom_app";

export type Feature =
  | "login"
  | "dashboard"
  | "analytics"
  | "payments"
  | "premium"
  | "role_based_access"
  | "crud"
  | "admin_panel"
  | "cart"
  | "booking"
  | "alerts"
  | "approval";

export type FieldType = "string" | "number" | "boolean" | "date" | "enum";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type PermissionAction = "read" | "create" | "update" | "delete";
export type RelationType = "one_to_one" | "one_to_many" | "many_to_one" | "many_to_many";
export type ApiValidationSource = "body" | "query" | "params" | "response";
export type PageLayoutType = "auth" | "dashboard" | "crud" | "analytics" | "billing" | "admin" | "public";
export type PageNavigation = "none" | "sidebar" | "topbar";
export type PageDataDensity = "compact" | "comfortable";

export interface Role {
  name: string;
  description: string;
}

export interface DatabaseField {
  name: string;
  type: FieldType;
  required: boolean;
}

export interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
}

export interface DatabaseRelation {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  type: RelationType;
  description: string;
}

export interface ApiValidationField {
  name: string;
  type: FieldType;
  required: boolean;
  source: ApiValidationSource;
}

export interface ApiEndpointValidation {
  request: ApiValidationField[];
  response: ApiValidationField[];
}

export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  description: string;
  requiredRole: string;
  table: string;
  validation: ApiEndpointValidation;
}

export interface UiLayout {
  type: PageLayoutType;
  regions: string[];
  navigation: PageNavigation;
  dataDensity: PageDataDensity;
}

export interface UiPage {
  name: string;
  route: string;
  layout: UiLayout;
  components: string[];
  requiredRole: string;
  usesApi: string[];
}

export interface Permission {
  role: string;
  resource: string;
  actions: PermissionAction[];
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  repairAttempts: number;
}

export interface AppConfig {
  app: {
    name: string;
    description: string;
  };
  assumptions: string[];
  roles: Role[];
  database: {
    tables: DatabaseTable[];
    relations: DatabaseRelation[];
  };
  api: {
    endpoints: ApiEndpoint[];
  };
  ui: {
    pages: UiPage[];
  };
  auth: {
    providers: Array<"email_password">;
    permissions: Permission[];
  };
  businessLogic: string[];
  validationReport: ValidationReport;
}

export interface ExtractedIntent {
  appType: AppType;
  promptSummary: string;
  features: Feature[];
  entities: string[];
  roles: string[];
  vagueRequirements: string[];
  conflicts: string[];
  assumptions: string[];
  safetyNotes: string[];
}

export interface DesignEntity {
  name: string;
  fields: DatabaseField[];
  description: string;
}

export interface DesignPage {
  name: string;
  route: string;
  components: string[];
  requiredRole: string;
  usesEntities: string[];
}

export interface SystemDesign {
  app: {
    name: string;
    description: string;
  };
  appType: AppType;
  features: Feature[];
  roles: Role[];
  pages: DesignPage[];
  entities: DesignEntity[];
  flows: string[];
  assumptions: string[];
  conflicts: string[];
  safetyNotes: string[];
}

export interface StageResult {
  stage: string;
  output: unknown;
}

export interface RuntimePage {
  route: string;
  title: string;
  layout: UiLayout;
  components: string[];
  connectedApis: string[];
}

export interface RuntimeApiMap {
  method: HttpMethod;
  path: string;
  table: string;
  requestFields: string[];
  responseFields: string[];
  executable: boolean;
}

export interface RuntimeDatabaseMap {
  table: string;
  fields: string[];
}

export interface RuntimeRelationMap {
  from: string;
  to: string;
  type: RelationType;
  executable: boolean;
}

export interface RuntimePermissionMatrix {
  role: string;
  pages: string[];
  endpoints: string[];
}

export interface RuntimeSimulation {
  pages: RuntimePage[];
  apiMap: RuntimeApiMap[];
  databaseMap: RuntimeDatabaseMap[];
  relationMap: RuntimeRelationMap[];
  permissionMatrix: RuntimePermissionMatrix[];
  executable: boolean;
  issues: string[];
}

export interface RepairLog {
  attempt: number;
  action: string;
  detail: string;
}

export interface CompileMetrics {
  success: boolean;
  latencyMs: number;
  repairAttempts: number;
  errorCount: number;
  warningCount: number;
}

export interface CompileResult {
  prompt: string;
  stages: StageResult[];
  config: AppConfig;
  runtime: RuntimeSimulation;
  metrics: CompileMetrics;
}

export interface EvaluationPrompt {
  id: number;
  category: "normal" | "edge";
  prompt: string;
}

export interface EvaluationRow {
  id: number;
  category: "normal" | "edge";
  prompt: string;
  status: "success" | "fail";
  repairAttempts: number;
  errors: string[];
  warnings: string[];
  latencyMs: number;
}

export interface EvaluationSummary {
  totalPrompts: number;
  successRate: number;
  averageRepairAttempts: number;
  averageLatencyMs: number;
  commonFailureTypes: string[];
}

export interface EvaluationResult {
  rows: EvaluationRow[];
  summary: EvaluationSummary;
}
