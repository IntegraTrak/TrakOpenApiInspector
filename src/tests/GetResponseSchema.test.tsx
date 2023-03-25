import { Operation } from "openapi-client-axios";
import { describe, it } from "vitest";

import { getResponseSchema } from "../utility/OpenApiUtils";

describe("getResponseSchema", () => {
  it("should return undefined if there is no response", () => {
    const operation = {
      responses: {},
    } as Operation;
    const result = getResponseSchema(operation);
    expect(result).toBe(undefined);
  });

  it("should return undefined if there is no content", () => {
    const operation = {
      responses: {
        "200": {},
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toBe(undefined);
  });

  it("should return undefined if there is no application/json content", () => {
    const operation = {
      responses: {
        "200": {
          content: {},
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toBe(undefined);
  });

  it("should return undefined if there is no schema", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {},
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toBe(undefined);
  });

  it("should return undefined if the schema is a reference", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SomeSchema",
              },
            },
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toBe(undefined);
  });

  it("should return the schema if it is not a reference", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toEqual({ type: "object" });
  });

  it("should return the schema if it is not a reference and is an array", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                },
              },
            },
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toEqual({ type: "array", items: { type: "object" } });
  });

  it("should return the schema if it is not a reference and is an array with a reference", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SomeSchema",
                },
              },
            },
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toEqual({ type: "array", items: { $ref: "#/components/schemas/SomeSchema" } });
  });

  it("should return the schema if it is not a reference and is an array with a reference and properties", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SomeSchema",
                  properties: {
                    someProperty: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toEqual({
      type: "array",
      items: { $ref: "#/components/schemas/SomeSchema", properties: { someProperty: { type: "string" } } },
    });
  });

  it("should return the schema if it is not a reference and is an array with and properties and items", () => {
    const operation = {
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  properties: {
                    someProperty: {
                      type: "string",
                    },
                  },
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as Operation;
    const result = getResponseSchema(operation);
    expect(result).toEqual({
      type: "array",
      items: {
        properties: {
          someProperty: {
            type: "string",
          },
        },
        items: {
          type: "string",
        },
      },
    });
  });
});
