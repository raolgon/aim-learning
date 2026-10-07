'use strict';
const dictionary = { ...require('./locales/en.json'), ...require('./locales/en-overrides.json') };
const shared = require('../media/i18n');
const text = (value, language) => shared.text(value, language, dictionary);
const content = (value, language) => shared.content(value, language, dictionary);
function state(value, language) {
  const clone = structuredClone(value);
  const records = [...Object.values(clone.records || {}), ...Object.values(clone.projectRecords || {}), ...Object.values(clone.gitRecords?.steps || {})];
  for (const record of records) {
    if (record.verification) {
      for (const key of ['summary', 'note']) if (record.verification[key]) record.verification[key] = text(record.verification[key], language);
      for (const item of record.verification.cases || []) {
        item.name = text(item.name, language);
        item.detail = text(item.detail, language);
      }
      if (record.verification.findings) record.verification.findings = record.verification.findings.map(item => text(item, language));
      if (record.verification.github?.findings) record.verification.github.findings = record.verification.github.findings.map(item => text(item, language));
    }
    if (typeof record.hint === 'string') record.hint = text(record.hint, language);
    if (record.hints && typeof record.hints === 'object') for (const key of Object.keys(record.hints)) record.hints[key] = text(record.hints[key], language);
    for (const turn of record.dialogue || []) {
      if (turn.role === 'professor' && !/Tutor de IA|AI tutor/.test(turn.source || '')) turn.text = text(turn.text, language);
      if (turn.source) turn.source = text(turn.source, language);
    }
  }
  return clone;
}
function documentation(url, language) { return language === 'en' ? url.replace('https://learn.microsoft.com/es-es/', 'https://learn.microsoft.com/en-us/') : url; }
module.exports = { dictionary, text, content, state, documentation };
