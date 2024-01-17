import { useEffect } from "react"
// import { EventType } from "../lib"
// import { VGGRender } from "../lib/vgg"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { useVGG, VGGRender, EventType } from "../dist/vgg-react.js"

import "./App.css"

function App() {
  const { canvasRef, vgg, isLoading } = useVGG({
    src: "https://s3.vgg.cool/test/vgg.daruma",
    runtime: "https://s3.vgg.cool/test/runtime/latest",
  })

  useEffect(() => {
    if (isLoading || !vgg.current) return
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    vgg.current?.$("#vgg_home").on(EventType.Click, async (_, { set, get }) => {
      window.alert("Hello, VGG!")
      console.log(set, get)
      console.log(get("#vgg_home"))
    })
  }, [isLoading])

  return (
    <div className="grid grid-cols-2">
      <div className="relative">
        <div className="absolute top-2 w-full flex justify-center item-center">
          <h2 className="bg-violet-500 rounded-md px-2 py-1 text-white text-sm font-semibold">
            VGGRender Component
          </h2>
        </div>
        <VGGRender
          src="https://s3.vgg.cool/test/vgg.daruma"
          runtime="https://s3.vgg.cool/test/runtime/latest"
          canvasStyle={{
            width: "50vw",
            height: "100vh",
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onLoad={async (_, instance) => {
            instance.$("#vgg_home").on(EventType.Click, async () => {
              window.alert("Hello, VGG!")
            })
          }}
        />
      </div>
      <div className="relative">
        <div className="absolute top-2 w-full flex justify-center item-center">
          <h2 className="bg-blue-500 rounded-md px-2 py-1 text-white text-sm font-semibold">
            useVGG Hook
          </h2>
        </div>
        <canvas
          ref={canvasRef}
          style={{
            width: "50vw",
            height: "100vh",
          }}
        />
      </div>
    </div>
  )
}

export default App
