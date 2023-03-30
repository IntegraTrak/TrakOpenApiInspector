import { Select, Table } from "flowbite-react";
import { OpenAPIV3 } from "openapi-client-axios";
import { TableColumn } from "./CsvDataTable";

type MapParametersTableProps = {
  selectedOperatorParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
  columns: TableColumn[];
  onParameterMappingChange: (field: string, requestField: string) => void;
};

export default function MapParametersTable({
  selectedOperatorParameters,
  columns,
  onParameterMappingChange,
}: MapParametersTableProps) {
  const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(event);
    const { id, value } = event.target;
    onParameterMappingChange(id, value);
  };

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Import Field</Table.HeadCell>
        <Table.HeadCell>Parameters</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {selectedOperatorParameters.map((parameter) => {
          if (!("name" in parameter)) return <div />;
          return (
            <Table.Row key={parameter.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>
                <Select key={parameter.name} id={parameter.name} onChange={handleFieldChange}>
                  <option aria-label="empty" />
                  {columns?.map((column) => (
                    <option key={column.Header} id={column.Header} value={column.Header}>
                      {column.Header}
                    </option>
                  ))}
                </Select>
              </Table.Cell>
              <Table.Cell>{parameter.name}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}
