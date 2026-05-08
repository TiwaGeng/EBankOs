import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { exportExcel, exportPDF, exportWord, printRows, type Row } from "@/lib/exporters";

export type Period = "daily" | "weekly" | "monthly";

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;
  date: string;
  onDateChange: (d: string) => void;
  rows: Row[];
  filename: string;
  title: string;
}

export const periodRange = (period: Period, anchor: string): { from: string; to: string } => {
  const d = new Date(anchor);
  if (period === "daily") return { from: anchor, to: anchor };
  if (period === "weekly") {
    const day = d.getDay(); // 0=Sun
    const start = new Date(d); start.setDate(d.getDate() - day);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  }
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
};

const ReportToolbar = ({ period, onPeriodChange, date, onDateChange, rows, filename, title }: Props) => (
  <div className="flex flex-wrap items-end gap-2 bg-card border rounded-lg p-3">
    <div>
      <Label className="text-xs">Period</Label>
      <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label className="text-xs">{period === "monthly" ? "Any date in month" : period === "weekly" ? "Any date in week" : "Date"}</Label>
      <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="w-44" />
    </div>
    <div className="ml-auto flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => printRows(rows, title)}><Printer className="h-4 w-4 mr-1" /> Print</Button>
      <Button size="sm" variant="outline" onClick={() => exportPDF(rows, filename, title)}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
      <Button size="sm" variant="outline" onClick={() => exportExcel(rows, filename)}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel</Button>
      <Button size="sm" variant="outline" onClick={() => exportWord(rows, filename, title)}><Download className="h-4 w-4 mr-1" /> Word</Button>
    </div>
  </div>
);

export default ReportToolbar;