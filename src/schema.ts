import { JSONSchema6, JSONSchema6Definition, JSONSchema6Type } from "./json-schema";
import { Maybe } from "./maybe";

export function EXAMPLE_VARIABLES_FROM_SCHEMA<T extends Record<string, any>>(
  schema?: JSONSchema6 | null,
  opts = { defaults: false },
): T {
  const variables: Record<string, any> = {};
  const properties = PROPERTIES_FROM_SCHEMA(schema);
  if (!properties) return variables as any;

  for (const [key, property] of Object.entries(properties)) {
    try {
      const value = EXAMPLE_FROM_PROPERTY(property, opts);
      if (IS_ALLOWED_VALUE(value)) {
        variables[key] = value;
      }
    } catch (err) {
      // debug("[EXAMPLE_VARIABLES_FROM_SCHEMA]: failed to use example value from '%s': %o, got: %o", key, property, err);
    }
  }
  return variables as any;
}

export function PROPERTIES_FROM_SCHEMA(schema: Maybe<JSONSchema6>): Record<string, JSONSchema6Definition> | null {
  return schema && schema.properties && typeof schema.properties === "object" ? schema.properties : null;
}

export function IS_ALLOWED_VALUE<T = any>(value: Maybe<T>): value is Exclude<T, null | undefined | ""> {
  // @ts-expect-error Yeah error
  return value !== undefined && value !== "" && value !== null;
}

/** Take `example` from JSON Schema property */
export function EXAMPLE_FROM_PROPERTY(
  property: JSONSchema6Definition,
  opts?: { defaults?: boolean },
): JSONSchema6Type | undefined {
  if (typeof property === "boolean") {
    return undefined;
  }
  // Handle cases where `examples` is not an array
  const examples = property["examples"] ?? [];
  const value = Array.isArray(examples) ? examples[0] : examples;
  if (IS_ALLOWED_VALUE(value)) {
    return value;
  } else if (opts && opts.defaults) {
    return DEFAULT_FROM_PROPERTY(property);
  } else {
    return undefined;
  }
}

export function DEFAULT_VARIABLES_FROM_SCHEMA<T extends Record<string, any>>(schema?: JSONSchema6 | null): T {
  const variables: Record<string, any> = {};
  const properties = PROPERTIES_FROM_SCHEMA(schema);
  if (!properties) return variables as any;
  for (const [key, property] of Object.entries(properties)) {
    try {
      const value = DEFAULT_FROM_PROPERTY(property);
      if (IS_ALLOWED_VALUE(value)) {
        variables[key] = value;
      }
    } catch (err) {
      // debug("[DEFAULT_VARIABLES_FROM_SCHEMA]: failed to use default value from '%s': %o, got: %o", key, property, err);
    }
  }
  return variables as any;
}

export function DEFAULT_FROM_PROPERTY(property: JSONSchema6Definition): JSONSchema6Type | undefined {
  if (typeof property === "boolean") {
    return undefined;
  }
  const value = property["default"];
  if (IS_ALLOWED_VALUE(value)) {
    return value;
  } else {
    return undefined;
  }
}
