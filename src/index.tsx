import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useEffect } from 'react';
import { RefObject, MutableRefObject } from 'react';
import React from 'react';

import { setVgg, getVggSdk } from '@verygoodgraphics/vgg-sdk';

type VggRunnerOnloadFunction = (wasmInstance: any) => void;

interface VggRunnerProps {
  token?: string;
  src?: string;
  width: number;
  height: number;
  canvasStyle?: object;
  onload?: VggRunnerOnloadFunction;
}

const apiHost = 'https://verygoodgraphics.com';
const runtimeBaseUrl = 'https://s3.vgg.cool/production/runtime/v23.07.18-5d6eee4';
const vggWasmModuleUrl = runtimeBaseUrl + '/vgg_runtime.js';

const VggRunner = forwardRef(
  (
    { token, src, width, height, canvasStyle = {}, onload }: VggRunnerProps,
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wasmInstanceRef = useRef<any>(null);
    const initWasmRef = useRef(false);

    useEffect(() => {
      if (initWasmRef.current) {
        return;
      }
      initWasmRef.current = true;

      setupVggEngine(
        containerRef,
        canvasRef,
        wasmInstanceRef,
        width,
        height,
        onload
      );

      if (src) {
        fetchVggWorkFileByUrlAndLoadIt(wasmInstanceRef, 'vgg file', src);
      } else if (token) {
        getVggWorkUrlByToken(wasmInstanceRef, token);
      } else {
        console.error(
          'Cannot resolve file url, either src or token should be provided'
        );
      }
    }, [token, width, height, onload]);

    useImperativeHandle(ref, () => ({
      async getSdk(): Promise<any> {
        return await getVggSdk();
      },
    }));

    return (
      <div ref={containerRef}>
        <canvas
          ref={canvasRef}
          tabIndex={-1}
          style={{ ...canvasStyle, display: 'block' }}
        />
      </div>
    );
  }
);

function setupVggEngine(
  containerRef: RefObject<HTMLDivElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  wasmInstanceRef: MutableRefObject<any>,
  width: number,
  height: number,
  onload?: VggRunnerOnloadFunction
): void {
  // fetch vgg wasm js file
  const script = document.createElement('script');
  script.src = `${vggWasmModuleUrl}`;
  script.async = true;
  script.onload = (): void => {
    const _vgg_createWasmInstance =
      // @ts-ignore
      window._vgg_createWasmInstance ||
      ((): Promise<void> => {
        return Promise.reject('Failed to load VGG runtime!');
      });

    // create vgg runtime wasm instance
    _vgg_createWasmInstance({
      noInitialRun: true,
      canvas: canvasRef.current,
      locateFile: function (path: string, prefix: string) {
        if (path.endsWith('.data')) {
          return runtimeBaseUrl + '/' + path;
        }
        return prefix + path;
      },
    })
      .then((Module: any) => {
        wasmInstanceRef.current = Module;
        // todo: set env
        setVgg(wasmInstanceRef.current);
        if (onload) {
          getVggSdk().then(sdk => {
            onload(sdk);
          });
        }

        // run vgg
        wasmInstanceRef.current.ccall(
          'emscripten_main',
          'void',
          ['number', 'number'],
          [width, height]
        );
      })
      .catch((e: any) => {
        console.error(e);
      });
  };

  containerRef.current?.appendChild(script);
  canvasRef.current?.addEventListener('mousedown', (e: any) =>
    e.target.focus()
  );
}

async function getVggWorkUrlByToken(
  wasmInstanceRef: RefObject<any>,
  token: string
): Promise<void> {
  if (!token) {
    return;
  }
  try {
    const url = `${apiHost}/api/work/getWorkByToken/${token}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      fetchVggWorkFileByUrlAndLoadIt(
        wasmInstanceRef,
        data.name,
        `${apiHost}${data.url}`
      );
    }
  } catch (err) {
    console.error(`Failed to load vgg daruma file by token: ${err}`);
  }
}

async function fetchVggWorkFileByUrlAndLoadIt(
  wasmInstanceRef: RefObject<any>,
  name: string,
  url: string
): Promise<void> {
  if (!name || !url) {
    return;
  }
  const sleep = (ms: number): Promise<void> =>
    new Promise(res => setTimeout(res, ms));
  while (!wasmInstanceRef.current) {
    await sleep(30);
  }
  fetch(url)
    .then(res => {
      if (res.ok) {
        return res.arrayBuffer();
      }
      throw new Error(res.statusText);
    })
    .then(buf => {
      const data = new Int8Array(buf);
      if (
        !wasmInstanceRef.current.ccall(
          'load_file_from_mem',
          'boolean', // return type
          ['string', 'array', 'number'], // argument types
          [name, data, data.length]
        )
      ) {
        throw new Error('load failed!');
      }
    })
    .catch(err => {
      console.error(`Failed to load vgg daruma file: ${err.message}`);
    });
}

export default VggRunner;
