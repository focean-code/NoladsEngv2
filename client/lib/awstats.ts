export type AwstatsData = {
  site?: string;
  lastUpdate?: string;
  reportedPeriod?: string;
  summary?: {
    uniqueVisitors?: number;
    visits?: number;
    pages?: number;
    hits?: number;
    bandwidth?: string;
  };
  topPages?: { url: string; hits?: number; bandwidth?: string; entry?: number; exit?: number }[];
  topCountries?: { country: string; pages?: number; hits?: number; bandwidth?: string }[];
  browsers?: { name: string; percent?: number }[];
  os?: { name: string; percent?: number }[];
  hours?: { hour: string; pages?: number; hits?: number; bandwidth?: string }[];
};

function toNumber(input?: string | null): number | undefined {
  if (!input) return undefined;
  const m = String(input).replace(/[^0-9.]/g, "");
  return m ? Number(m) : undefined;
}

function text(el: Element | null | undefined): string {
  return (el?.textContent || "").trim();
}

export function parseAwstatsHTML(html: string): AwstatsData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const data: AwstatsData = { summary: {} };

  data.site = doc.title || undefined;

  // Last Update / Reported period (fallback to regex)
  const bodyText = doc.body?.textContent || "";
  const luMatch = bodyText.match(/Last\s+Update\s*:?\s*([^\n]+)/i);
  if (luMatch) data.lastUpdate = luMatch[1].trim();
  const rpMatch = bodyText.match(/Reported\s+period\s*:?\s*([^\n]+)/i);
  if (rpMatch) data.reportedPeriod = rpMatch[1].trim();

  // Try to locate the summary table (labels like Unique visitors / Number of visits / Pages / Hits / Bandwidth)
  const tables = Array.from(doc.querySelectorAll("table"));
  const isSummaryTable = (tbl: HTMLTableElement) => {
    const txt = tbl.textContent?.toLowerCase() || '';
    return txt.includes('unique visitors') && txt.includes('number of visits');
  };
  const summaryTable = tables.find(t => isSummaryTable(t as HTMLTableElement));
  if (summaryTable) {
    const rows = Array.from(summaryTable.querySelectorAll("tr"));
    rows.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll("th,td"));
      if (cells.length >= 2) {
        const key = text(cells[0]).toLowerCase();
        const val = text(cells[1]);
        if (key.includes("unique") && key.includes("visitor")) data.summary!.uniqueVisitors = toNumber(val);
        else if (key.includes("number of visits") || key === "visits") data.summary!.visits = toNumber(val);
        else if (key.startsWith("pages")) data.summary!.pages = toNumber(val);
        else if (key.startsWith("hits")) data.summary!.hits = toNumber(val);
        else if (key.startsWith("bandwidth")) data.summary!.bandwidth = val;
      }
    });
  }

  // Helper to detect table by header keywords
  function matchHeader(tbl: HTMLTableElement, includes: string[]): boolean {
    const ths = Array.from(tbl.querySelectorAll("tr th"));
    const headerText = ths.map(th => text(th).toLowerCase()).join("|");
    return includes.every(k => headerText.includes(k));
  }

  // Top Pages
  const pagesTable = tables.find(t => matchHeader(t as HTMLTableElement, ["url"]) && matchHeader(t as HTMLTableElement, ["hits"])) as HTMLTableElement | undefined;
  if (pagesTable) {
    const rows = Array.from(pagesTable.querySelectorAll("tr")).slice(1); // skip header
    data.topPages = rows.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length < 2) return null;
      const url = text(tds[0]);
      const hits = toNumber(text(tds.find(td => td.textContent?.toLowerCase().includes("hit")) || tds[1]));
      const bwCell = tds.find(td => td.textContent?.toLowerCase().includes("b") && td.textContent?.toLowerCase().includes("kb") || td.textContent?.toLowerCase().includes("mb") || td.textContent?.toLowerCase().includes("gb"));
      const bandwidth = text(bwCell || null);
      return { url, hits, bandwidth };
    }).filter(Boolean) as AwstatsData["topPages"];
  }

  // Countries
  const countriesTable = tables.find(t => matchHeader(t as HTMLTableElement, ["country"])) as HTMLTableElement | undefined;
  if (countriesTable) {
    const rows = Array.from(countriesTable.querySelectorAll("tr")).slice(1);
    data.topCountries = rows.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length === 0) return null;
      const country = text(tds[0]).replace(/\s+\(.+?\)$/, '');
      const pages = toNumber(text(tds.find(td => td.textContent?.toLowerCase().includes("page")) || null));
      const hits = toNumber(text(tds.find(td => td.textContent?.toLowerCase().includes("hit")) || null));
      const bandwidth = text(tds.find(td => /kb|mb|gb/i.test(td.textContent || '')) || null);
      return { country, pages, hits, bandwidth };
    }).filter(Boolean) as AwstatsData["topCountries"];
  }

  // Browsers
  const browsersTable = tables.find(t => (t.textContent || '').toLowerCase().includes('browsers')) as HTMLTableElement | undefined;
  if (browsersTable) {
    const rows = Array.from(browsersTable.querySelectorAll("tr")).slice(1);
    data.browsers = rows.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length === 0) return null;
      const name = text(tds[0]).replace(/\s+\(.+?\)$/, '');
      const percent = toNumber(text(tds.find(td => td.textContent?.includes('%')) || null));
      return { name, percent };
    }).filter(Boolean) as AwstatsData["browsers"];
  }

  // Operating Systems
  const osTable = tables.find(t => (t.textContent || '').toLowerCase().includes('operating systems')) as HTMLTableElement | undefined;
  if (osTable) {
    const rows = Array.from(osTable.querySelectorAll("tr")).slice(1);
    data.os = rows.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length === 0) return null;
      const name = text(tds[0]).replace(/\s+\(.+?\)$/, '');
      const percent = toNumber(text(tds.find(td => td.textContent?.includes('%')) || null));
      return { name, percent };
    }).filter(Boolean) as AwstatsData["os"];
  }

  return data;
}
