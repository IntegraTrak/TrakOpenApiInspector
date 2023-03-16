import { Select, Table } from "flowbite-react";
import { OpenAPIV3 } from "openapi-client-axios";
import { TableColumn } from "./CsvDataTable";

type RequestBody = OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
type FieldDef = [string, OpenAPIV3.SchemaObject];

interface MapRequestFieldsTableProps {
  selectedOperatorRequestBody: RequestBody;
  columns: TableColumn[];
  getRequestFieldsMap: () => Map<string, HTMLSelectElement>;
}

export default function MapRequestFieldsTable(props: MapRequestFieldsTableProps) {
  const { selectedOperatorRequestBody, columns, getRequestFieldsMap } = props;

  function getSelectedOperationRequestProperties(): FieldDef[] {
    const schema = ("content" in selectedOperatorRequestBody &&
      selectedOperatorRequestBody.content?.["application/json"]?.schema) as OpenAPIV3.SchemaObject;
    const properties = schema?.properties ?? {};
    return Object.entries(properties) as FieldDef[];
  }

  function getPropertyOption(property: FieldDef, prefix = ""): JSX.Element {
    if (property[1].type !== "object") {
      const propertyValue = `${prefix}${property[0]}`;
      return (
        <option key={propertyValue} value={propertyValue}>
          {propertyValue}
        </option>
      );
    }

    const nestedProperties = property[1].properties as OpenAPIV3.SchemaObject;
    return (
      <>
        {Object.entries(nestedProperties)
          .filter((subProperty: FieldDef) => !subProperty[1].readOnly)
          .map((subProperty) => getPropertyOption(subProperty, `${prefix + property[0]}.`))}
      </>
    );
  }

  function handleRef(node: HTMLSelectElement | null, columnHeader: string): void {
    const map = getRequestFieldsMap();

    if (node) {
      map.set(columnHeader, node);
    } else {
      map.delete(columnHeader);
    }
  }

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Import Field</Table.HeadCell>
        <Table.HeadCell>Request Field</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {columns?.map((column) => (
          <Table.Row key={column.Header} className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>{column.Header}</Table.Cell>
            <Table.Cell>
              <Select ref={(node) => handleRef(node, column.Header)}>
                <option>Skip</option>
                {getSelectedOperationRequestProperties()
                  .filter((property: FieldDef) => !property[1].readOnly)
                  .map((property: FieldDef) => getPropertyOption(property))}
              </Select>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
