const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, date, items } = req.body;

    // Template HTML Sederhana
    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { border-bottom: 2px solid #333; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header"><h1>Invoice</h1></div>
        <p>Customer: ${name || 'Guest'}</p>
        <p>Date: ${date || new Date().toLocaleDateString()}</p>
        <table>
          <tr><th>Item</th><th>Price</th></tr>
          ${items ? items.map(i => `<tr><td>${i.name}</td><td>${i.price}</td></tr>`).join('') : '<tr><td>No data</td><td>-</td></tr>'}
        </table>
      </body>
    </html>`;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    // Set header agar n8n mengenali ini sebagai file PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    return res.status(200).send(pdf);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}
