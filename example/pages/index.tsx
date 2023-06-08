import Head from 'next/head'
import { useCallback, useRef } from 'react';
import VggRunner from '../../'


export default function Home() {
  const vgg1 = useRef<any>(null);
  const vgg2 = useRef<any>(null);

  const onLoad1 = useCallback((vggSdk: any) => {
    console.log('#demo, callback vgg sdk: ', vggSdk);

    vgg1.current.getSdk().then((vggSdkGot: any) => {
      console.log('#demo, vgg sdk got from ref is: ', vggSdkGot);
    });

  }, [vgg1]);

  return (
    <>
      <Head>
        <title>VggRunner Demo</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div >
        <VggRunner
          token={'clednbqwy001njxt5owbled9c'}
          width={800}
          height={600}
          ref={vgg1}
          onload={onLoad1}
        />
      </div>

      {/* <div >
        <VggRunner
          token={'clednbqwy001njxt5owbled9c'}
          width={800}
          height={600}
          canvasStyle={{ width: '400px', height: '300px' }}
          ref={vgg2}
        />
      </div>

      <div >
        <VggRunner
          token={'clednbqwy001njxt5owbled9c'}
          width={800}
          height={600}
          canvasStyle={{ width: '100vw', height: '100vh' }}
        />
      </div> */}
    </>
  )
}
