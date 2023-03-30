import { Label, Textarea } from "flowbite-react";
import { AxiosHeaders, OpenAPIV3 } from "openapi-client-axios";
import { ChangeEvent } from "react";
import { useAtom } from "jotai";
import OpenApiDefinition from "../components/OpenApiDefinition";
import OpenApiDefinitionHistory from "../components/OpenApiDefinitionHistory";
import TrakNavBar from "../components/TrakNavBar";
import { loadApiAsync } from "../utility/OpenApiUtils";
import { openApiAtom, openApiHeadersAtom } from "../components/OpenApiState";

export default function Home() {
  const [, setApi] = useAtom(openApiAtom);
  const [requestHeaders, setRequestHeaders] = useAtom(openApiHeadersAtom);

  async function handleLoadAPI(definition: string | OpenAPIV3.Document | undefined) {
    if (!definition) return;
    const localApi = await loadApiAsync(definition, requestHeaders ?? undefined);
    if (localApi) {
      setApi(localApi);
    }
  }

  async function onApiSelect(definition: string | OpenAPIV3.Document | undefined) {
    console.log(definition);
  }

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    const authHeaderValue = e.target.value;
    const headers = new AxiosHeaders();
    headers.setAuthorization(authHeaderValue, true);
    setRequestHeaders(headers);
  }

  return (
    <div className="App">
      <TrakNavBar />
      <OpenApiDefinitionHistory onApiSelect={(def) => onApiSelect(def)} />
      <OpenApiDefinition onHandleLoadApi={(def) => handleLoadAPI(def)} />

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="AuthHeader" value="Authorization Header" />
          </div>

          <Textarea
            id="AuthHeader"
            value={requestHeaders?.getAuthorization() ?? ""}
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
