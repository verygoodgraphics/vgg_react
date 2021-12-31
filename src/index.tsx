import React from 'react';

export interface IVGGLoaderProps {
  width?: number;
  height?: number;
  token?: string;
}

interface IVGGLoaderState {}

export default class VGGLoader extends React.Component<
  IVGGLoaderProps,
  IVGGLoaderState
> {
  container: any;
  canvas: any;
  Module: any;

  static host = 'https://verygoodgraphics.com';

  constructor(props: IVGGLoaderProps) {
    super(props);
  }

  async loadWork(name: string, url: string) {
    if (!name || !url) {
      return;
    }
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
    while (!this.Module) {
      await sleep(30);
    }
    fetch(url)
      .then((res) => {
        if (res.ok) {
          return res.arrayBuffer();
        }
        throw new Error(res.statusText);
      })
      .then((buf) => {
        const data = new Uint8Array(buf);
        if (
          !this.Module.ccall(
            'load_file_from_mem',
            'boolean', // return type
            ['string', 'array', 'number'], // argument types
            [name, data, data.length],
          )
        ) {
          throw new Error('load failed!');
        }
      })
      .catch((err) => {
        console.error(`Failed to load work: ${err.message}`);
      });
  }

  async loadWorkByToken(token: string) {
    if (!token) {
      return;
    }
    try {
      const url = `${VGGLoader.host}/api/work/getWorkByToken/${token}`
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return this.loadWork(data.name, `${VGGLoader.host}${data.url}`);
      }
    } catch (err) {
      console.log(`Failed to load work by token: ${err}`)
    }
  }

  componentDidMount() {
    const wasmHost = `${VGGLoader.host}/runtime`;
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
      createModule({
        noInitialRun: true,
        canvas: this.canvas,
        locateFile: function (path: string, prefix: string) {
          if (path.endsWith('.data')) {
            return wasmHost + '/' + path;
          }
          return prefix + path;
        },
      })
        .then((Module: any) => {
          this.Module = Module;

          const w = this.props.width || 300;
          const h = this.props.height || 200;
          Module.ccall(
            'emscripten_main',
            "void",
            ['number', 'number'],
            [w, h],
          );
        })
        .catch((e: any) => {
          console.error(e);
        });
    };
    this.container.appendChild(script);
    this.canvas.addEventListener('mousedown', (e: any) => e.target.focus());

    if (this.props.token) {
      this.loadWorkByToken(this.props.token)
    }
  }

  render() {
    return (
      <div ref={(container) => (this.container = container)}>
        <canvas ref={(canvas) => (this.canvas = canvas)} tabIndex={-1}></canvas>
      </div>
    );
  }
}