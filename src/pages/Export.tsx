import { useState, useEffect, ChangeEvent, useContext } from "react";
import { Button, Label, Textarea } from "flowbite-react";

import "../App.css";

import { Operation, AxiosRequestHeaders } from "openapi-client-axios";
import CsvDataTable, { TableData, TableRow } from "../components/CsvDataTable";
import SelectOperator from "../components/SelectOperator";
import QueryParameters from "../components/QueryParameters";
import SelectRequestFields from "../components/SelectRequestFields";
import { getSchemaProperties, SchemaMap } from "../utility/OpenApiUtils";
import { OpenApiContextType } from "../@types/openapistate";
import { OpenApiContext } from "../components/OpenApiContext";

export default function Export() {
  const { openApiState } = useContext(OpenApiContext) as OpenApiContextType;

  const [data, setData] = useState<TableData>({
    columns: [],
    rows: [],
    key: "",
  });
  const [loading, setLoading] = useState(true);

  const [requestHeaders, setHeaders] = useState<AxiosRequestHeaders>();
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

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    const localHeaders = {
      Authorization: e.target.value,
    } as AxiosRequestHeaders;
    setHeaders(localHeaders);
  }

  async function operationChange(event: { target: { value: string | undefined } }): Promise<void> {
    if (event.target.value) {
      if (!openApiState?.operators) return;
      const operation: Operation = openApiState.operators.filter(
        (op: Operation) => op.operationId === event.target.value,
      )[0];
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
    if (!openApiState?.api || !selectedOperator) {
      return;
    }

    const apiClient = await openApiState.api.getClient();

    try {
      const axiosConfig = openApiState.api.getAxiosConfigForOperation(selectedOperator, [parameterValues]);
      axiosConfig.headers = { ...axiosConfig.headers, ...requestHeaders };

      const response = await apiClient.request(axiosConfig);
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
      <h1 className="text-3xl font-bold">Trak OpenApi Inspector</h1>

      <div className="flex flex-row justify-center items-end space-x-4">
        <div className="py-2 grow">
          <div className="mb-2 block">
            <Label htmlFor="operation" value="Select operation" />
          </div>
          {openApiState?.operators && (
            <SelectOperator
              operators={openApiState.operators}
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
          <Textarea id="AuthHeader" placeholder="Auth..." required rows={4} onChange={(e) => onAuthHeaderChange(e)} />
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
