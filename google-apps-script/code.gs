// @ts-nocheck
/**
 * Maduranga & Bimali – Wedding Invitation backend (Google Apps Script)
 *
 * Saves RSVP responses and Wishes into separate tabs of the spreadsheet below.
 * Tabs and their header rows are created automatically on first use.
 *
 * Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone
 * Then put the /exec URL in .env as VITE_GOOGLE_APPS_SCRIPT_URL.
 */

var SPREADSHEET_ID = '1G437Uou1EjQh1WtdYyt3ray4gU52qapG38gbPSflhuw';

var SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Name', 'Phone', 'Attendance', 'Guests', 'Notes', 'Invited As'],
    widths: [170, 200, 140, 130, 80, 300, 200],
    toRow: function (p) {
      return [new Date(), p.name || '', p.phone || '', p.attendance || '', Number(p.guests) || 0, p.notes || '', p.invitedAs || ''];
    },
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Timestamp', 'Name', 'Message'],
    widths: [170, 200, 500],
    toRow: function (p) {
      return [new Date(), p.name || '', p.message || ''];
    },
  },
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var payload = parsePayload_(e);
    var config = resolveSheetConfig_(payload.sheet);
    if (!config) {
      return jsonResponse_({ ok: false, error: 'Invalid sheet. Use "RSVP" or "Wishes".' });
    }

    var sheet = getOrCreateSheet_(config);
    sheet.appendRow(config.toRow(payload));

    return jsonResponse_({ ok: true, sheet: config.name, row: sheet.getLastRow() });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'Wedding form endpoint is running.' });
}

/** Run once from the editor to create both tabs with headers (optional – they are also created on first submit). */
function setupSheets() {
  getOrCreateSheet_(SHEETS.RSVP);
  getOrCreateSheet_(SHEETS.WISHES);
}

function resolveSheetConfig_(value) {
  var key = String(value || '').trim().toUpperCase();
  if (key === 'RSVP') return SHEETS.RSVP;
  if (key === 'WISHES' || key === 'WISH') return SHEETS.WISHES;
  return null;
}

function getOrCreateSheet_(config) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.name) || ss.insertSheet(config.name);

  if (sheet.getLastRow() === 0) {
    var header = sheet.getRange(1, 1, 1, config.headers.length);
    header
      .setValues([config.headers])
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground('#7a1f2b')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    for (var i = 0; i < config.widths.length; i++) {
      sheet.setColumnWidth(i + 1, config.widths[i]);
    }
  }
  return sheet;
}

function parsePayload_(e) {
  var params = (e && e.parameter) || {};
  if (Object.keys(params).length > 0) return params;

  var contents = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!contents) return {};

  try {
    return JSON.parse(contents);
  } catch (_err) {
    var out = {};
    contents.split('&').forEach(function (part) {
      if (!part) return;
      var idx = part.indexOf('=');
      var key = decodeURIComponent((idx >= 0 ? part.slice(0, idx) : part).replace(/\+/g, ' '));
      out[key] = decodeURIComponent((idx >= 0 ? part.slice(idx + 1) : '').replace(/\+/g, ' '));
    });
    return out;
  }
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
