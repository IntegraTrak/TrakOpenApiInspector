import { Operation } from "openapi-client-axios";

import { TableColumn } from "./CsvDataTable";
import MapParametersTable from "./MapParametersTable";
import MapRequestFieldsTable from "./MapRequestFieldsTable";

type MapFieldsProps = {
  loading: boolean;
  selectedOperator: Operation | undefined;
  columns: TableColumn[];
  onParameterMappingChange: (field: string, requestField: string) => void;
  onFieldMappingChange: (field: string, requestField: string) => void;
};

export default function MapFields({
  loading,
  selectedOperator,
  columns,
  onParameterMappingChange,
  onFieldMappingChange,
}: MapFieldsProps): JSX.Element {
  return (
    <div>
      {!loading && selectedOperator && selectedOperator.parameters && (
        <div>
          <MapParametersTable
            selectedOperatorParameters={selectedOperator.parameters}
            columns={columns}
            onParameterMappingChange={onParameterMappingChange}
          />
        </div>
      )}
      {!loading && selectedOperator && selectedOperator.requestBody && (
        <div>
          <MapRequestFieldsTable
            selectedOperatorRequestBody={selectedOperator.requestBody}
            columns={columns}
            onFieldMappingChange={onFieldMappingChange}
          />
        </div>
      )}
    </div>
  );
}
