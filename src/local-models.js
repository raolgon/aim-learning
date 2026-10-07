'use strict';

const { linkAbort,throwIfCancelled,abortable }=require('./tutor-request');
const { instructionsFor, RESPONSE_SCHEMA } = require('./tutor');

function localBase(raw, provider) {
  let url;
  try { url = new URL(String(raw).trim()); }
  catch { throw new Error('Escribe una URL local válida, por ejemplo http://127.0.0.1:11434.'); }
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password || url.search || url.hash) {
    throw new Error('Por ahora solo se permiten servidores HTTP en este equipo: localhost, 127.0.0.1 o [::1], sin credenciales en la URL.');
  }
  const path = url.pathname.replace(/\/+$/, '');
  if (provider === 'laya') {
    if (path && !['/v1', '/v1/systemone'].includes(path)) throw new Error('Para Laya usa la dirección base, sin rutas adicionales.');
  } else if (provider === 'ollama') {
    if (path) throw new Error('Para Ollama usa la dirección base, sin /api ni /v1.');
  } else if (path && path !== '/v1') {
    throw new Error('Para un servidor compatible usa la dirección base o una URL terminada en /v1.');
  }
  return `${url.origin}${provider === 'compatible' ? '/v1' : ''}`;
}

async function requestJson(url, options = {}, fetchImpl = fetch, timeout = 10000, signal) {
  const controller = new AbortController();
  const unlink=linkAbort(signal,controller);
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await abortable(fetchImpl(url, { ...options, signal: controller.signal }),controller.signal);
    if (!response.ok) throw new Error(`El servidor local respondió HTTP ${response.status}.`);
    if (response.headers?.get('content-length') && Number(response.headers.get('content-length')) > 131072) throw new Error('La respuesta del servidor local es demasiado grande.');
    if (!response.body || !response.body.getReader) return await abortable(response.json(),controller.signal);
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await abortable(reader.read(),controller.signal);
      if (done) break;
      total += value.length;
      if (total > 131072) { await reader.cancel(); throw new Error('La respuesta del servidor local es demasiado grande.'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    throwIfCancelled(signal);
    if (controller.signal.aborted || error.name === 'AbortError') throw new Error('El servidor local tardó demasiado. Comprueba que esté iniciado y vuelve a intentar.');
    if (error instanceof TypeError) throw new Error('No se pudo conectar al servidor local. Comprueba la dirección y que esté en ejecución.');
    throw error;
  } finally { clearTimeout(timer);unlink(); }
}

async function listLocalModels(provider, rawBase, fetchImpl = fetch) {
  const base = localBase(rawBase, provider);
  const result = await requestJson(`${base}${provider === 'ollama' ? '/api/tags' : '/models'}`, {}, fetchImpl);
  const values = provider === 'ollama' ? result.models : result.data;
  if (!Array.isArray(values)) throw new Error('El servidor no devolvió una lista de modelos compatible.');
  const models = values.map(item => ({ id: provider === 'ollama' ? item.name || item.model : item.id })).filter(item => typeof item.id === 'string' && item.id.trim()).slice(0, 100);
  if (!models.length) throw new Error(provider === 'ollama' ? 'Ollama está activo, pero no tiene modelos descargados. Descarga uno desde la terminal con ollama pull NOMBRE_DEL_MODELO.' : 'El servidor local está activo, pero no ofrece modelos. Carga uno y vuelve a conectar.');
  return { base, models };
}

async function sendLocal(provider, base, model, context, fetchImpl = fetch, signal) {
  const checked = localBase(base, provider);
  const messages = [{ role: 'system', content: instructionsFor(context.language) }, { role: 'user', content: JSON.stringify(context) }];
  const native = provider === 'ollama';
  const body = native
    ? { model, messages, stream: false, think: false, format: RESPONSE_SCHEMA, options: { num_predict: 450, num_ctx: 8192 } }
    : { model, messages, stream: false, max_tokens: 450 };
  const response = await requestJson(`${checked}${native ? '/api/chat' : '/chat/completions'}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }, fetchImpl, 120000, signal);
  return native ? String(response.message?.content || '') : String(response.choices?.[0]?.message?.content || '');
}

module.exports = { localBase, listLocalModels, sendLocal, requestJson };
