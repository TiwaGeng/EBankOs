import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table as DTable, TableRow as DRow, TableCell as DCell, HeadingLevel, TextRun, WidthType } from "docx";
import { saveAs } from "file-saver";

export type Row = Record<string, string | number | null | undefined>;

export const exportExcel = (rows: Row[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportPDF = (rows: Row[], filename: string, title?: string) => {
  const doc = new jsPDF();
  if (title) doc.text(title, 14, 15);
  const head = rows.length ? [Object.keys(rows[0])] : [[]];
  const body = rows.map((r) => Object.values(r).map((v) => (v ?? "") as string));
  autoTable(doc, { head, body, startY: title ? 22 : 12, styles: { fontSize: 9 } });
  doc.save(`${filename}.pdf`);
};

export const exportWord = async (rows: Row[], filename: string, title?: string) => {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const headerRow = new DRow({
    children: headers.map((h) => new DCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
  });
  const dataRows = rows.map((r) =>
    new DRow({
      children: headers.map((h) => new DCell({ children: [new Paragraph(String(r[h] ?? ""))] })),
    }),
  );
  const doc = new Document({
    sections: [
      {
        children: [
          ...(title ? [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] })] : []),
          new DTable({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

export const printRows = (rows: Row[], title: string) => {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  const html = `<html><head><title>${title}</title>
    <style>body{font-family:system-ui;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px;text-align:left}th{background:#f3f4f6}</style>
    </head><body><h1>${title}</h1>
    <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <script>window.onload=()=>window.print()</script></body></html>`;
  w.document.write(html);
  w.document.close();
};