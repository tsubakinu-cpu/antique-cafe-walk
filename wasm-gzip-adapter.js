/* Only the local Godot WASM request is adapted. All other fetches are unchanged. */
(() => {
  const rawFetch = window.fetch.bind(window);
  const wasmURL = new URL('index.wasm', document.baseURI);
  const compressedURL = new URL('index.wasm.gz', document.baseURI);
  window.fetch = function(input, init) {
    const requestedURL = new URL(input instanceof Request ? input.url : String(input), document.baseURI);
    if (requestedURL.origin !== location.origin || requestedURL.href !== wasmURL.href) {
      return rawFetch(input, init);
    }
    if (typeof DecompressionStream !== 'function') {
      return Promise.reject(new Error('このブラウザは圧縮されたゲームの読み込みに対応していません。新しい Chrome、Safari、Firefox で開いてください。'));
    }
    return rawFetch(compressedURL.href, init).then(response => {
      if (!response.ok) return response;
      if (!response.body) throw new Error('ゲームの読み込みに失敗しました。ページを再読み込みしてください。');
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/wasm');
      headers.set('Content-Length', '37700666');
      headers.delete('Content-Encoding');
      return new Response(response.body.pipeThrough(new DecompressionStream('gzip')), {
        status: response.status, statusText: response.statusText, headers
      });
    });
  };
})();
