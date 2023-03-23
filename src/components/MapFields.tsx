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
}

export default function MapFields({
  loading,
  selectedOperator,
  getParametersMap,
  columns,
  getRequestFieldsMap,
}: MapFieldsProps): JSX.Element {
  return (
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
  );
}
