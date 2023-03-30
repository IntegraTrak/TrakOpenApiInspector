import { Select } from "flowbite-react";
import { OpenAPIV3 } from "openapi-types";
import { useContext } from "react";
import { OpenApiContextType } from "../@types/openapistate";
import { loadApiAsync } from "../utility/OpenApiUtils";
import { OpenApiContext } from "./OpenApiContext";

interface OpenApiDefinitionHistoryProps {
  onApiSelect: (definition: OpenAPIV3.Document | undefined) => void;
}

export default function OpenApiDefinitionHistory({ onApiSelect }: OpenApiDefinitionHistoryProps): JSX.Element {
  const { openApiState, saveOpenApiState } = useContext(OpenApiContext) as OpenApiContextType;
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
    const api = await loadApiAsync(definition, openApiState?.requestHeaders ?? undefined);
    if (api) {
      saveOpenApiState(api, api.getOperations());
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
