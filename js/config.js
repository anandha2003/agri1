/**
 * Google Data Configuration
 * To use your own Google Sheet:
 * 1. Create a Google Sheet with columns: name, season, water, soil, temperature, rainfall, yield, production, area, region, tips, source
 * 2. File → Share → Publish to web → CSV or keep as Sheet
 * 3. Copy the Sheet ID from the URL and paste below
 * 4. Set USE_GOOGLE_SHEET to true
 */
const GOOGLE_CONFIG = {
  USE_GOOGLE_SHEET: false,
  SHEET_ID: '',
  CROPS_DATA_VERSION: '2.0'
};
