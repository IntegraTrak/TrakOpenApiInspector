import { useState, useRef, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { Button } from "flowbite-react";

export interface TableColumn {
  Header: string;
  accessorKey: string;
  accessorFn?: (row: TableRow) => string;
}

export interface TableRow {
  [key: string]: string;
}

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

interface CsvDataTableProps {
  data: TableRow[];
  columns: TableColumn[];
  selectedFields?: Map<string, boolean>;
}

export default function CsvDataTable({
  data,
  columns,
  selectedFields = new Map<string, boolean>(),
}: CsvDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const csvTable = useReactTable({
    data,
    columns: selectedFields.size !== 0 ? columns.filter((column) => selectedFields.get(column.accessorKey)) : columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const { rows } = csvTable.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 20,
  });

  const handleCopyToExcel = useCallback(
    function handleCopyToExcel() {
      const lastHeaderGroup = csvTable.getHeaderGroups().at(-1);
      if (!lastHeaderGroup) return;
      const headerText = lastHeaderGroup.headers
        .filter((h) => h.column.getIsVisible())
        .map((header) => {
          return header.id;
        })
        .join("\t");
      console.log("headerText", headerText);

      const text = csvTable
        .getCoreRowModel()
        .rows.map((row2) => {
          return row2
            .getVisibleCells()
            .map((cell) => cell.getValue() ?? "")
            .join("\t");
        })
        .join("\n");

      console.log("text", text);

      navigator.clipboard.writeText(`${headerText}\n${text}`);
    },
    [csvTable],
  );

  function renderTableHeader(table: Table<TableRow>) {
    return (
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                  {header.isPlaceholder ? null : (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      {...{
                        className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                        onClick: header.column.getToggleSortingHandler(),
                        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
                          if (header.column.getCanSort() && (event.key === "Enter" || event.key === " ")) {
                            header.column.toggleSorting();
                          }
                        },
                        role: "button",
                        tabIndex: 0,
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
    );
  }

  function renderTableBody(tableRows: Row<TableRow>[], tableVirtualizer: Virtualizer<HTMLDivElement, Element>) {
    return (
      <tbody>
        {tableVirtualizer.getVirtualItems().map((virtualRow, index) => {
          const row = tableRows[virtualRow.index];
          return (
            <tr
              key={row.id}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
              }}
            >
              {row.getVisibleCells().map((cell) => {
                return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    );
  }

  return (
    <div ref={parentRef} className="container">
      <div>
        <Button type="button" onClick={() => handleCopyToExcel()}>
          Copy (Excel)
        </Button>
      </div>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <table onCopy={handleCopyToExcel}>
          {renderTableHeader(csvTable)}
          {renderTableBody(rows, virtualizer)}
        </table>
      </div>
    </div>
  );
}

CsvDataTable.defaultProps = {
  selectedFields: new Map(),
};
