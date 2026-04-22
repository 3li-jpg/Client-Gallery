"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { cn } from "@/lib/utils";

type UniformValue = number[] | number[][] | number;

type Uniforms = {
  [key: string]: {
    value: UniformValue;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: Uniforms;
  maxFps?: number;
}

const defaultOpacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1];

export function CanvasRevealEffect({
  animationSpeed = 10,
  opacities = defaultOpacities,
  colors = [[255, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) {
  return (
    <div className={cn("relative h-full w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors}
          dotSize={dotSize ?? 3}
          opacities={opacities}
          animationSpeed={animationSpeed}
          reverse={reverse}
          center={["x", "y"]}
        />
      </div>
      {showGradient ? (
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(248,248,244,0.96)] via-[rgba(248,248,244,0.72)] to-[rgba(248,248,244,0.18)]" />
      ) : null}
    </div>
  );
}

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  animationSpeed?: number;
  reverse?: boolean;
  center?: ("x" | "y")[];
}

function DotMatrix({
  colors = [[255, 255, 255]],
  opacities = defaultOpacities,
  totalSize = 20,
  dotSize = 2,
  animationSpeed = 0.5,
  reverse = false,
  center = ["x", "y"],
}: DotMatrixProps) {
  const uniforms = useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];

    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length >= 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    }

    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
      u_reverse: {
        value: reverse ? 1 : 0,
        type: "uniform1i",
      },
      u_animation_speed: {
        value: animationSpeed,
        type: "uniform1f",
      },
      u_center_x: {
        value: center.includes("x") ? 1 : 0,
        type: "uniform1i",
      },
      u_center_y: {
        value: center.includes("y") ? 1 : 0,
        type: "uniform1i",
      },
    };
  }, [animationSpeed, center, colors, dotSize, opacities, reverse, totalSize]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        uniform float u_animation_speed;
        uniform int u_center_x;
        uniform int u_center_y;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;

        float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        void main() {
          vec2 st = fragCoord.xy;

          if (u_center_x == 1) {
            st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
          }

          if (u_center_y == 1) {
            st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
          }

          float opacity = step(0.0, st.x) * step(0.0, st.y);
          vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

          float frequency = 5.0;
          float showOffset = random(st2);
          float rand = random(st2 * floor((u_time / frequency) + showOffset + frequency));
          opacity *= u_opacities[int(rand * 10.0)];
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

          vec3 color = u_colors[int(showOffset * 6.0)];

          vec2 centerGrid = u_resolution / 2.0 / u_total_size;
          float distFromCenter = distance(centerGrid, st2);
          float timingOffsetIntro = distFromCenter * 0.01 + (random(st2) * 0.15);
          float maxGridDist = distance(centerGrid, vec2(0.0, 0.0));
          float timingOffsetOutro = (maxGridDist - distFromCenter) * 0.02 + (random(st2 + 42.0) * 0.2);

          float currentTimingOffset = u_reverse == 1 ? timingOffsetOutro : timingOffsetIntro;
          float animationTime = u_time * u_animation_speed;

          if (u_reverse == 1) {
            opacity *= 1.0 - step(currentTimingOffset, animationTime);
            opacity *= clamp(step(currentTimingOffset + 0.1, animationTime) * 1.25, 1.0, 1.25);
          } else {
            opacity *= step(currentTimingOffset, animationTime);
            opacity *= clamp((1.0 - step(currentTimingOffset + 0.1, animationTime)) * 1.25, 1.0, 1.25);
          }

          fragColor = vec4(color, opacity);
          fragColor.rgb *= fragColor.a;
        }
      `}
      uniforms={uniforms}
      maxFps={60}
    />
  );
}

function ShaderMaterialPlane({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string;
  uniforms: Uniforms;
  maxFps?: number;
}) {
  const { size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const lastFrameRef = useRef(0);

  const preparedUniforms = useMemo(() => {
    const nextUniforms: Record<string, { value: unknown }> = {};

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName]!;

      switch (uniform.type) {
        case "uniform1f":
        case "uniform1i":
        case "uniform1fv":
          nextUniforms[uniformName] = { value: uniform.value };
          break;
        case "uniform2f":
          nextUniforms[uniformName] = {
            value: new THREE.Vector2().fromArray(uniform.value as number[]),
          };
          break;
        case "uniform3fv":
          nextUniforms[uniformName] = {
            value: (uniform.value as number[][]).map((value) =>
              new THREE.Vector3().fromArray(value),
            ),
          };
          break;
        default:
          nextUniforms[uniformName] = { value: uniform.value };
      }
    }

    nextUniforms.u_time = { value: 0 };
    nextUniforms.u_resolution = {
      value: new THREE.Vector2(size.width * 2, size.height * 2),
    };

    return nextUniforms;
  }, [size.height, size.width, uniforms]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;

          void main() {
            vec3 pos = position;
            gl_Position = vec4(pos, 1.0);
            fragCoord = (pos.xy + vec2(1.0)) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: source,
        uniforms: preparedUniforms,
        glslVersion: THREE.GLSL3,
        transparent: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
      }),
    [preparedUniforms, source],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const timestamp = clock.getElapsedTime();

    if (timestamp - lastFrameRef.current < 1 / maxFps) {
      return;
    }

    lastFrameRef.current = timestamp;
    const nextMaterial = meshRef.current.material as THREE.ShaderMaterial;
    nextMaterial.uniforms.u_time.value = timestamp;
    nextMaterial.uniforms.u_resolution.value.set(size.width * 2, size.height * 2);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Shader({ source, uniforms, maxFps = 60 }: ShaderProps) {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterialPlane source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
}
