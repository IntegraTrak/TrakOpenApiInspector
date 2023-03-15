import React from "react";
import { Select } from "flowbite-react";
import { Operation } from "openapi-client-axios";

interface SelectOperatorProps {
  operators: Operation[];
  allowedMethods: string[];
  operationChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function SelectOperator({
  operators,
  allowedMethods,
  operationChange,
}: SelectOperatorProps) {
  return (
    <Select id="operation" required onChange={operationChange}>
      {operators
        .filter((operation) => allowedMethods.includes(operation.method))
        .map((operation) => (
          <option key={operation.operationId} value={operation.operationId}>
            {operation.operationId}
          </option>
        ))}
    </Select>
  );
}
