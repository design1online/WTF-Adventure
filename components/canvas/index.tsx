type CanvasProps = {
    id: string;
    width?: string;
    height?: string;
}

const defaultProps = {
    id: "missing-id",
    width: "100%",
    height: "100%"
};

const Canvas = (props:CanvasProps = defaultProps) => {
    return <canvas {...props} />
}

export default Canvas;