import { Table, Checkbox, Label } from "flowbite-react";
import { OpenAPIV3 } from "openapi-types";

type SchemaMap = Map<string, OpenAPIV3.SchemaObject>;

type SelectRequestFieldsProps = {
  schemaMap: SchemaMap;
  selectedFields: Map<string, boolean>;
  onFieldChange: (field: string, checked: boolean) => void;
};

export default function SelectRequestFields({ schemaMap, selectedFields, onFieldChange }: SelectRequestFieldsProps) {
  if (!schemaMap) {
    return <div>No schema provided</div>;
  }

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    onFieldChange(id, checked);
  };

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Response Fields</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {[...schemaMap.entries()].map(([key]) => (
          <Table.Row key={key} className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>
              <Checkbox id={key} checked={selectedFields.get(key)} onChange={handleFieldChange} />
              <Label htmlFor={key}>{key}</Label>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
