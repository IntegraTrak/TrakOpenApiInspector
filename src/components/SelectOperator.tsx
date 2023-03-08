import React from "react";
import { Select } from "flowbite-react";
import { Operation } from "openapi-client-axios";

interface SelectOperatorProps {
  operators: Operation[];
  operationChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SelectOperator({
  operators,
  operationChange,
}: SelectOperatorProps) {
  return (
    <Select id="operation" required={true} onChange={operationChange}>
      {operators
        .filter(
          (operation) =>
            operation.method == "post" ||
            operation.method == "put" ||
            operation.method == "delete"
        )
        .map((operation, operationId) => (
          <option key={operationId} value={operation.operationId}>
            {operation.operationId}
          </option>
        ))}
    </Select>
  );
}
