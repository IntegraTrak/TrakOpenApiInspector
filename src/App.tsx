import { useState, useRef, useEffect, ClipboardEvent, Fragment } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
  TextInput,
  Label,
  Button,
  Textarea,
  Select,
  Table,
} from "flowbite-react";
import Papa from "papaparse";

import { OpenAPIClientAxios, Operation } from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";
import OpenApiDefinition from "./components/OpenApiDefinition";
import CsvDataTable from "./components/CsvDataTable";

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [api, setApi] = useState<OpenAPIClientAxios>();
  const [operators, setOperators] = useState<Operation[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operation>();

  function handleLoadAPI(definition: string | OpenAPIV3.Document) {
    const api = new OpenAPIClientAxios({
      definition,
    });
    api.init().then(() => {
      console.log(api);
      setApi(api);
      setOperators(api.getOperations());
    });
  }

  function importData() {
    data.map((row) => {
      console.log(row);
    });
  }

  useEffect(() => {
    if (data.length && columns.length) setLoading(false);
  }, [data, columns]);

  function getSelectedOperationRequestProperties() {
    if (
      selectedOperator!.requestBody &&
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

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>): void {
    let text = e.clipboardData.getData("text/plain");
    e.preventDefault();

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        setData(results.data);
        setColumns(makeColumns(results.meta.fields));
      },
    });
  }

  const operationChange = (event: {
    target: { value: string | undefined };
  }) => {
    if (event.target.value) {
      const operation: Operation = operators.filter(
        (operation) => operation.operationId == event.target.value
      )[0];
      setSelectedOperator(operation);
      console.log(operation);
    }
  };

  function makeColumns(rawColumns: any) {
    return rawColumns.map((column: any) => {
      return { header: column, accessorKey: column };
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Trak OpenApi Inspector</h1>

      <OpenApiDefinition onHandleLoadApi={handleLoadAPI} />

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div id="select">
            <div className="mb-2 block">
              <Label htmlFor="operation" value="Select operation" />
            </div>
            <Select id="operation" required={true} onChange={operationChange}>
              {operators
                .filter(
                  (operation) =>
                    operation.method == "post" ||
                    operation.method == "put" ||
                    operation.method == "delete"
                )
                .map((operation, operationId) => (
                  <option key={operationId} value={operation.operationId}>
                    {operation.operationId}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      </div>

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
                      <Select>
                        <option></option>
                        {columns &&
                          columns.map((column) => (
                            <option>{column["header"]}</option>
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
                {columns &&
                  columns.map((column) => (
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell>{column["header"]}</Table.Cell>
                      <Table.Cell>
                        <Select>
                          <option>Skip</option>
                          {getSelectedOperationRequestProperties()
                            .filter((property: any) => !property[1].readOnly)
                            .map((property: any) =>
                              getPropertyOption(property)
                            )}
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

      <div id="textarea">
        <div className="mb-2 block">
          <Label htmlFor="data" value="Data" />
        </div>
        <Textarea
          id="data"
          placeholder="Paste Excel Data here..."
          required={true}
          rows={4}
          onPaste={(e) => handlePaste(e)}
        />
      </div>

      {!loading && <CsvDataTable data={data} columns={columns} />}
    </div>
  );
}

export default App;
