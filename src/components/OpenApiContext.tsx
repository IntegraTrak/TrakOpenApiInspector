import { createContext, useState } from "react";
import { IOpenApiState, OpenApiContextType } from "../@types/openapistate";

export const OpenApiContext = createContext<OpenApiContextType | null>(null);

export default function OpenApiContextProvider({ children }: { children: React.ReactNode }) {
  const [openApiState, setOpenApiState] = useState<IOpenApiState | undefined>();

  const saveOpenApiState = (state: IOpenApiState) => {
    setOpenApiState(state);
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <OpenApiContext.Provider value={{ openApiState, saveOpenApiState }}>{children}</OpenApiContext.Provider>;
}
