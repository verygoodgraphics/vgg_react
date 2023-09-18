'use client'

import Head from 'next/head'
import { useCallback, useRef } from 'react';
import VggRunner from '../../'


export default function Home() {
  const vgg1 = useRef<any>(null);

  const onLoad = useCallback((vggSdk: any) => {
    console.log('#demo, callback vgg sdk: ', vggSdk);

    vgg1.current.getSdk().then((vggSdkGot: any) => {
      console.log('#demo, vgg sdk got from ref is: ', vggSdkGot);
    });

  }, [vgg1]);

  const eventHandler = useCallback((event: any) => {
    console.log('#handle event: ', event);

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
          src={'https://s3.vgg.cool/test/daruma-files/flex_space_between.daruma'}
          width={800}
          height={600}
          ref={vgg1}
          canvasStyle={{ width: '100vw', height: '100vh' }}
          onload={onLoad}
          listener={eventHandler}
        />
      </div>

    </>
  )
}
