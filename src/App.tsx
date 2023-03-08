import { SelectOperator } from "./components/SelectOperator";
import { MapFields } from "./components/MapFields";
import { useState, useRef, useEffect, ClipboardEvent, Fragment } from "react";
import "./App.css";
import { Label, Textarea } from "flowbite-react";
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

  const parametersRef = useRef<Map<string, HTMLSelectElement> | null>(null);
  const requestFieldsRef = useRef<Map<string, HTMLSelectElement> | null>(null);

  function getParametersMap(): Map<string, HTMLSelectElement> {
    if (!parametersRef.current) {
      parametersRef.current = new Map<string, HTMLSelectElement>();
    }
    return parametersRef.current;
  }

  function getRequestFieldsMap(): Map<string, HTMLSelectElement> {
    if (!requestFieldsRef.current) {
      requestFieldsRef.current = new Map<string, HTMLSelectElement>();
    }
    return requestFieldsRef.current;
  }

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
    let parameterMap = getParametersMap();
    if (parameterMap) {
      parameterMap.forEach((value, key) => {
        console.log(`${key}: ${value.value}`);
      });
    }

    let requestFieldMap = getRequestFieldsMap();
    if (requestFieldMap) {
      requestFieldMap.forEach((value, key) => {
        console.log(`${key}: ${value.value}`);
      });
    }

    data.map((row) => {
      console.log(row);
    });
  }

  useEffect(() => {
    if (data.length && columns.length) setLoading(false);
  }, [data, columns]);

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

  function operationChange(event: {
    target: { value: string | undefined };
  }): void {
    if (event.target.value) {
      const operation: Operation = operators.filter(
        (operation) => operation.operationId == event.target.value
      )[0];
      setSelectedOperator(operation);
      console.log(operation);
    }
  }

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
          <div className="mb-2 block">
            <Label htmlFor="operation" value="Select operation" />
          </div>
          <SelectOperator
            operators={operators}
            operationChange={operationChange}
          />
        </div>
      </div>
      <MapFields
        loading={loading}
        columns={columns}
        selectedOperator={selectedOperator}
        getParametersMap={getParametersMap}
        getRequestFieldsMap={getRequestFieldsMap}
        importData={importData}
      />

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
