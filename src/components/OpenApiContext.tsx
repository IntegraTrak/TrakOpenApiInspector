import OpenAPIClientAxios, { AxiosRequestHeaders, Operation } from "openapi-client-axios";
import { createContext, useState } from "react";
import { IOpenApiState, OpenApiContextType } from "../@types/openapistate";

export const OpenApiContext = createContext<OpenApiContextType | null>(null);

export default function OpenApiContextProvider({ children }: { children: React.ReactNode }) {
  const [openApiState, setOpenApiState] = useState<IOpenApiState | undefined>();

  const saveOpenApiState = (api: OpenAPIClientAxios, operators: Operation[]) => {
    setOpenApiState((prevState) => {
      return { ...prevState, api, operators };
    });
  };

  const saveOpenApiHeaders = (requestHeaders: AxiosRequestHeaders) => {
    console.log(requestHeaders);
    console.log(openApiState);
    setOpenApiState((prevState) => {
      return { ...prevState, requestHeaders };
    });
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <OpenApiContext.Provider value={{ openApiState, saveOpenApiState, saveOpenApiHeaders }}>
      {children}
    </OpenApiContext.Provider>
  );
}
