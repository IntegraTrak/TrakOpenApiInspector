import { useRef } from "react";

import {
  TextInput,
  Label,
  Button,
  Textarea,
  Select,
  Table,
} from "flowbite-react";

import { OpenAPIClientAxios, Operation } from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";

export default function OpenApiDefinition({ onOperationsSet }) {
  const refOpenApiUri = useRef<HTMLInputElement>(null);
  const refOpenApiDef = useRef<HTMLTextAreaElement>(null);

  function handleLoadAPI() {
    const api = new OpenAPIClientAxios({
      definition: getApiDefinition(),
    });
    api.init().then(() => {
      console.log(api);
      console.log(onOperationsSet);

      onOperationsSet(api.getOperations());
    });
  }

  function getApiDefinition() {
    let definition: string | OpenAPIV3.Document = refOpenApiUri!.current!.value;
    if (definition == "") {
      definition = JSON.parse(refOpenApiDef!.current!.value);
    }
    return definition;
  }

  return (
    <div>
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <Label
            htmlFor="OpenApiUrl"
            value="OpenApi Url"
            className="bg-blue-100"
          />
          <TextInput
            ref={refOpenApiUri}
            id="OpenApiUrl"
            type="url"
            placeholder="https://api.trakstudios.com/v1/openapi.json"
          />
        </div>
        <div className="py-2 grow-0">
          <Button type="submit" onClick={() => handleLoadAPI()}>
            Load API
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <Textarea
            ref={refOpenApiDef}
            id="OpenApiText"
            placeholder="Open Api Json..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
