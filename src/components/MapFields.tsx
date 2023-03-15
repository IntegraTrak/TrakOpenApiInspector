import { Fragment } from "react";
import { Button, Select, Table } from "flowbite-react";

import { Operation } from "openapi-client-axios";

interface MapFieldsProps {
  loading: boolean;
  selectedOperator: Operation | undefined;
  getParametersMap: () => Map<string, HTMLSelectElement>;
  columns: any[];
  getRequestFieldsMap: () => Map<string, HTMLSelectElement>;
  importData: () => void;
}

export default function MapFields({
  loading,
  selectedOperator,
  getParametersMap,
  columns,
  getRequestFieldsMap,
  importData,
}: MapFieldsProps) {
  function getSelectedOperationRequestProperties(): [string, unknown][] {
    const schema =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      selectedOperator?.requestBody?.content?.["application/json"]?.schema;
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
          .map((subProperty) =>
            getPropertyOption(subProperty, `${prefix + property[0]}.`),
          )}
      </>
    );
  }

  return (
    <>
      <div>
        {!loading && selectedOperator && selectedOperator.parameters && (
          <div>
            <Table>
              <Table.Head>
                <Table.HeadCell>Import Field</Table.HeadCell>
                <Table.HeadCell>Parameters</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {selectedOperator.parameters.map((parameter) => {
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
                          {columns?.map((column) => (
                            // eslint-disable-next-line react/jsx-key
                            <option id={column.Header} value={column.Header}>
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
          </div>
        )}
        {!loading && selectedOperator && selectedOperator.requestBody && (
          <div>
            <Table>
              <Table.Head>
                <Table.HeadCell>Import Field</Table.HeadCell>
                <Table.HeadCell>Request Field</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {columns?.map((column) => (
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
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-end items-end space-x-4">
        <div className="py-2 grow-0">
          <Button type="submit" onClick={() => importData()}>
            Import Data
          </Button>
        </div>
      </div>
    </>
  );
}
