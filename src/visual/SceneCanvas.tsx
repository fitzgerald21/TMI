import { useEffect, useRef } from 'react';
import { Scene, newControl, type SceneControl, type SceneInput } from './scene';

interface Props {
  input: SceneInput;
  control?: SceneControl;
  className?: string;
  label?: string;
}

/** A canvas running the meditation scene. `input` can change every render; it's read each frame. */
export function SceneCanvas({ input, control, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef(input);
  inputRef.current = input;
  const ctlRef = useRef<SceneControl>(control || newControl());
  if (control) ctlRef.current = control;

  useEffect(() => {
    const canvas = ref.current!;
    const scene = new Scene(canvas, ctlRef.current);
    scene.snap(inputRef.current.mode);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      scene.ctl = ctlRef.current;
      scene.frame(now, inputRef.current);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} role="img" aria-label={label || `Meditation visual: ${input.mode}`} />;
}
