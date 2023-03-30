import { useState, useRef, useCallback, ClipboardEventHandler } from "react";
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
import Papa from "papaparse";

export type TableColumn = {
  Header: string;
  accessorKey: string;
  accessorFn?: (row: TableRow) => string;
};

export type TableRow = {
  [key: string]: string;
};

export type TableData = {
  columns: TableColumn[];
  rows: TableRow[];
  key: string;
};

type CsvDataTableProps = {
  data: TableRow[];
  columns: TableColumn[];
  selectedFields?: Map<string, boolean>;
};

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

  const handleCopyTo = useCallback(
    function handleCopyTo(delimiter = "\t"): ClipboardEventHandler<HTMLTableElement> {
      const lastHeaderGroup = csvTable.getHeaderGroups().at(-1);
      if (!lastHeaderGroup) return () => {};
      const headerText = lastHeaderGroup.headers
        .filter((h) => h.column.getIsVisible())
        .map((header) => {
          return header.id;
        });

      const tableData = csvTable.getCoreRowModel().rows.map((row2) => row2.original);
      const csvText = Papa.unparse(
        {
          fields: headerText,
          data: tableData,
        },
        {
          quotes(field) {
            return typeof field === "string" && field.includes(delimiter);
          },
          quoteChar: '"',
          delimiter,
          newline: "\n",
        },
      );

      navigator.clipboard.writeText(csvText);

      return (e) => {
        e.preventDefault();
        e.clipboardData.setData("text/plain", csvText);
      };
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
        <Button type="button" onClick={() => handleCopyTo("\t")}>
          Copy (Excel)
        </Button>
        <Button type="button" onClick={() => handleCopyTo(",")}>
          Copy (CSV)
        </Button>
      </div>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <table onCopy={handleCopyTo("\t")}>
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
