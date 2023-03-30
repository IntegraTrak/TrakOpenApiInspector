import { useState, useEffect, ClipboardEvent, ChangeEvent } from "react";
import { Button, Label, Textarea } from "flowbite-react";
import Papa from "papaparse";

import "../App.css";

import { Operation, UnknownParamsObject, AxiosError, AxiosHeaders, OpenAPIV3 } from "openapi-client-axios";
import { useAtom } from "jotai";
import CsvDataTable, { TableData } from "../components/CsvDataTable";
import SelectOperator from "../components/SelectOperator";
import MapFields from "../components/MapFields";
import TrakNavBar from "../components/TrakNavBar";
import OpenApiDefinitionHistory from "../components/OpenApiDefinitionHistory";
import { openApiAtom, openApiHeadersAtom, openApiOperationsAtom } from "../components/OpenApiState";

interface CSVData {
  [key: string]: string;
}

export default function Import() {
  const [api] = useAtom(openApiAtom);
  const [operators] = useAtom(openApiOperationsAtom);
  const [requestHeaders, setRequestHeaders] = useAtom(openApiHeadersAtom);

  const [data, setData] = useState<TableData>({
    columns: [],
    rows: [],
    key: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<Operation>();

  const [parameterMapping, setParameterMapping] = useState<Map<string, string>>(new Map<string, string>());
  const [requestFieldMapping, setRequestFieldMapping] = useState<Map<string, string>>(new Map<string, string>());

  const [statusData, setStatusData] = useState<Map<string, { resultStatusCode?: string; resultMessage?: string }>>();

  async function onApiSelect(definition: string | OpenAPIV3.Document | undefined) {
    console.log(definition);
  }

  const handleParameterMappingChange = (field: string, requestField: string) => {
    setParameterMapping((prevParameterMapping) => new Map(prevParameterMapping).set(field, requestField));
  };

  const handleFieldMappingChange = (field: string, requestField: string) => {
    setRequestFieldMapping((prevRequestFieldMapping) => new Map(prevRequestFieldMapping).set(field, requestField));
  };

  async function importData() {
    if (!selectedOperator) return;
    if (!api) return;

    const newStatusData = new Map<string, { resultStatusCode?: string; resultMessage?: string }>();
    setStatusData(newStatusData);

    const resultColumns = ["resultStatusCode", "resultMessage"];
    const existingResultColumns = data.columns.filter((col) => resultColumns.includes(col.accessorKey));

    const updatedColumns = [
      ...data.columns.filter((col) => !existingResultColumns.includes(col)),
      { Header: "resultStatusCode", accessorKey: "resultStatusCode" },
      { Header: "resultMessage", accessorKey: "resultMessage" },
    ];

    setData({ columns: updatedColumns, rows: data.rows, key: Date.now().toString() });

    const apiClient = await api.getClient();

    try {
      await Promise.all(
        data.rows.map(async (row) => {
          if (!api) return;

          let requestBody: object = {};

          data.columns.forEach((colName) => {
            const requestFieldValue = requestFieldMapping.get(colName.accessorKey);
            if (requestFieldValue && requestFieldValue !== "Skip") {
              const requestField = { [requestFieldValue]: row[colName.accessorKey] };
              requestBody = { ...requestBody, ...requestField };
            }
          });

          let parameters: object = {};
          parameterMapping.forEach((value, key) => {
            const param = { [key]: row[value] };
            parameters = { ...parameters, ...param };
          });

          const axiosConfig = api.getAxiosConfigForOperation(selectedOperator, [
            parameters as UnknownParamsObject,
            requestBody,
          ]);
          axiosConfig.headers = { ...axiosConfig.headers, ...requestHeaders };

          try {
            const response = await apiClient.request(axiosConfig);
            newStatusData.set(row.id, {
              resultStatusCode: `${response.status.toString()} - ${response.statusText}`,
              resultMessage: response.data ? JSON.stringify(response.data) : "",
            });
            setStatusData(newStatusData);
          } catch (error) {
            const axiosError = error as AxiosError;
            newStatusData.set(row.id, {
              resultStatusCode: axiosError.response
                ? `${axiosError.response.status.toString()} - ${axiosError.response.statusText}`
                : "Error",
              resultMessage: axiosError.response ? (axiosError.response.data as string) : "",
            });
            setStatusData(newStatusData);
          }
          setData({ columns: updatedColumns, rows: data.rows, key: Date.now().toString() });
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (data.rows.length && data.columns.length) setLoading(false);
  }, [data]);

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    const authHeaderValue = e.target.value;
    const headers = new AxiosHeaders();
    headers.setAuthorization(authHeaderValue, true);
    setRequestHeaders(headers);
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

        setData({ columns, rows, key: Date.now().toString() });
      },
    });
  }

  function operationChange(event: { target: { value: string | undefined } }): void {
    if (event.target.value) {
      if (!operators) return;
      const operation: Operation = operators.filter((op: Operation) => op.operationId === event.target.value)[0];
      setSelectedOperator(operation);
      console.log(operation);
    }
  }

  return (
    <div>
      <TrakNavBar />
      <OpenApiDefinitionHistory onApiSelect={(def) => onApiSelect(def)} />
      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="operation" value="Select operation" />
          </div>
          {operators && (
            <SelectOperator
              allowedMethods={["post", "put", "delete"]}
              operators={operators}
              operationChange={(e) => operationChange(e)}
            />
          )}
        </div>
      </div>

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="AuthHeader" value="Authorization Header" />
          </div>
          <Textarea
            id="AuthHeader"
            value={requestHeaders?.getAuthorization() ?? ""}
            placeholder="Auth..."
            required
            rows={4}
            onChange={(e) => onAuthHeaderChange(e)}
          />
        </div>
      </div>

      <MapFields
        loading={loading}
        columns={data.columns}
        selectedOperator={selectedOperator}
        onParameterMappingChange={handleParameterMappingChange}
        onFieldMappingChange={handleFieldMappingChange}
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

      <CsvDataTable
        key={data.key}
        data={data.rows.map((row) => ({ ...row, ...statusData?.get(row.id) }))}
        columns={data.columns}
      />
    </div>
  );
}
