import { Operation } from "openapi-client-axios";

import { TableColumn } from "./CsvDataTable";
import MapParametersTable from "./MapParametersTable";
import MapRequestFieldsTable from "./MapRequestFieldsTable";

interface MapFieldsProps {
  loading: boolean;
  selectedOperator: Operation | undefined;
  columns: TableColumn[];
  parameterMapping: Map<string, string>;
  onParameterMappingChange: (field: string, requestField: string) => void;
  requestFieldMapping: Map<string, string>;
  onFieldMappingChange: (field: string, requestField: string) => void;
}

export default function MapFields({
  loading,
  selectedOperator,
  columns,
  parameterMapping,
  onParameterMappingChange,
  requestFieldMapping,
  onFieldMappingChange,
}: MapFieldsProps): JSX.Element {
  return (
    <div>
      {!loading && selectedOperator && selectedOperator.parameters && (
        <div>
          <MapParametersTable
            selectedOperatorParameters={selectedOperator.parameters}
            columns={columns}
            parameterMapping={parameterMapping}
            onParameterMappingChange={onParameterMappingChange}
          />
        </div>
      )}
      {!loading && selectedOperator && selectedOperator.requestBody && (
        <div>
          <MapRequestFieldsTable
            selectedOperatorRequestBody={selectedOperator.requestBody}
            columns={columns}
            requestFieldMapping={requestFieldMapping}
            onFieldMappingChange={onFieldMappingChange}
          />
        </div>
      )}
    </div>
  );
}
