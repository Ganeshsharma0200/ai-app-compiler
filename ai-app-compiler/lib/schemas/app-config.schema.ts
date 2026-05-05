import { z } from "zod";

export const fieldTypeSchema = z.enum(["string", "number", "boolean", "date", "enum"]);
export const methodSchema = z.enum(["GET", "POST", "PUT", "DELETE"]);
export const permissionActionSchema = z.enum(["read", "create", "update", "delete"]);
export const relationTypeSchema = z.enum(["one_to_one", "one_to_many", "many_to_one", "many_to_many"]);
export const apiValidationSourceSchema = z.enum(["body", "query", "params", "response"]);
export const pageLayoutTypeSchema = z.enum(["auth", "dashboard", "crud", "analytics", "billing", "admin", "public"]);
export const pageNavigationSchema = z.enum(["none", "sidebar", "topbar"]);
export const pageDataDensitySchema = z.enum(["compact", "comfortable"]);

export const roleSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1)
  })
  .strict();

export const databaseFieldSchema = z
  .object({
    name: z.string().min(1),
    type: fieldTypeSchema,
    required: z.boolean()
  })
  .strict();

export const databaseTableSchema = z
  .object({
    name: z.string().min(1),
    fields: z.array(databaseFieldSchema).min(1)
  })
  .strict();

export const databaseRelationSchema = z
  .object({
    fromTable: z.string().min(1),
    fromField: z.string().min(1),
    toTable: z.string().min(1),
    toField: z.string().min(1),
    type: relationTypeSchema,
    description: z.string().min(1)
  })
  .strict();

export const apiValidationFieldSchema = z
  .object({
    name: z.string().min(1),
    type: fieldTypeSchema,
    required: z.boolean(),
    source: apiValidationSourceSchema
  })
  .strict();

export const apiEndpointValidationSchema = z
  .object({
    request: z.array(apiValidationFieldSchema),
    response: z.array(apiValidationFieldSchema).min(1)
  })
  .strict();

export const apiEndpointSchema = z
  .object({
    path: z.string().min(1).regex(/^\/api\/[a-z0-9-/]+$/),
    method: methodSchema,
    description: z.string().min(1),
    requiredRole: z.string().min(1),
    table: z.string().min(1),
    validation: apiEndpointValidationSchema
  })
  .strict();

export const uiLayoutSchema = z
  .object({
    type: pageLayoutTypeSchema,
    regions: z.array(z.string().min(1)).min(1),
    navigation: pageNavigationSchema,
    dataDensity: pageDataDensitySchema
  })
  .strict();

export const uiPageSchema = z
  .object({
    name: z.string().min(1),
    route: z.string().min(1).regex(/^\//),
    layout: uiLayoutSchema,
    components: z.array(z.string().min(1)),
    requiredRole: z.string().min(1),
    usesApi: z.array(z.string().min(1))
  })
  .strict();

export const permissionSchema = z
  .object({
    role: z.string().min(1),
    resource: z.string().min(1),
    actions: z.array(permissionActionSchema).min(1)
  })
  .strict();

export const validationReportSchema = z
  .object({
    valid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    repairAttempts: z.number().int().min(0).max(3)
  })
  .strict();

export const appConfigSchema = z
  .object({
    app: z
      .object({
        name: z.string().min(1),
        description: z.string().min(1)
      })
      .strict(),
    assumptions: z.array(z.string()),
    roles: z.array(roleSchema).min(1),
    database: z
      .object({
        tables: z.array(databaseTableSchema),
        relations: z.array(databaseRelationSchema)
      })
      .strict(),
    api: z
      .object({
        endpoints: z.array(apiEndpointSchema)
      })
      .strict(),
    ui: z
      .object({
        pages: z.array(uiPageSchema)
      })
      .strict(),
    auth: z
      .object({
        providers: z.array(z.literal("email_password")).max(1),
        permissions: z.array(permissionSchema)
      })
      .strict(),
    businessLogic: z.array(z.string()),
    validationReport: validationReportSchema
  })
  .strict();

export type AppConfigFromSchema = z.infer<typeof appConfigSchema>;
