const SPREADSHEET_ID = 'PEGAR_ID_DE_GOOGLE_SHEETS';

const SHEETS = {
  profesores: 'Profesores',
  preceptores: 'Preceptores',
  cursos: 'Cursos',
  materias: 'Materias',
  motivos: 'Motivos',
  profesoresMaterias: 'Profesores_Materias',
  registros: 'Registros'
};

const REGISTROS_HEADERS = ['id', 'fecha', 'hora', 'preceptor', 'profesor_ausente', 'materia', 'curso', 'turno', 'motivo', 'observaciones', 'created_at'];

const ACTIONS = {
  profesores: getProfesores,
  getProfesores: getProfesores,
  preceptores: getPreceptores,
  getPreceptores: getPreceptores,
  cursos: getCursos,
  getCursos: getCursos,
  materias: getMaterias,
  getMaterias: getMaterias,
  motivos: getMotivos,
  getMotivos: getMotivos,
  profesoresMaterias: getProfesoresMaterias,
  getProfesoresMaterias: getProfesoresMaterias,
  registros: getRegistros,
  getRegistros: getRegistros,
  dashboard: getDashboard,
  getDashboard: getDashboard
};

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    const request = parseRequest(e);
    const action = request.action || 'dashboard';

    if (method === 'POST' && (action === 'crearRegistro' || action === 'create' || action === 'crear_registro')) {
      return jsonResponse({ ok: true, data: crearRegistro(request.data) });
    }

    if (ACTIONS[action]) {
      return jsonResponse({ ok: true, data: ACTIONS[action]() });
    }

    return jsonResponse({ ok: false, error: 'Action no soportada: ' + action }, 400);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || String(error) }, 500);
  }
}

function getProfesores() { return getCatalogo(SHEETS.profesores); }
function getPreceptores() { return getCatalogo(SHEETS.preceptores); }
function getCursos() { return getCatalogo(SHEETS.cursos); }
function getMaterias() { return getCatalogo(SHEETS.materias); }
function getMotivos() { return getCatalogo(SHEETS.motivos); }
function getProfesoresMaterias() { return getCatalogo(SHEETS.profesoresMaterias, { activeOnly: true }); }

function getRegistros() {
  const sheet = getRegistrosSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0].map(function(header) { return String(header).trim(); });
  return rows.slice(1)
    .filter(function(row) { return row.some(function(cell) { return cell !== '' && cell !== null; }); })
    .map(function(row) { return rowToObject(headers, row); })
    .sort(function(a, b) { return String(b.created_at || '').localeCompare(String(a.created_at || '')); });
}

function crearRegistro(data) {
  const payload = data || {};
  ['fecha', 'hora', 'preceptor', 'profesor_ausente', 'materia', 'curso', 'turno', 'motivo'].forEach(function(field) {
    if (!payload[field]) throw new Error('Campo requerido faltante: ' + field);
  });

  const record = {
    id: Utilities.getUuid(),
    fecha: normalizeIncomingValue(payload.fecha),
    hora: normalizeIncomingValue(payload.hora),
    preceptor: normalizeIncomingValue(payload.preceptor),
    profesor_ausente: normalizeIncomingValue(payload.profesor_ausente),
    materia: normalizeIncomingValue(payload.materia),
    curso: normalizeIncomingValue(payload.curso),
    turno: normalizeIncomingValue(payload.turno),
    motivo: normalizeIncomingValue(payload.motivo),
    observaciones: normalizeIncomingValue(payload.observaciones || ''),
    created_at: normalizeIncomingValue(payload.created_at) || new Date().toISOString()
  };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getRegistrosSheet().appendRow(REGISTROS_HEADERS.map(function(header) { return record[header]; }));
  } finally {
    lock.releaseLock();
  }
  return record;
}

function getDashboard() {
  const registros = getRegistros();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const dashboard = { total_registros: registros.length, registros_hoy: 0, por_turno: {}, por_motivo: {}, por_curso: {}, ultimos_registros: registros.slice(0, 10) };
  registros.forEach(function(registro) {
    if (String(registro.fecha).slice(0, 10) === today) dashboard.registros_hoy += 1;
    incrementCounter(dashboard.por_turno, registro.turno || 'Sin turno');
    incrementCounter(dashboard.por_motivo, registro.motivo || 'Sin motivo');
    incrementCounter(dashboard.por_curso, registro.curso || 'Sin curso');
  });
  return dashboard;
}

function getCatalogo(sheetName, options) {
  const config = options || {};
  const rows = getSheet(sheetName).getDataRange().getValues();
  if (rows.length === 0) return [];
  const firstRow = rows[0].map(function(cell) { return String(cell).trim().toLowerCase(); });
  const hasHeader = firstRow.indexOf('id') !== -1 || firstRow.indexOf('nombre') !== -1 || firstRow.indexOf('valor') !== -1;
  if (!hasHeader) return rows.map(function(row) { return normalizeCell(row[0]); }).filter(function(value) { return value !== ''; });
  const headers = rows[0].map(function(header) { return String(header).trim(); });
  var records = rows.slice(1)
    .filter(function(row) { return row.some(function(cell) { return cell !== '' && cell !== null; }); })
    .map(function(row) { return rowToObject(headers, row); });

  if (config.activeOnly) {
    records = records.filter(function(record) {
      return String(record.activo || '').trim().toUpperCase() === 'SI';
    });
  }

  return records;
}

function parseRequest(e) {
  const params = e && e.parameter ? e.parameter : {};
  let body = {};
  if (e && e.postData && e.postData.contents) body = parseBody(e.postData.contents, e.postData.type);
  const merged = mergeObjects(params, body);
  return { action: merged.action || params.action || body.action, data: merged.data && typeof merged.data === 'object' ? merged.data : merged };
}

function parseBody(contents, contentType) {
  const raw = String(contents || '').trim();
  if (!raw) return {};
  if (raw.charAt(0) === '{' || raw.charAt(0) === '[' || String(contentType).indexOf('application/json') !== -1 || String(contentType).indexOf('text/plain') !== -1) {
    try { return JSON.parse(raw); } catch (error) { if (String(contentType).indexOf('text/plain') !== -1) throw new Error('Body text/plain invalido. Enviar JSON valido.'); }
  }
  return raw.split('&').reduce(function(acc, pair) {
    const parts = pair.split('=');
    const key = decodeURIComponent(parts[0] || '').trim();
    const value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
    if (key) acc[key] = value;
    return acc;
  }, {});
}

function getSpreadsheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PEGAR_ID_DE_GOOGLE_SHEETS') throw new Error('Configurar SPREADSHEET_ID con el ID de la planilla.');
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('No existe la hoja requerida: ' + sheetName);
  return sheet;
}

function getRegistrosSheet() {
  const sheet = getSheet(SHEETS.registros);
  ensureHeaders(sheet, REGISTROS_HEADERS);
  return sheet;
}

function ensureHeaders(sheet, expectedHeaders) {
  const range = sheet.getRange(1, 1, 1, expectedHeaders.length);
  const currentHeaders = range.getValues()[0];
  if (currentHeaders.every(function(value) { return value === '' || value === null; })) {
    range.setValues([expectedHeaders]);
    sheet.setFrozenRows(1);
    return;
  }
  const normalizedCurrent = currentHeaders.map(function(value) { return String(value).trim(); });
  const missing = expectedHeaders.filter(function(header) { return normalizedCurrent.indexOf(header) === -1; });
  if (missing.length > 0) throw new Error('La hoja Registros no tiene las columnas esperadas. Faltan: ' + missing.join(', '));
}

function rowToObject(headers, row) {
  return headers.reduce(function(acc, header, index) {
    if (header) acc[header] = normalizeCell(row[index]);
    return acc;
  }, {});
}

function normalizeCell(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (value === null || typeof value === 'undefined') return '';
  return value;
}

function normalizeIncomingValue(value) {
  if (value === null || typeof value === 'undefined') return '';
  return String(value).trim();
}

function incrementCounter(target, key) { target[key] = (target[key] || 0) + 1; }

function mergeObjects(left, right) {
  const output = {};
  Object.keys(left || {}).forEach(function(key) { output[key] = left[key]; });
  Object.keys(right || {}).forEach(function(key) { output[key] = right[key]; });
  return output;
}

function jsonResponse(payload, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(mergeObjects({ ok: Boolean(payload.ok), status: statusCode || (payload.ok ? 200 : 500), cors: { allowed_origin: '*', recommended_content_type: 'text/plain;charset=utf-8' } }, payload))).setMimeType(ContentService.MimeType.JSON);
}
