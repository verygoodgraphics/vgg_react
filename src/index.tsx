import { useRef } from 'react';
import { useEffect } from 'react';
import { RefObject, MutableRefObject } from 'react';

type VggRunnerOnloadFunction = (wasmInstance: any) => void;

interface VggRunnerProps {
  token: string,
  width: number,
  height: number,
  onload?: VggRunnerOnloadFunction,
}

const host = 'http://s3.vgg.cool/production/';

export default function VggRunner({ token, width, height, onload }: VggRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wasmInstanceRef = useRef<any>(null);
  const initWasmRef = useRef(false);

  useEffect(() => {
    if (initWasmRef.current) {
      return;
    }
    initWasmRef.current = true;

    fetchVggCode(containerRef, canvasRef, wasmInstanceRef, width, height, onload);
    fetchVggFile(wasmInstanceRef, token);

  }, [token]);

  return (
    <div ref={containerRef}>
      <canvas ref={canvasRef} tabIndex={-1} style={{ backgroundColor: 'black', width: '800px', height: '600px', }} />
    </div>
  );
}

function fetchVggCode(containerRef: RefObject<HTMLDivElement>, canvasRef: RefObject<HTMLCanvasElement>,
  wasmInstanceRef: MutableRefObject<any>, width: number, height: number,
  onload?: VggRunnerOnloadFunction) {
  // fetch js
  const wasmHost = `${host}/runtime`;
  const script = document.createElement('script');
  script.src = `${wasmHost}/runtime.js`;
  script.async = true;
  script.onload = () => {
    const createModule =
      // @ts-ignore
      window.createModule ||
      (() => {
        return Promise.reject('Failed to load VGG runtime!');
      });

    // create wasm instance
    console.log('#vgg, create wasm instance, canvas is: ', canvasRef.current);
    createModule({
      noInitialRun: true,
      canvas: canvasRef.current,
      locateFile: function (path: string, prefix: string) {
        if (path.endsWith('.data')) {
          return wasmHost + '/' + path;
        }
        return prefix + path;
      },
    }).then((Module: any) => {
      wasmInstanceRef.current = Module;
      if (onload) {
        onload(wasmInstanceRef.current);
      }

      console.log('#vgg, call emscripten_main');
      wasmInstanceRef.current.ccall(
        'emscripten_main',
        "void",
        ['number', 'number'],
        [{ width }, { height }],
      );
    }).catch((e: any) => {
      console.error(e);
    });
  };

  containerRef.current?.appendChild(script);
  canvasRef.current?.addEventListener('mousedown', (e: any) => e.target.focus());
}

async function fetchVggFile(wasmInstanceRef: RefObject<any>, token: string) {
  if (!token) {
    return;
  }
  try {
    const url = `${host}/api/work/getWorkByToken/${token}`
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return loadWork(wasmInstanceRef, data.name, `${host}${data.url}`);
    }
  } catch (err) {
    console.log(`Failed to load work by token: ${err}`)
  }
}

async function loadWork(wasmInstanceRef: RefObject<any>, name: string, url: string) {
  if (!name || !url) {
    return;
  }
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  while (!wasmInstanceRef.current) {
    await sleep(30);
  }
  fetch(url).then((res) => {
    if (res.ok) {
      return res.arrayBuffer();
    }
    throw new Error(res.statusText);
  }).then((buf) => {
    const data = new Uint8Array(buf);
    console.log('#vgg, call load_file_from_mem');
    if (!wasmInstanceRef.current.ccall(
      'load_file_from_mem',
      'boolean', // return type
      ['string', 'array', 'number'], // argument types
      [name, data, data.length],)) {
      throw new Error('load failed!');
    }
  }).catch((err) => {
    console.error(`Failed to load work: ${err.message}`);
  });
}

// function runVgg() {
// }
// function loadVggFile() {
// }

export type { VggRunnerProps, VggRunnerOnloadFunction }