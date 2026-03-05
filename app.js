const SHEETS_API_URL = '<PASTE_WEB_APP_URL_HERE>';
const POLL_INTERVAL_MS = 2000;
const MAX_POINTS = 60;
const MAX_TANK_HEIGHT_M = 6;
const TANK_LIQUID_TOP_Y = 90;
const TANK_LIQUID_HEIGHT_PX = 320;

const el = {
  connectionPill: document.getElementById('connectionPill'),
  connectionText: document.getElementById('connectionText'),
  lastTimestamp: document.getElementById('lastTimestamp'),
  oilLevel: document.getElementById('oilLevel'),
  waterLevel: document.getElementById('waterLevel'),
  sludgeLevel: document.getElementById('sludgeLevel'),
  oilVolume: document.getElementById('oilVolume'),
  waterVolume: document.getElementById('waterVolume'),
  sludgeVolume: document.getElementById('sludgeVolume'),
  totalVolume: document.getElementById('totalVolume'),
  pressure: document.getElementById('pressure'),
  temperature: document.getElementById('temperature'),
  oilLayer: document.getElementById('oilLayer'),
  waterLayer: document.getElementById('waterLayer'),
  sludgeLayer: document.getElementById('sludgeLayer'),
  oilLabel: document.getElementById('oilLabel'),
  waterLabel: document.getElementById('waterLabel'),
  sludgeLabel: document.getElementById('sludgeLabel'),
  tempAlarm: document.getElementById('tempAlarm'),
  pressureAlarm: document.getElementById('pressureAlarm'),
  oilAlarm: document.getElementById('oilAlarm'),
};

const trend = {
  labels: [],
  temperature: [],
  oilVolume: [],
};

const defaultThresholds = {
  temp_high: 80,
  pressure_high: 8,
  oil_high: 2.5,
};

let tempChart;
let oilChart;

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNum(value, digits = 2) {
  return `${toNumber(value).toFixed(digits)}`;
}

function setConnection(isConnected, text = 'Connected') {
  el.connectionPill.classList.toggle('connected', isConnected);
  el.connectionPill.classList.toggle('disconnected', !isConnected);
  el.connectionText.textContent = text;
}

function toPixels(meters) {
  const scaled = (clamp(toNumber(meters), 0, MAX_TANK_HEIGHT_M) / MAX_TANK_HEIGHT_M) * TANK_LIQUID_HEIGHT_PX;
  return scaled;
}

function updateTankLayers(data) {
  const sludgePx = toPixels(data.sludge_level_m);
  const waterPx = toPixels(data.water_level_m);
  const oilPx = toPixels(data.oil_level_m);

  const totalPx = sludgePx + waterPx + oilPx;
  const scaleDown = totalPx > TANK_LIQUID_HEIGHT_PX ? TANK_LIQUID_HEIGHT_PX / totalPx : 1;

  const sPx = sludgePx * scaleDown;
  const wPx = waterPx * scaleDown;
  const oPx = oilPx * scaleDown;

  const tankBottomY = TANK_LIQUID_TOP_Y + TANK_LIQUID_HEIGHT_PX;
  const sludgeY = tankBottomY - sPx;
  const waterY = sludgeY - wPx;
  const oilY = waterY - oPx;

  el.sludgeLayer.setAttribute('y', sludgeY);
  el.sludgeLayer.setAttribute('height', sPx);

  el.waterLayer.setAttribute('y', waterY);
  el.waterLayer.setAttribute('height', wPx);

  el.oilLayer.setAttribute('y', oilY);
  el.oilLayer.setAttribute('height', oPx);

  el.sludgeLabel.setAttribute('y', clamp(sludgeY + sPx / 2, TANK_LIQUID_TOP_Y + 12, tankBottomY - 6));
  el.waterLabel.setAttribute('y', clamp(waterY + wPx / 2, TANK_LIQUID_TOP_Y + 12, tankBottomY - 6));
  el.oilLabel.setAttribute('y', clamp(oilY + oPx / 2, TANK_LIQUID_TOP_Y + 12, tankBottomY - 6));
}

function updateKpi(data) {
  el.oilLevel.textContent = `${formatNum(data.oil_level_m)} m`;
  el.waterLevel.textContent = `${formatNum(data.water_level_m)} m`;
  el.sludgeLevel.textContent = `${formatNum(data.sludge_level_m)} m`;

  el.oilVolume.textContent = `${formatNum(data.oil_volume_m3)} m³`;
  el.waterVolume.textContent = `${formatNum(data.water_volume_m3)} m³`;
  el.sludgeVolume.textContent = `${formatNum(data.sludge_volume_m3)} m³`;
  el.totalVolume.textContent = `${formatNum(data.total_volume_m3)} m³`;

  el.pressure.textContent = `${formatNum(data.pressure_bar)} bar`;
  el.temperature.textContent = `${formatNum(data.temperature_c)} °C`;
  el.lastTimestamp.textContent = data.timestamp || '-';
}

function updateAlarms(data, thresholds) {
  el.tempAlarm.classList.toggle('active', toNumber(data.temperature_c) > toNumber(thresholds.temp_high));
  el.pressureAlarm.classList.toggle('active', toNumber(data.pressure_bar) > toNumber(thresholds.pressure_high));
  el.oilAlarm.classList.toggle('active', toNumber(data.oil_level_m) > toNumber(thresholds.oil_high));
}

function createLineChart(canvasId, label, color, values) {
  return new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: {
      labels: trend.labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          backgroundColor: `${color}22`,
          fill: true,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          labels: { color: '#c7dbff' },
        },
      },
      scales: {
        x: {
          ticks: { color: '#89a3cb', maxTicksLimit: 8 },
          grid: { color: 'rgba(135, 166, 210, 0.12)' },
        },
        y: {
          ticks: { color: '#89a3cb' },
          grid: { color: 'rgba(135, 166, 210, 0.12)' },
        },
      },
    },
  });
}

function updateTrends(data) {
  const label = new Date().toLocaleTimeString('en-GB', { hour12: false });
  trend.labels.push(label);
  trend.temperature.push(toNumber(data.temperature_c));
  trend.oilVolume.push(toNumber(data.oil_volume_m3));

  if (trend.labels.length > MAX_POINTS) {
    trend.labels.shift();
    trend.temperature.shift();
    trend.oilVolume.shift();
  }

  tempChart.update();
  oilChart.update();
}

async function fetchLatestData() {
  const response = await fetch(SHEETS_API_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload');
  }

  const merged = { ...defaultThresholds, ...payload };
  return {
    data: {
      timestamp: payload.timestamp || '',
      oil_level_m: toNumber(payload.oil_level_m),
      water_level_m: toNumber(payload.water_level_m),
      sludge_level_m: toNumber(payload.sludge_level_m),
      oil_volume_m3: toNumber(payload.oil_volume_m3),
      water_volume_m3: toNumber(payload.water_volume_m3),
      sludge_volume_m3: toNumber(payload.sludge_volume_m3),
      total_volume_m3: toNumber(payload.total_volume_m3),
      pressure_bar: toNumber(payload.pressure_bar),
      temperature_c: toNumber(payload.temperature_c),
    },
    thresholds: {
      temp_high: toNumber(merged.temp_high, defaultThresholds.temp_high),
      pressure_high: toNumber(merged.pressure_high, defaultThresholds.pressure_high),
      oil_high: toNumber(merged.oil_high, defaultThresholds.oil_high),
    },
  };
}

async function refreshData() {
  try {
    if (SHEETS_API_URL.includes('<PASTE_WEB_APP_URL_HERE>')) {
      throw new Error('Please set SHEETS_API_URL');
    }

    const { data, thresholds } = await fetchLatestData();
    updateKpi(data);
    updateTankLayers(data);
    updateAlarms(data, thresholds);
    updateTrends(data);

    setConnection(true, 'Connected');
  } catch (error) {
    console.error('Polling error:', error);
    setConnection(false, 'Disconnected');
  }
}

function init() {
  setConnection(false, 'No Data');
  tempChart = createLineChart('tempChart', 'Temperature (°C)', '#ff7f50', trend.temperature);
  oilChart = createLineChart('oilChart', 'Oil Volume (m³)', '#ffd166', trend.oilVolume);

  refreshData();
  setInterval(refreshData, POLL_INTERVAL_MS);
}

init();
