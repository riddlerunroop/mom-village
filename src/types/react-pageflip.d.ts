declare module "react-pageflip" {
  import { Component, ReactNode, CSSProperties } from "react";

  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    renderOnlyPageLengthChange?: boolean;
    startPage?: number;
    disableFlipByClick?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    onFlip?: (e: { data: number }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: unknown }) => void;
    onUpdate?: (e: { data: unknown }) => void;
  }

  export default class HTMLFlipBook extends Component<HTMLFlipBookProps> {
    pageFlip(): {
      flipNext: () => void;
      flipPrev: () => void;
      flip: (pageNum: number) => void;
      getCurrentPageIndex: () => number;
      getPageCount: () => number;
    };
  }
}
