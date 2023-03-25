import { Table, TextInput } from "flowbite-react";
import { OpenAPIV3 } from "openapi-types";

interface QueryParametersProps {
  selectedOperatorParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
  parameterValues: { [key: string]: string };
  onParameterValuesChange: (parameterValues: { [key: string]: string }) => void;
}

export default function QueryParameters({
  selectedOperatorParameters,
  parameterValues,
  onParameterValuesChange,
}: QueryParametersProps) {
  const handleParameterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    const newParameterValues = { ...parameterValues, [id]: value };
    onParameterValuesChange(newParameterValues);
  };

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Parameters</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {selectedOperatorParameters.map((parameter) => {
          if (!("name" in parameter)) return <div />;
          return (
            <Table.Row key={parameter.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>
                <TextInput
                  id={parameter.name}
                  type="text"
                  placeholder={parameter.name}
                  required
                  value={parameterValues[parameter.name] || ""}
                  onChange={handleParameterValueChange}
                />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}
