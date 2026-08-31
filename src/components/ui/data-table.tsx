'use client';

import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Filter records...',
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-900/80 text-sm text-slate-200 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{table.getRowModel().rows.length}</span> of{' '}
          <span className="font-semibold text-slate-200">{data.length}</span> entries
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-4 font-semibold">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1.5 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-100' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-slate-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <span>Loading payroll records...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Rows per page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-slate-900 text-xs text-slate-200 border border-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
          >
            {[10, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-2">
            Page <span className="font-semibold text-slate-200">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="font-semibold text-slate-200">{table.getPageCount() || 1}</span>
          </span>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
