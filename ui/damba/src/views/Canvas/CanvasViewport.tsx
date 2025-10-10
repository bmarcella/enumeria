import React, { CSSProperties, ReactNode, HTMLAttributes, CanvasHTMLAttributes } from 'react'

type Props = {
    viewportRef: React.RefObject<HTMLDivElement>
    canvasRef: React.RefObject<HTMLCanvasElement>
    height?: number
    maxWidth?: string
    maxHeight?: string
    background?: string
    border?: string
    className?: string
    style?: CSSProperties
    overlay?: ReactNode
    overlayStyle?: CSSProperties
    ariaLabel?: string
    disableContextMenu?: boolean
    viewportProps?: Omit<HTMLAttributes<HTMLDivElement>, 'ref' | 'className' | 'style'>
    canvasProps?: Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'ref' | 'style'>
}

export const CanvasViewport = ({
    viewportRef,
    canvasRef,
    height = 600,
    maxWidth = '100%',
    maxHeight = '1400px',
    background = '#f8f9fa',
    border = '1px solid #ddd',
    className,
    style,
    overlay,
    overlayStyle,
    ariaLabel = 'Canvas viewport',
    disableContextMenu = false,
    viewportProps,
    canvasProps,
}: Props) => {
    return (
        <div
            ref={viewportRef}
            className={className}
            onContextMenu={disableContextMenu ? (e) => e.preventDefault() : undefined}
            {...viewportProps}
            style={{
                width: '100%',
                height,
                maxWidth,
                maxHeight,
                overflow: 'auto',
                border,
                background,
                position: 'relative',
                margin: '0 auto',
                ...style,
            }}
        >
            {overlay && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', pointerEvents: 'auto', ...overlayStyle }}>
                        {overlay}
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                role="img"
                aria-label={ariaLabel}
                style={{ display: 'block', width: '100%', height: '100%', background: 'white' }}
                {...canvasProps}
            />
        </div>
    )
}
