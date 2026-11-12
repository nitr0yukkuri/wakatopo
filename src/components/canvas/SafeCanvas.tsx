'use client';

import { Canvas as FiberCanvas, type CanvasProps } from '@react-three/fiber';
import { Component, type ReactNode } from 'react';

function SceneFallback() {
    return <div data-webgl-fallback aria-hidden="true" className="h-full w-full bg-[radial-gradient(ellipse_at_center,#10202e_0%,#050505_70%)]" />;
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? <SceneFallback /> : this.props.children; }
}

// The HTML portfolio stays outside this boundary if WebGL/context creation fails.
export default function SafeCanvas(props: CanvasProps) {
    return <CanvasBoundary><FiberCanvas {...props} fallback={<SceneFallback />} /></CanvasBoundary>;
}
