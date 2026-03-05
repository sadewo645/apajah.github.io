/**
 * Google Apps Script Web App endpoint for CST telemetry.
 * Sheet structure:
 *  - telemetry (row 1 header, latest row = newest data)
 * Optional config sheet:
 *  - key | value
 *  - temp_high | 80
 *  - pressure_high | 8
 *  - oil_high | 2.5
 */
function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var telemetrySheet = ss.getSheetByName('telemetry');
    if (!telemetrySheet) {
      return jsonOutput({ error: 'Sheet telemetry not found' });
    }

    var lastRow = telemetrySheet.getLastRow();
    var lastCol = telemetrySheet.getLastColumn();
    if (lastRow < 2) {
      return jsonOutput({ error: 'No telemetry data row found' });
    }

    var headers = telemetrySheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var values = telemetrySheet.getRange(lastRow, 1, 1, lastCol).getValues()[0];

    var data = {};
    for (var i = 0; i < headers.length; i++) {
      var key = String(headers[i]).trim();
      if (!key) continue;
      data[key] = values[i];
    }

    var thresholds = getThresholds(ss);

    var output = {
      timestamp: data.timestamp || '',
      oil_level_m: toNumber(data.oil_level_m),
      water_level_m: toNumber(data.water_level_m),
      sludge_level_m: toNumber(data.sludge_level_m),
      oil_volume_m3: toNumber(data.oil_volume_m3),
      water_volume_m3: toNumber(data.water_volume_m3),
      sludge_volume_m3: toNumber(data.sludge_volume_m3),
      total_volume_m3: toNumber(data.total_volume_m3),
      pressure_bar: toNumber(data.pressure_bar),
      temperature_c: toNumber(data.temperature_c),
      temp_high: thresholds.temp_high,
      pressure_high: thresholds.pressure_high,
      oil_high: thresholds.oil_high,
    };

    return jsonOutput(output);
  } catch (err) {
    return jsonOutput({ error: String(err) });
  }
}

function getThresholds(ss) {
  var fallback = {
    temp_high: 80,
    pressure_high: 8,
    oil_high: 2.5,
  };

  var cfg = ss.getSheetByName('config');
  if (!cfg || cfg.getLastRow() < 2) {
    return fallback;
  }

  var rows = cfg.getRange(2, 1, cfg.getLastRow() - 1, 2).getValues();
  var out = {
    temp_high: fallback.temp_high,
    pressure_high: fallback.pressure_high,
    oil_high: fallback.oil_high,
  };

  for (var i = 0; i < rows.length; i++) {
    var key = String(rows[i][0]).trim();
    var val = Number(rows[i][1]);
    if (!key || isNaN(val)) continue;
    if (key === 'temp_high' || key === 'pressure_high' || key === 'oil_high') {
      out[key] = val;
    }
  }

  return out;
}

function toNumber(value) {
  var n = Number(value);
  return isNaN(n) ? 0 : n;
}

function jsonOutput(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);

  // Some Apps Script runtimes support custom response headers on TextOutput.
  if (typeof output.setHeader === 'function') {
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  return output;
}
