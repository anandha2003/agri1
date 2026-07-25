/**
 * Google Crops Service
 * Loads crop data from Google Sheets (published) or verified Google-sourced fallback data
 */

const GoogleCropsService = {
  async fetchFromGoogleSheet(sheetId) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Google Sheet not accessible');

    const text = await response.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
    const rows = json.table.rows;

    return rows.map((row, index) => {
      const cell = (i) => (row.c[i] && row.c[i].v != null ? String(row.c[i].v) : '');
      return {
        id: cell(0) || String(index + 1),
        name: cell(1),
        season: cell(2),
        water: cell(3),
        soil: cell(4),
        temperature: cell(5),
        rainfall: cell(6),
        yield: cell(7),
        production: cell(8),
        area: cell(9),
        region: cell(10),
        tips: cell(11),
        source: cell(12) || 'Google Sheets',
        googleQuery: cell(13) || `${cell(1)} cultivation India`
      };
    }).filter(crop => crop.name);
  },

  async loadCrops() {
    if (GOOGLE_CONFIG.USE_GOOGLE_SHEET && GOOGLE_CONFIG.SHEET_ID) {
      try {
        const sheetCrops = await this.fetchFromGoogleSheet(GOOGLE_CONFIG.SHEET_ID);
        if (sheetCrops.length > 0) {
          Database.saveCrops(sheetCrops, 'Google Sheets');
          return { crops: sheetCrops, source: 'Google Sheets (Live)' };
        }
      } catch (err) {
        console.warn('Google Sheet fetch failed, using verified fallback data.', err);
      }
    }

    const crops = GOOGLE_CROPS_DATA;
    Database.saveCrops(crops, 'Google Agriculture Data');
    return { crops, source: 'Google Agriculture Data (Verified)' };
  },

  openGoogleSearch(query) {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener');
  },

  getGoogleSourceUrl(cropName) {
    return `https://www.google.com/search?q=${encodeURIComponent(cropName + ' cultivation India site:agricoop.gov.in OR site:agrifarming.in')}`;
  }
};
