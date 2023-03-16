import { useRef } from "react";

import { TextInput, Label, Button, Textarea } from "flowbite-react";

import { OpenAPIV3 } from "openapi-types";

interface OpenApiDefinitionProps {
  onHandleLoadApi: (definition: string | OpenAPIV3.Document) => void;
}

export default function OpenApiDefinition({ onHandleLoadApi }: OpenApiDefinitionProps): JSX.Element {
  const refOpenApiUri = useRef<HTMLInputElement>(null);
  const refOpenApiDef = useRef<HTMLTextAreaElement>(null);

  function getApiDefinition() {
    let definition: string | OpenAPIV3.Document = refOpenApiUri!.current!.value;
    if (definition === "") {
      definition = JSON.parse(refOpenApiDef!.current!.value);
    }
    console.log(definition);
    return definition;
  }

  return (
    <div>
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <Label htmlFor="OpenApiUrl" value="OpenApi Url" className="bg-blue-100" />
          <TextInput
            ref={refOpenApiUri}
            id="OpenApiUrl"
            type="url"
            placeholder="https://api.trakstudios.com/v1/openapi.json"
          />
        </div>
        <div className="py-2 grow-0">
          <Button type="submit" onClick={() => onHandleLoadApi(getApiDefinition())}>
            Load API
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <Textarea ref={refOpenApiDef} id="OpenApiText" placeholder="Open Api Json..." rows={4} />
        </div>
      </div>
    </div>
  );
}
