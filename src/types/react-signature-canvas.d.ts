declare module 'react-signature-canvas' {
  import React from 'react';

  export interface ReactSignatureCanvasProps {
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    dotSize?: number | (() => number);
    penColor?: string;
    throttle?: number;
    onEnd?: () => void;
    onBegin?: () => void;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    backgroundColor?: string;
    clearOnResize?: boolean;
  }

  export default class SignatureCanvas extends React.Component<ReactSignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(dataURL: string, options?: { ratio?: number; width?: number; height?: number; xOffset?: number; yOffset?: number }): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    fromData(pointGroups: Array<{ x: number; y: number; time: number }[]>): void;
    toData(): Array<{ x: number; y: number; time: number }[]>;
    off(): void;
    on(): void;
    getCanvas(): HTMLCanvasElement;
    getTrimmedCanvas(): HTMLCanvasElement;
    getSignaturePad(): any;
  }
}
