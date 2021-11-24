import React from 'react';

export interface IVGGLoaderProps {
  width?: number;
  height?: number;
}

interface IVGGLoaderState {
  name: string;
  url: string;
}

export default class VGGLoader extends React.Component<
  IVGGLoaderProps,
  IVGGLoaderState
> {
  container: any;
  canvas: any;
  Module: any;

  constructor(props: IVGGLoaderProps) {
    super(props);
    this.state = {
      name: '',
      url: '',
    };
  }

  setWork(name: string, url: string) {
    this.setState({ name, url });
  }

  loadWork() {
    const { name, url } = this.state;
    if (!name || !url) {
      return;
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

  componentDidMount() {
    const wasmHost = 'https://verygoodgraphics.com/runtime';
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
          this.loadWork();

          // NOTE: this call never returns
          Module.ccall(
            'emscripten_main',
            null,
            ['number', 'number'],
            [this.props.width || 300, this.props.height || 200],
          );
        })
        .catch((e: any) => {
          console.error(e);
        });
    };
    this.container.appendChild(script);
    this.canvas.addEventListener('mousedown', (e: any) => e.target.focus());
  }

  render() {
    return (
      <div ref={(container) => (this.container = container)}>
        <canvas ref={(canvas) => (this.canvas = canvas)} tabIndex={-1}></canvas>
      </div>
    );
  }
}
