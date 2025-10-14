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
    }),
    []
  );

  const rowData = useMemo(() => data, [data]);

  return (
    <section className="overflow-x-auto w-full">
      <div
        className="ag-theme-quartz"
        style={{
          height: "90vh",
          minWidth: "60rem",
          width: "100%",
        }}
      >
        <AgGridReact
          ref={tableRef ? tableRef : gridRef}
          rowData={rowData}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={15}
          paginationPageSizeSelector={[15, 25, 50]}
          onRowClicked={onRowClicked ? onRowClicked : null}
        />
      </div>
    </section>
  );
};

export default Table;
