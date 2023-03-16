import { Button } from "flowbite-react";
import { Operation } from "openapi-client-axios";

import { TableColumn } from "./CsvDataTable";
import MapParametersTable from "./MapParametersTable";
import MapRequestFieldsTable from "./MapRequestFieldsTable";

interface MapFieldsProps {
  loading: boolean;
  selectedOperator: Operation | undefined;
  getParametersMap: () => Map<string, HTMLSelectElement>;
  columns: TableColumn[];
  getRequestFieldsMap: () => Map<string, HTMLSelectElement>;
  importData: () => void;
}

export default function MapFields({
  loading,
  selectedOperator,
  getParametersMap,
  columns,
  getRequestFieldsMap,
  importData,
}: MapFieldsProps): JSX.Element {
  return (
    <>
      <div>
        {!loading && selectedOperator && selectedOperator.parameters && (
          <div>
            <MapParametersTable
              selectedOperatorParameters={selectedOperator.parameters}
              columns={columns}
              getParametersMap={getParametersMap}
            />
          </div>
        )}
        {!loading && selectedOperator && selectedOperator.requestBody && (
          <div>
            <MapRequestFieldsTable
              selectedOperatorRequestBody={selectedOperator.requestBody}
              columns={columns}
              getRequestFieldsMap={getRequestFieldsMap}
            />
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
