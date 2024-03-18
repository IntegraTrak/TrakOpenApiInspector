import { useState, useEffect, ChangeEvent } from "react";
import { Button, Label, Textarea } from "flowbite-react";

import "../App.css";

import { Operation, AxiosHeaders, OpenAPIV3 } from "openapi-client-axios";
import { useAtom } from "jotai";
import CsvDataTable, { TableData, TableRow } from "../components/CsvDataTable";
import SelectOperator from "../components/SelectOperator";
import QueryParameters from "../components/QueryParameters";
import SelectRequestFields from "../components/SelectRequestFields";
import { getSchemaProperties, SchemaMap } from "../utility/OpenApiUtils";
import TrakNavBar from "../components/TrakNavBar";
import OpenApiDefinitionHistory from "../components/OpenApiDefinitionHistory";
import { openApiAtom, openApiHeadersAtom, openApiOperationsAtom } from "../components/OpenApiState";

export default function Export() {
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
  const [selectedOperatorSchema, setSelectedOperatorSchema] = useState<SchemaMap>();
  const [parameterValues, setParameterValues] = useState<{ [key: string]: string }>({});
  const [selectedFields, setSelectedFields] = useState<Map<string, boolean>>(new Map<string, boolean>());

  useEffect(() => {
    if (data.rows.length && data.columns.length) setLoading(false);
  }, [data]);

  function updateSchema(operation: Operation) {
    const sucessResponse = operation?.responses?.["200"];
    if ("content" in sucessResponse) {
      const schema = sucessResponse.content?.["application/json"]?.schema;
      if (schema && "type" in schema) {
        const nestedSchemas = getSchemaProperties(schema);
        setSelectedOperatorSchema(nestedSchemas);
      }
    }
  }

  useEffect(() => {
    setData({
      columns: [],
      rows: [],
      key: "",
    });
    setParameterValues({});
    setSelectedFields(new Map<string, boolean>());

    if (selectedOperator) updateSchema(selectedOperator);
  }, [selectedOperator]);

  async function onApiSelect(definition: string | OpenAPIV3.Document | undefined) {
    console.log(definition);
  }

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    const authHeaderValue = e.target.value;
    const headers = new AxiosHeaders();
    headers.setAuthorization(authHeaderValue, true);
    setRequestHeaders(headers);
  }

  async function operationChange(event: { target: { value: string | undefined } }): Promise<void> {
    if (event.target.value) {
      if (!operators) return;
      const operation: Operation = operators.filter((op: Operation) => op.operationId === event.target.value)[0];
      setSelectedOperator(operation);
    }
  }

  const handleParameterValuesChange = (newParameterValues: { [key: string]: string }) => {
    setParameterValues(newParameterValues);
  };

  const handleFieldChange = (field: string, checked: boolean) => {
    setSelectedFields((prevSelectedFields) => new Map(prevSelectedFields).set(field, checked));
  };

  async function exportData() {
    console.log(api);
    console.log(selectedOperator);
    if (!api || !selectedOperator) {
      return;
    }

    const apiClient = await api.getClient();

    try {
      const axiosConfig = api.getAxiosConfigForOperation(selectedOperator, [parameterValues]);
      axiosConfig.headers = { ...axiosConfig.headers, ...requestHeaders };

      const response = await apiClient.request(axiosConfig);
      console.log(response);
      if (response.status === 200 && selectedOperatorSchema) {
        let responseData = response.data;
        if (!Array.isArray(responseData)) {
          responseData = [responseData];
        }

        const columns = [...selectedOperatorSchema.entries()].map(([key]) => ({
          Header: key,
          accessorKey: key,
          accessorFn: (row: TableRow) => row[key],
        }));

        const rows = responseData.map((row: TableRow) => {
          const newRow: TableRow = {};

          columns.forEach((column) => {
            const colKey = column.accessorKey;

            if (colKey.includes(".")) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const value = colKey.split(".").reduce((acc: any, key) => acc?.[key], row);
              newRow[colKey] = value !== undefined ? value : "";
            } else {
              newRow[colKey] = row[colKey];
            }
          });

          return newRow;
        });

        setData({
          columns,
          rows,
          key: Date.now().toString(),
        });
      }
    } catch (error) {
      console.log(error);
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
              operators={operators}
              allowedMethods={["get"]}
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

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          {selectedOperator && selectedOperator.parameters && (
            <QueryParameters
              selectedOperatorParameters={selectedOperator.parameters ?? []}
              parameterValues={parameterValues}
              onParameterValuesChange={handleParameterValuesChange}
            />
          )}

          {selectedOperatorSchema && (
            <SelectRequestFields
              schemaMap={selectedOperatorSchema}
              selectedFields={selectedFields}
              onFieldChange={handleFieldChange}
            />
          )}
        </div>
      </div>

      <div className="flex flex-row justify-end items-end space-x-4">
        <div className="py-2 grow-0">
          <Button type="submit" onClick={() => exportData()}>
            Export Data
          </Button>
        </div>
      </div>

      {!loading && <CsvDataTable data={data.rows} columns={data.columns} selectedFields={selectedFields} />}
    </div>
  );
}
