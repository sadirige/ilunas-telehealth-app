const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  const needsQuotes = /[",\n]/.test(stringValue);
  const escaped = stringValue.replace(/"/g, '""');

  return needsQuotes ? `"${escaped}"` : escaped;
};

const buildCsv = (headers, rows) => {
  const headerLine = headers.map(escapeCsvValue).join(',');
  const lines = rows.map((row) => row.map(escapeCsvValue).join(','));
  return [headerLine, ...lines].join('\n');
};

const downloadCsv = (filename, headers, rows) => {
  const csv = buildCsv(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildHtmlTable = (headers, rows) => {
  const headerCells = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('');

  return `
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
};

const downloadPdf = (title, headers, rows) => {
  const html = `
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          p { margin: 0 0 16px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        ${buildHtmlTable(headers, rows)}
        <script>window.print();</script>
      </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (!win) {
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
};

export { downloadCsv, downloadPdf };
