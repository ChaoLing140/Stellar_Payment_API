export interface ReceiptPdfData {
  merchantName?: string | null;
  paymentId: string;
  amount: string;
  asset: string;
  status: string;
  date: string;
  recipient: string;
  transactionHash: string;
  description?: string | null;
}

function normalizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(value: string, maxLength = 76) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    if (word.length <= maxLength) {
      current = word;
      continue;
    }

    for (let i = 0; i < word.length; i += maxLength) {
      lines.push(word.slice(i, i + maxLength));
    }
    current = "";
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function buildContentLines(data: ReceiptPdfData) {
  const heading = data.merchantName?.trim() || "Stellar Payment Receipt";
  const detailLines = [
    `Amount: ${data.amount} ${data.asset}`,
    `Status: ${data.status}`,
    `Date: ${data.date}`,
    `Transaction hash: ${data.transactionHash}`,
    `Payment ID: ${data.paymentId}`,
    `Recipient: ${data.recipient}`,
  ];

  if (data.description?.trim()) {
    detailLines.push(`Description: ${data.description.trim()}`);
  }

  return [
    { text: heading, fontSize: 24, leading: 30 },
    { text: "Receipt", fontSize: 15, leading: 24 },
    ...detailLines.flatMap((line) =>
      wrapLine(line).map((wrapped) => ({
        text: wrapped,
        fontSize: 12,
        leading: 18,
      })),
    ),
  ];
}

export function createReceiptPdf(data: ReceiptPdfData) {
  const lines = buildContentLines(data);
  const content: string[] = ["BT", "/F1 24 Tf", "50 750 Td"];
  let firstLine = true;

  for (const line of lines) {
    if (!firstLine) {
      content.push(`0 -${line.leading} Td`);
      content.push(`/F1 ${line.fontSize} Tf`);
    }
    content.push(`(${normalizePdfText(line.text)}) Tj`);
    firstLine = false;
  }

  content.push("ET");

  const stream = content.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
