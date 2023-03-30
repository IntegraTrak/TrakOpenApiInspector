import { Select } from "flowbite-react";
import { OpenAPIV3 } from "openapi-types";
import { useAtom } from "jotai";
import { loadApiAsync } from "../utility/OpenApiUtils";
import { baseOpenApiAtom, openApiHeadersAtom } from "./OpenApiState";

type OpenApiDefinitionHistoryProps = {
  onApiSelect: (definition: OpenAPIV3.Document | undefined) => void;
};

export default function OpenApiDefinitionHistory({ onApiSelect }: OpenApiDefinitionHistoryProps): JSX.Element {
  const [, setApi] = useAtom(baseOpenApiAtom);
  const [requestHeaders] = useAtom(openApiHeadersAtom);

  const items = { ...localStorage };

  function getApiDefinition(selectedValue: string): OpenAPIV3.Document | undefined {
    const definition = JSON.parse(items[`apidef:${selectedValue}`]) as OpenAPIV3.Document;
    console.log(definition);
    return definition;
  }

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const definition = getApiDefinition(selectedValue);
    if (!definition) return;
    const localApi = await loadApiAsync(definition, requestHeaders);
    if (localApi) {
      setApi(localApi);
    }

    onApiSelect(definition);
  };

  return (
    <div>
      <Select onChange={handleChange}>
        <option key="1">Recent APIs...</option>
        {Object.keys(items)
          .filter((key) => key.startsWith("apidef:"))
          .map((key) => (
            <option key={key}>{key.replace(/^apidef:/, "")}</option>
          ))}
      </Select>
    </div>
  );
}
