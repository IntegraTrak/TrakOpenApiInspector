import OpenAPIClientAxios, { AxiosHeaders, Operation } from "openapi-client-axios";

// @types.openapistates.ts
export interface IOpenApiState {
  api?: OpenAPIClientAxios;
  operators?: Operation[];
  requestHeaders?: AxiosHeaders;
}

export type OpenApiContextType = {
  openApiState?: IOpenApiState;
  saveOpenApiState: (api: OpenAPIClientAxios, operators: Operation[]) => void;
  saveOpenApiHeaders: (requestHeaders: AxiosHeaders) => void;
};
