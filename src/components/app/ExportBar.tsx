import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { exportExcel, exportPDF, exportWord, printRows, type Row } from "@/lib/exporters";

const ExportBar = ({ rows, filename, title }: { rows: Row[]; filename: string; title: string }) => (
  <div className="flex flex-wrap gap-2 justify-end">
    <Button size="sm" variant="outline" onClick={() => printRows(rows, title)}><Printer className="h-4 w-4 mr-1" /> Print</Button>
    <Button size="sm" variant="outline" onClick={() => exportPDF(rows, filename, title)}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
    <Button size="sm" variant="outline" onClick={() => exportExcel(rows, filename)}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel</Button>
    <Button size="sm" variant="outline" onClick={() => exportWord(rows, filename, title)}><Download className="h-4 w-4 mr-1" /> Word</Button>
  </div>
);

export default ExportBar;