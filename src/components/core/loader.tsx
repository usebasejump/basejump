import React, { ReactElement, SVGProps } from "react";

export default function Loader(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
): ReactElement {
  const speed = Number(String(props.speed ?? 0.7));
  const fill = props.fill ?? "#000";
  const stroke = props.stroke ?? "transparent";
  const fillOpacity = props.fillOpacity;
  const strokeOpacity = props.strokeOpacity;
  return (
    <svg
      {...{
        ...props,
        className: props.className
          ? `icon-loading ${props.className}`
          : "icon-loading",
        fill: undefined,
        fillOpacity: undefined,
        height: props.height ?? 80,
        speed: undefined,
        stroke: undefined,
        strokeOpacity: undefined,
        strokeWidth: undefined,
        width: props.width ?? 55,
      }}
      viewBox="0 0 55 80"
    >
      <g transform="matrix(1 0 0 -1 0 80)">
        <rect
          width={10}
          height={20}
          rx={3}
          {...{ fill, stroke, fillOpacity, strokeOpacity }}
        >
          <animate
            attributeName="height"
            begin="0s"
            dur={`${4.3 / speed}s`}
            values="20;45;57;80;64;32;66;45;64;23;66;13;64;56;34;34;2;23;76;79;20"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x={15}
          width={10}
          height={80}
          rx={3}
          {...{ fill, stroke, fillOpacity, strokeOpacity }}
        >
          <animate
            attributeName="height"
            begin="0s"
            dur={`${2 / speed}s`}
            values="80;55;33;5;75;23;73;33;12;14;60;80"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x={30}
          width={10}
          height={50}
          rx={3}
          {...{ fill, stroke, fillOpacity, strokeOpacity }}
        >
          <animate
            attributeName="height"
            begin="0s"
            dur={`${1.4 / speed}s`}
            values="50;34;78;23;56;23;34;76;80;54;21;50"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x={45}
          width={10}
          height={30}
          rx={3}
          {...{ fill, stroke, fillOpacity, strokeOpacity }}
        >
          <animate
            attributeName="height"
            begin="0s"
            dur={`${2 / speed}s`}
            values="30;45;13;80;56;72;45;76;34;23;67;30"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
      </g>
    </svg>
  );
}
