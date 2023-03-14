import { SelectOperator } from "./components/SelectOperator";
import { MapFields } from "./components/MapFields";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Label, Textarea } from "flowbite-react";
import Papa from "papaparse";
import { set } from "radash";

import "./App.css";

import {
  OpenAPIClientAxios,
  OpenAPIClient,
  Operation,
  AxiosRequestHeaders,
} from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";
import OpenApiDefinition from "./components/OpenApiDefinition";
import CsvDataTable from "./components/CsvDataTable";

export function Export() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [api, setApi] = useState<OpenAPIClientAxios>();
  const [headers, setHeaders] = useState<AxiosRequestHeaders>();
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
      definition: definition,
    });
    api.init().then((client) => {
      console.log(api);
      setApi(api);
      setOperators(api.getOperations());
    });
  }

  useEffect(() => {
    if (data.length && columns.length) setLoading(false);
  }, [data, columns]);

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    // @ts-ignore
    let headers: AxiosRequestHeaders = {
      Authorization: e.target.value,
    };
    setHeaders(headers);
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
            allowedMethods={["get"]}
            operationChange={operationChange}
          />
        </div>
      </div>

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="AuthHeader" value="Authorization Header" />
          </div>
          <Textarea
            id="AuthHeader"
            placeholder="Auth..."
            required={true}
            rows={4}
            onChange={(e) => onAuthHeaderChange(e)}
          />
        </div>
      </div>

      {!loading && <CsvDataTable data={data} columns={columns} />}
    </div>
  );
}
