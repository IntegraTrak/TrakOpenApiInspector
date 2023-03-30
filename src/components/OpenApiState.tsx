import OpenAPIClientAxios, { AxiosRequestHeaders, Operation } from "openapi-client-axios";
import { atom } from "jotai";

export const baseOpenApiAtom = atom<OpenAPIClientAxios | undefined>(undefined);
export const openApiAtom = atom(
  (get) => get(baseOpenApiAtom),
  (get, set, api: OpenAPIClientAxios) => {
    set(baseOpenApiAtom, api);
    const { title } = api.definition.info;
    localStorage.setItem(`apidef:${title}`, JSON.stringify(api.document));
  },
);
export const openApiOperationsAtom = atom<Operation[] | undefined>(
  (get) => get(baseOpenApiAtom)?.getOperations() ?? undefined,
);
export const openApiHeadersAtom = atom<AxiosRequestHeaders | undefined>(undefined);
