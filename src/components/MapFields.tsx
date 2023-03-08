import { Fragment } from "react";
import { Button, Select, Table } from "flowbite-react";
import Papa from "papaparse";

import { OpenAPIClientAxios, Operation } from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";

interface MapFieldsProps {
  loading: boolean;
  selectedOperator: Operation | undefined;
  getParametersMap: () => Map<string, HTMLSelectElement>;
  columns: any[];
  getRequestFieldsMap: () => Map<string, HTMLSelectElement>;
  importData: () => void;
}

export function MapFields({
  loading,
  selectedOperator,
  getParametersMap,
  columns,
  getRequestFieldsMap,
  importData,
}: MapFieldsProps) {
  function getSelectedOperationRequestProperties() {
    if (
      selectedOperator &&
      selectedOperator.requestBody &&
      "content" in selectedOperator!.requestBody
    ) {
      let requestBodyContentJsonSchema =
        selectedOperator!.requestBody.content["application/json"].schema;
      // @ts-ignore
      return Object.entries(requestBodyContentJsonSchema.properties);
    } else return [];
  }

  function getPropertyOption(property: any, prefix: string = "") {
    if (property[1].type != "object") {
      let propertyValue = `${prefix}${property[0]}`;
      return (
        <option key={propertyValue} value={propertyValue}>
          {propertyValue}
        </option>
      );
    } else
      return (
        <Fragment>
          {Object.entries(property[1].properties)
            .filter((subProperty: any) => !subProperty[1].readOnly)
            .map((subProperty) =>
              getPropertyOption(subProperty, prefix + property[0] + ".")
            )}
        </Fragment>
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
                {selectedOperator.parameters.map((parameter) => (
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      <Select
                        key={
                          // @ts-ignore
                          parameter.name
                        }
                        ref={(node) => {
                          const map = getParametersMap();

                          if (node) {
                            // @ts-ignore
                            map.set(parameter.name, node);
                          } else {
                            // @ts-ignore
                            map.delete(parameter.name);
                          }
                        }}
                      >
                        <option></option>
                        {columns?.map((column) => (
                          <option
                            id={column["header"]}
                            value={column["header"]}
                          >
                            {column["header"]}
                          </option>
                        ))}
                      </Select>
                    </Table.Cell>
                    <Table.Cell>
                      {
                        // @ts-ignore
                        parameter.name
                      }
                    </Table.Cell>
                  </Table.Row>
                ))}
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
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>{column["header"]}</Table.Cell>
                    <Table.Cell>
                      <Select
                        key={column["header"]}
                        ref={(node) => {
                          const map = getRequestFieldsMap();

                          if (node) {
                            map.set(column["header"], node);
                          } else {
                            map.delete(column["header"]);
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
