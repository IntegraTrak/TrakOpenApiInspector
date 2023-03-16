import { Select, Table } from "flowbite-react";
import { OpenAPIV3 } from "openapi-client-axios";
import { TableColumn } from "./CsvDataTable";

interface MapRequestFieldsTableProps {
  selectedOperatorRequestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
  columns: TableColumn[];
  getRequestFieldsMap: () => Map<string, HTMLSelectElement>;
}

export default function MapRequestFieldsTable({
  selectedOperatorRequestBody,
  columns,
  getRequestFieldsMap,
}: MapRequestFieldsTableProps) {
  function getSelectedOperationRequestProperties(): [string, unknown][] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const schema = selectedOperatorRequestBody.content?.["application/json"]?.schema;
    const properties = schema?.properties ?? {};
    return Object.entries(properties);
  }

  function getPropertyOption(property: any, prefix = ""): JSX.Element {
    if (property[1].type !== "object") {
      const propertyValue = `${prefix}${property[0]}`;
      return (
        <option key={propertyValue} value={propertyValue}>
          {propertyValue}
        </option>
      );
    }
    return (
      <>
        {Object.entries(property[1].properties)
          .filter((subProperty: any) => !subProperty[1].readOnly)
          .map((subProperty) => getPropertyOption(subProperty, `${prefix + property[0]}.`))}
      </>
    );
  }

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Import Field</Table.HeadCell>
        <Table.HeadCell>Request Field</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {columns?.map(
          (
            column, // eslint-disable-next-line react/jsx-key
          ) => (
            // eslint-disable-next-line react/jsx-key
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>{column.Header}</Table.Cell>
              <Table.Cell>
                <Select
                  key={column.Header}
                  ref={(node) => {
                    const map = getRequestFieldsMap();

                    if (node) {
                      map.set(column.Header, node);
                    } else {
                      map.delete(column.Header);
                    }
                  }}
                >
                  <option>Skip</option>
                  {getSelectedOperationRequestProperties()
                    .filter((property: any) => !property[1].readOnly)
                    .map((property: any) => getPropertyOption(property))}
                </Select>
              </Table.Cell>
            </Table.Row>
          ),
        )}
      </Table.Body>
    </Table>
  );
}
