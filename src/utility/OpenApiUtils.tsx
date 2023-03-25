import { OpenAPIV3 } from "openapi-types";
import { Operation } from "openapi-client-axios";

type FieldDef = [string, OpenAPIV3.SchemaObject];
export type SchemaMap = Map<string, OpenAPIV3.SchemaObject>;

export function getResponseSchema(operation: Operation) {
  const response = operation.responses?.["200"];
  if (!response || !("content" in response)) return undefined;

  const mediaType = response.content && response.content["application/json"];
  if (!mediaType) return undefined;

  const schema = ("schema" in mediaType && mediaType.schema) as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  if (!schema || "$ref" in schema) return undefined;

  return schema;
}

export function getResponseProperties(operation: Operation): FieldDef[] {
  const schema = getResponseSchema(operation);
  if (!schema) return [];

  const properties = "items" in schema ? "properties" in schema.items && schema.items?.properties : schema?.properties;
  return Object.entries(properties ?? {}) as FieldDef[];
}

const getNestedSchemaProperties = (schema: OpenAPIV3.SchemaObject, prefix = "", seen = new WeakSet()): SchemaMap => {
  const propertiesMap: SchemaMap = new Map();

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, value]) => {
      if ("type" in value && value.type === "object" && value.properties) {
        if (seen.has(value)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore. This is a hack to get around the fact that the OpenAPIV3.SchemaObject type doesn't allow for circular references.
          propertiesMap.set(`${prefix}${key}`, { type: "object", circular: true });
        } else {
          seen.add(value);
          const nestedSchemaProperties = getNestedSchemaProperties(value, `${prefix}${key}.`, seen);
          [...nestedSchemaProperties].forEach(([nestedKey, nestedValue]) => {
            propertiesMap.set(`${nestedKey}`, nestedValue);
          });
        }
      } else if ("type" in value && value.type === "array" && "type" in value.items && value.items.type === "object") {
        if (seen.has(value)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore. This is a hack to get around the fact that the OpenAPIV3.SchemaObject type doesn't allow for circular references.
          propertiesMap.set(`${prefix}${key}`, { type: "array", items: { type: "object", circular: true } });
        } else if (!value.readOnly) {
          seen.add(value);
          const nestedSchemaProperties = getNestedSchemaProperties(value.items, "", seen);
          [...nestedSchemaProperties].forEach(([nestedKey, nestedValue]) => {
            propertiesMap.set(`${nestedKey}`, nestedValue);
          });
        }
      } else {
        propertiesMap.set(`${prefix}${key}`, "type" in value ? value : {});
      }
    });
  }

  return propertiesMap;
};

export const getSchemaProperties = (schema: OpenAPIV3.SchemaObject): SchemaMap => {
  const propertiesMap: SchemaMap = new Map();
  if (schema.type === "object") {
    const seen = new WeakSet();
    const replacer = (key: string, value: unknown) => {
      if (value && typeof value === "object") {
        if (seen.has(value)) {
          return { type: "object", circular: true };
        }
        seen.add(value);
      }
      return value;
    };
    const schemaString = JSON.stringify(schema, replacer);
    const parsedSchema = JSON.parse(schemaString);
    return getNestedSchemaProperties(parsedSchema);
  }
  if (schema.type === "array" && "type" in schema.items && schema.items?.type === "object") {
    const seen = new WeakSet();
    const replacer = (key: string, value: unknown) => {
      if (value && typeof value === "object") {
        if (seen.has(value)) {
          return { type: "object", circular: true };
        }
        seen.add(value);
      }
      return value;
    };
    const schemaString = JSON.stringify(schema.items, replacer);
    const parsedSchema = JSON.parse(schemaString);
    return getNestedSchemaProperties(parsedSchema, "");
  }
  return propertiesMap;
};
