import { Select, Table } from "flowbite-react";
import { OpenAPIV3 } from "openapi-client-axios";
import { TableColumn } from "./CsvDataTable";

interface MapParametersTableProps {
  selectedOperatorParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
  columns: TableColumn[];
  getParametersMap: () => Map<string, HTMLSelectElement>;
}

export default function MapParametersTable({
  selectedOperatorParameters,
  columns,
  getParametersMap,
}: MapParametersTableProps) {
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
            // eslint-disable-next-line react/jsx-key
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>
                <Select
                  key={parameter.name}
                  ref={(node) => {
                    const map = getParametersMap();

                    if (node) {
                      map.set(parameter.name, node);
                    } else {
                      map.delete(parameter.name);
                    }
                  }}
                >
                  <option aria-label="empty" />
                  {columns?.map(
                    (
                      column, // eslint-disable-next-line react/jsx-key
                    ) => (
                      // eslint-disable-next-line react/jsx-key
                      <option id={column.Header} value={column.Header}>
                        {column.Header}
                      </option>
                    ),
                  )}
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
