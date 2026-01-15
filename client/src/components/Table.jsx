import React, { useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Table = ({ data, columns, tableRef, onRowClicked }) => {
  const gridRef = useRef();

  const defaultColDef = useMemo(
    () => ({
      filter: true,
      sortable: true,
      floatingFilter: true,
      resizable: true,
      flex: 1,
      suppressMenu: false,
      // Ang cellStyle ay Black para sa laman ng table
      cellStyle: { color: "#1a1a1a", fontWeight: "400" },
    }),
    []
  );

  const rowData = useMemo(() => data, [data]);

  return (
    <section className="w-full h-screen bg-gray-50 p-2 overflow-hidden">
      <style>{`
        /* 1. AGGRESSIVE SCROLLBAR HIDE */
        .ag-theme-quartz .ag-body-viewport,
        .ag-theme-quartz .ag-body-horizontal-scroll-viewport,
        .ag-theme-quartz .ag-center-cols-viewport,
        .ag-theme-quartz .ag-body-horizontal-scroll,
        .ag-theme-quartz .ag-body-vertical-scroll,
        .ag-theme-quartz .ag-virtual-list-viewport {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .ag-theme-quartz ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .ag-theme-quartz .ag-body-horizontal-scroll,
        .ag-theme-quartz .ag-body-vertical-scroll {
          height: 0px !important;
          max-height: 0px !important;
          visibility: hidden !important;
          display: none !important;
        }

        /* 2. MAROON TITLES + BLACK DATA */
        .ag-theme-quartz {
          --ag-header-background-color: #f9fafb;
          --ag-header-foreground-color: #800000; /* Maroon Header Text */
          --ag-border-color: #e5e7eb;
          --ag-row-border-color: #f3f4f6;
          --ag-font-size: 13px;
          --ag-grid-size: 8px;
          border-radius: 12px !important;
          overflow: hidden !important;
          border: 1px solid #e5e7eb !important;
        }

        /* Styling for Header Titles specifically */
        .ag-theme-quartz .ag-header-cell-label {
          color: #800000 !important; /* Force Maroon on all titles */
          font-weight: 800 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 10px;
        }

        /* Sorting icon color to match Maroon Titles */
        .ag-theme-quartz .ag-header-icon {
          color: #800000 !important;
        }

        /* Floating Filter Input Text (Keep it black/neutral) */
        .ag-theme-quartz .ag-floating-filter-body input {
          color: #1a1a1a !important;
          font-size: 11px;
          border-radius: 6px !important;
        }

        /* Row hover effect */
        .ag-theme-quartz .ag-row-hover {
          background-color: #f9fafb !important;
        }

        .ag-theme-quartz .ag-cell {
          display: flex;
          align-items: center;
        }

        .ag-root-wrapper {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
      `}</style>

      <div
        className="ag-theme-quartz mx-auto"
        style={{
          height: "calc(100vh - 16px)",
          width: "100%",
        }}
      >
        <AgGridReact
          ref={tableRef ? tableRef : gridRef}
          rowData={rowData}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          onRowClicked={onRowClicked ? onRowClicked : null}
          suppressHorizontalScroll={true}
          headerHeight={45}
          floatingFiltersHeight={45}
          overlayNoRowsTemplate={
            `<div style="color: #9ca3af; font-weight: 500;">No records found.</div>`
          }
        />
      </div>
    </section>
  );
};

export default Table;
