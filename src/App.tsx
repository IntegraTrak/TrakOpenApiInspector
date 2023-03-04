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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { OpenAPIClientAxios, Operation } from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [operators, setOperators] = useState([] as Operation[]);
  const [selectedOperator, setSelectedOperator] = useState(
    null as unknown as Operation
  );
  const [operatorSelected, setOperatorSelected] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const refOpenApiUri = useRef<HTMLInputElement>(null);
  const refOpenApiDef = useRef<HTMLTextAreaElement>(null);

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 20,
  });

  useEffect(() => {
    if (data.length && columns.length) setLoading(false);
  }, [data, columns]);

  function handleLoadAPI() {
    const api = new OpenAPIClientAxios({
      definition: getApiDefinition(),
    });
    api.init().then(() => {
      console.log(api);
      setOperators(api.getOperations());
    });
  }

  function getApiDefinition() {
    let definition: string | OpenAPIV3.Document = refOpenApiUri!.current!.value;
    if (definition == "") {
      definition = JSON.parse(refOpenApiDef!.current!.value);
    }
    return definition;
  }

  function getSelectedOperationRequestProperties() {
    return (
      selectedOperator.requestBody &&
      selectedOperator.requestBody.content["application/json"].schema
        .properties &&
      Object.entries(
        selectedOperator.requestBody.content["application/json"].schema
          .properties
      )
    );
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
      setOperatorSelected(true);
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
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <Label
            htmlFor="OpenApiUrl"
            value="OpenApi Url"
            className="bg-blue-100"
          />
          <TextInput
            ref={refOpenApiUri}
            id="OpenApiUrl"
            type="url"
            placeholder="https://api.trakstudios.com/v1/openapi.json"
          />
        </div>
        <div className="py-2 grow-0">
          <Button type="submit" onClick={() => handleLoadAPI()}>
            Load API
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <Textarea
            ref={refOpenApiDef}
            id="OpenApiText"
            placeholder="Open Api Json..."
            rows={4}
          />
        </div>
      </div>
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
        {!loading && operatorSelected && selectedOperator.parameters && (
          <div>
            <Table>
              <Table.Head>
                <Table.HeadCell>Import Field</Table.HeadCell>
                <Table.HeadCell>Parameters</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {selectedOperator.parameters &&
                  selectedOperator!.parameters!.map((parameter) => (
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell>
                        <Select>
                          <option></option>
                          {columns &&
                            columns.map((column) => (
                              <option>{column.header}</option>
                            ))}
                        </Select>
                      </Table.Cell>
                      <Table.Cell>{parameter.name}</Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>
        )}
        {!loading && operatorSelected && selectedOperator.requestBody && (
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
                      <Table.Cell>{column.header}</Table.Cell>
                      <Table.Cell>
                        <Select>
                          <option>Skip</option>
                          {selectedOperator.requestBody &&
                            getSelectedOperationRequestProperties()
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

      {!loading && (
        <div ref={parentRef} className="container">
          <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
            <table>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr
                      key={row.id}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${
                          virtualRow.start - index * virtualRow.size
                        }px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
