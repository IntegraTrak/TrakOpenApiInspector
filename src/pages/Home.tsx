import { Label, Textarea } from "flowbite-react";
import OpenAPIClientAxios, { AxiosHeaders, OpenAPIV3 } from "openapi-client-axios";
import { ChangeEvent, useContext } from "react";
import { OpenApiContextType } from "../@types/openapistate";
import { OpenApiContext } from "../components/OpenApiContext";
import OpenApiDefinition from "../components/OpenApiDefinition";
import TrakNavBar from "../components/TrakNavBar";

export default function Home() {
  const { openApiState, saveOpenApiState, saveOpenApiHeaders } = useContext(OpenApiContext) as OpenApiContextType;

  function handleLoadAPI(definition: string | OpenAPIV3.Document | undefined) {
    if (!definition) return;

    console.log(openApiState?.requestHeaders);

    const localApi = new OpenAPIClientAxios({
      definition,
      axiosConfigDefaults: {
        headers: openApiState?.requestHeaders,
      },
    });
    localApi.init().then(() => {
      console.log(localApi);
      saveOpenApiState(localApi, localApi.getOperations());
    });
  }

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    const authHeaderValue = e.target.value;
    const headers = new AxiosHeaders();
    headers.setAuthorization(authHeaderValue, true);
    saveOpenApiHeaders(headers);
  }

  return (
    <div className="App">
      <TrakNavBar />
      <OpenApiDefinition onHandleLoadApi={(def) => handleLoadAPI(def)} />

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="AuthHeader" value="Authorization Header" />
          </div>

          <Textarea
            id="AuthHeader"
            value={openApiState?.requestHeaders?.getAuthorization() ?? ""}
            placeholder="Auth..."
            required
            rows={4}
            onChange={(e) => onAuthHeaderChange(e)}
          />
        </div>
      </div>
    </div>
  );
}
