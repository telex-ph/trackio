import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

const exportCSV = (ref, fileName) => {
  ref.current.api.exportDataAsCsv({
    fileName: `${fileName}.csv`,
  });
};

export default exportCSV;
