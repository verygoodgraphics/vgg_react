import { useEffect, useRef } from "react"

import {
  VGG,
  State,
  type VGGProps,
  type VGGEvent,
  EventType,
} from "@verygoodgraphics/vgg-wasm"

export interface Props<T extends string | number | symbol>
  extends Omit<
    VGGProps,
    "canvas" | "onLoad" | "onLoadError" | "onStateChange"
  > {
  canvasStyle?: React.CSSProperties
  onLoad?: (event: VGGEvent, instance: VGG<T>) => Promise<void>
  onLoadError?: (event: VGGEvent) => Promise<void>
  onStateChange?: (event: VGGEvent, instance: VGG<T>) => Promise<void>
}

export function VGGRender<T extends string | number | symbol>(props: Props<T>) {
  const {
    src,
    canvasStyle,
    runtime,
    editMode,
    verbose,
    onLoad,
    onLoadError,
    onStateChange,
  } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // eslint-disable-next-line no-extra-semi
      ;(async () => {
        const vgg = new VGG({
          src: src ?? "https://s3.vgg.cool/test/vgg.daruma",
          runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
          editMode,
          verbose,
          canvas: canvasRef.current!,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onLoad,
          onLoadError,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onStateChange,
        })

        await vgg.load()

        if (vgg.state === State.Ready) {
          await vgg.render()
          onLoad?.(
            {
              type: EventType.Load,
              data: "",
            },
            vgg
          )
        } else {
          onLoadError?.({
            type: EventType.LoadError,
            data: "",
          })
        }
      })()
    }
  }, [])

  return <canvas style={canvasStyle} ref={canvasRef} />
}
