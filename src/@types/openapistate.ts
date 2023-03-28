import OpenAPIClientAxios, { Operation } from "openapi-client-axios";

// @types.openapistates.ts
export interface IOpenApiState {
  api: OpenAPIClientAxios;
  operators: Operation[];
}

export type OpenApiContextType = {
  openApiState: IOpenApiState | undefined;
  saveOpenApiState: (openApiState: IOpenApiState) => void;
};
