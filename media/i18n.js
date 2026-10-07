'use strict';
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else window.AImlearningI18n = factory();
})(function () {
  const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let cachedDictionary, fragments;
  function text(value, language, dictionary = {}) {
    if (language !== 'en' || typeof value !== 'string') return value;
    const received = /(?:Recibido|Received): /.exec(value);
    if (received) return text(value.slice(0, received.index), language, dictionary) + 'Received: ' + value.slice(received.index + received[0].length);
    if (Object.hasOwn(dictionary, value)) return dictionary[value];
    const trimmed = value.trim();
    if (Object.hasOwn(dictionary, trimmed)) return value.replace(trimmed, dictionary[trimmed]);
    if (cachedDictionary !== dictionary) {
      cachedDictionary = dictionary;
      const keys = Object.keys(dictionary).filter(key => key.length >= 12).sort((a, b) => b.length - a.length);
      fragments = keys.length ? new RegExp(keys.map(escaped).join('|'), 'g') : null;
    }
    const result = fragments ? value.replace(fragments, match => dictionary[match]) : value;
    return result.replace(/\b(\d+) de (\d+) (misiones|proyectos|etapas)\b/g, (_, current, total, unit) => `${current} of ${total} ${({misiones:'missions',proyectos:'projects',etapas:'stages'})[unit]}`)
      .replace(/\bEtapa (\d+) de (\d+)\b/g, 'Stage $1 of $2')
      .replace(/\b(\d+) misiones\b/g, '$1 missions')
      .replace(/^(\s*)(En|Copiar:|Comprobar:|Listo|Pendiente)(?=\s|$)/, (_, space, label) => space + ({En:'In','Copiar:':'Copy:','Comprobar:':'Check:','Listo':'Ready','Pendiente':'Pending'})[label]);
  }
  const preserved = new Set(['tests', 'code', 'input', 'output', 'expected', 'args', 'command', 'commands', 'docs', 'id', 'track', 'kind', 'filename', 'answer', 'prerequisites', 'projectPrerequisites', 'hash', 'scaffoldHash', 'location']);
  function content(value, language, dictionary, key = '') {
    if (preserved.has(key)) return value;
    if (typeof value === 'string') return text(value, language, dictionary);
    if (Array.isArray(value)) return value.map(item => content(item, language, dictionary, key));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, content(item, language, dictionary, name)]));
    return value;
  }
  function apply(element, data) {
    const language = data.language || 'es';
    const dictionary = window.AImlearningEnglish || {};
    document.documentElement.lang = language;
    const target = element.querySelector('.topbar') || element.querySelector('.sidebar-content');
    if (target && !target.querySelector('#language')) {
      const group = document.createElement('div'); group.className = 'language-control';
      group.title = language === 'en' ? 'Exercise filenames, commands and required output stay unchanged.' : 'Los archivos, comandos y salidas exigidas por los ejercicios no cambian.';
      const label = document.createElement('label'); label.htmlFor = 'language'; label.textContent = language === 'en' ? 'Language' : 'Idioma';
      const select = document.createElement('select'); select.id = 'language'; select.disabled = Boolean(data.busy);
      for (const [value, name] of [['es', 'Español'], ['en', 'English']]) { const option = document.createElement('option'); option.value = value; option.textContent = name; option.selected = value === language; select.append(option); }
      group.append(label, select); target.append(group);
    }
    if (language !== 'en') return;
    // The host already localizes curriculum text. Do not translate it twice:
    // a second pass could change required output literals embedded in a lesson.
    const authored = new Set();
    const collect = value => {
      if (typeof value === 'string') authored.add(value.trim());
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    for (const key of ['missions', 'projects', 'tracks', 'gitSteps', 'nextMission', 'nextProject', 'projectCommands', 'projectChecks', 'projectEnvironment', 'commands', 'badges', 'rank']) collect(data[key]);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement.closest('code,pre,textarea,.dialogue p,#language,[data-preserve-text]')) continue;
      if (!authored.has(node.nodeValue.trim())) node.nodeValue = text(node.nodeValue, language, dictionary);
    }
    for (const node of element.querySelectorAll('[placeholder],[aria-label],[title]')) {
      for (const name of ['placeholder', 'aria-label', 'title']) if (node.hasAttribute(name)) node.setAttribute(name, text(node.getAttribute(name), language, dictionary));
    }
  }
  return { text, content, apply };
});
