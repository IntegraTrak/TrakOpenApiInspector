import {
  useState,
  useRef,
  useEffect,
  ClipboardEvent,
  ChangeEvent,
} from 'react';
import { Label, Textarea } from 'flowbite-react';
import Papa from 'papaparse';
import { set } from 'radash';

import './App.css';

import {
  OpenAPIClientAxios,
  Operation,
  AxiosRequestHeaders,
} from 'openapi-client-axios';
import { OpenAPIV3 } from 'openapi-types';
import OpenApiDefinition from './components/OpenApiDefinition';
import CsvDataTable from './components/CsvDataTable';
import { SelectOperator } from './components/SelectOperator';
import { MapFields } from './components/MapFields';

export default function Import() {
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
    const localApi = new OpenAPIClientAxios({
      definition,
    });
    localApi.init().then((client) => {
      console.log(localApi);
      setApi(localApi);
      setOperators(localApi.getOperations());
    });
  }

  function importData() {
    const parameterMap = getParametersMap();
    if (parameterMap) {
      parameterMap.forEach((value, key) => {
        console.log(`${key}: ${value.value}`);
      });
    }

    const requestFieldMap = getRequestFieldsMap();

    api!.init().then((apiClient) => {
      let requestBody: any = {};
      data.map((row) => {
        columns.map((colName) => {
          const requestFieldValue = requestFieldMap.get(
            colName.accessorKey
          )!.value;
          if (requestFieldValue != 'Skip') {
            requestBody = set(
              requestBody,
              `${requestFieldValue}`,
              row[colName.accessorKey]
            );
          }
        });
        console.log(JSON.stringify(requestBody));

        let parameters: any = {};
        parameterMap.forEach((value, key) => {
          parameters = set(parameters, `${key}`, row[value.value]);
        });

        const path = selectedOperator!.path as string;
        const apiClientPath = apiClient!.paths[path];
        console.log(path);
        console.log(selectedOperator?.method);
        console.log(parameters);

        switch (selectedOperator?.method) {
          case 'post':
            {
              // @ts-ignore
              apiClientPath
                .post(undefined, requestBody, { headers })
                .then((response: any) => {
                  console.log(response);
                });
            }
            break;
          case 'put': {
            // @ts-ignore
            apiClientPath
              .put(parameters, requestBody, { headers })
              .then((response: any) => {
                console.log(response);
              });
          }
          case 'delete': {
            // @ts-ignore
            apiClientPath
              .delete(parameters, null, { headers })
              .then((response: any) => {
                console.log(response);
              });
          }
        }
      });
    });
  }

  useEffect(() => {
    if (data.length && columns.length) setLoading(false);
  }, [data, columns]);

  function makeColumns(rawColumns: any) {
    return rawColumns.map((column: any) => {
      return { header: column, accessorKey: column };
    });
  }

  function onAuthHeaderChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    // @ts-ignore
    const localHeaders: AxiosRequestHeaders = {
      Authorization: e.target.value,
    };
    setHeaders(localHeaders);
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>): void {
    const text = e.clipboardData.getData('text/plain');
    e.preventDefault();

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete(results: any) {
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
            allowedMethods={['post', 'put', 'delete']}
            operators={operators}
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
            required
            rows={4}
            onChange={(e) => onAuthHeaderChange(e)}
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
          required
          rows={4}
          onPaste={(e) => handlePaste(e)}
        />
      </div>

      {!loading && <CsvDataTable data={data} columns={columns} />}
    </div>
  );
}
