import { useState, useRef, useEffect, ClipboardEvent, ChangeEvent } from "react";
import { Button, Label, Textarea } from "flowbite-react";
import Papa from "papaparse";

import "../App.css";

import {
  OpenAPIClientAxios,
  Operation,
  AxiosRequestHeaders,
  ParameterObject,
  UnknownParamsObject,
} from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";
import OpenApiDefinition from "../components/OpenApiDefinition";
import CsvDataTable, { TableData } from "../components/CsvDataTable";
import SelectOperator from "../components/SelectOperator";
import MapFields from "../components/MapFields";

interface CSVData {
  [key: string]: string;
}

export default function Import() {
  const [data, setData] = useState<TableData>({
    columns: [],
    rows: [],
  });
  const [loading, setLoading] = useState(true);

  const [api, setApi] = useState<OpenAPIClientAxios>();
  const [requestHeaders, setHeaders] = useState<AxiosRequestHeaders>();
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

  function handleLoadAPI(definition: string | OpenAPIV3.Document | undefined) {
    if (!definition) {
      return;
    }

    const localApi = new OpenAPIClientAxios({
      definition,
    });
    localApi.init().then(() => {
      console.log(localApi);
      setApi(localApi);
      setOperators(localApi.getOperations());
    });
  }

  async function importData() {
    if (!selectedOperator) return;
    if (!api) return;

    const parameterMap = getParametersMap();
    const requestFieldMap = getRequestFieldsMap();

    const apiClient = await api.init();
    try {
      let requestBody: object;

      data.rows.forEach(async (row) => {
        data.columns.forEach((colName) => {
          const requestFieldValue = requestFieldMap.get(colName.accessorKey)?.value;
          if (requestFieldValue && requestFieldValue !== "Skip") {
            const requestField = { [requestFieldValue]: row[colName.accessorKey] };
            requestBody = { ...requestBody, ...requestField };
          }
        });

        let parameters: object = {};
        parameterMap.forEach((value, key) => {
          const param = { [key]: row[value.value] };
          parameters = { ...parameters, ...param };
        });

        const axiosConfig = api.getAxiosConfigForOperation(selectedOperator, [
          parameters as UnknownParamsObject,
          requestBody,
        ]);
        axiosConfig.headers = { ...axiosConfig.headers, ...requestHeaders };
        const response = await apiClient.request(axiosConfig);
        console.log(response);
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (data.rows.length && data.columns.length) setLoading(false);
  }, [data]);

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    const localHeaders = {
      Authorization: e.target.value,
    } as AxiosRequestHeaders;
    setHeaders(localHeaders);
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>): void {
    const text = e.clipboardData.getData("text/plain");
    e.preventDefault();

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const csvData: CSVData[] = results.data as CSVData[];
        const columns = Object.keys(csvData[0]).map((key) => ({
          Header: key,
          accessorKey: key,
        }));
        const rows = csvData.map((item) => ({ ...item }));

        setData({ columns, rows });
      },
    });
  }

  function operationChange(event: { target: { value: string | undefined } }): void {
    if (event.target.value) {
      const operation: Operation = operators.filter((op) => op.operationId === event.target.value)[0];
      setSelectedOperator(operation);
      console.log(operation);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Trak OpenApi Inspector</h1>

      <OpenApiDefinition onHandleLoadApi={(def) => handleLoadAPI(def)} />

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="operation" value="Select operation" />
          </div>
          <SelectOperator
            allowedMethods={["post", "put", "delete"]}
            operators={operators}
            operationChange={(e) => operationChange(e)}
          />
        </div>
      </div>

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="AuthHeader" value="Authorization Header" />
          </div>
          <Textarea id="AuthHeader" placeholder="Auth..." required rows={4} onChange={(e) => onAuthHeaderChange(e)} />
        </div>
      </div>
      <MapFields
        loading={loading}
        columns={data.columns}
        selectedOperator={selectedOperator}
        getParametersMap={() => getParametersMap()}
        getRequestFieldsMap={() => getRequestFieldsMap()}
      />

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
        <Textarea id="data" placeholder="Paste Excel Data here..." required rows={4} onPaste={(e) => handlePaste(e)} />
      </div>

      {!loading && <CsvDataTable data={data.rows} columns={data.columns} />}
    </div>
  );
}
