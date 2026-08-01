import React from "react";
export interface Props {
    size: number;
    color: string;
    direction: "up" | "down" | "left" | "right";
}
export declare class Triangle extends React.PureComponent<Props> {
    static displayName: string;
    static defaultProps: Pick<Props, "size" | "color" | "direction">;
    render(): JSX.Element;
}
