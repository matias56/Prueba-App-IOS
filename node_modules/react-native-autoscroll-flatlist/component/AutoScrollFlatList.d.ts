import React from "react";
import type { ScrollViewComponent } from "react-native";
import { Animated, View } from "react-native";
import type { Props } from "./type";
/**
 * An enhanced React Native <FlatList> component to provide auto-scrolling functionality.
 * Auto-scrolling will only be enabled if:
 * 1. the scrollTop is at the end of the list; or
 * 2. the user has scrolled back and/or past the end of the list
 * This is to prevent auto-scrolling from annoying the user when the user tries to scroll and look for something in the list.
 */
interface State {
    enabledAutoScrollToEnd: boolean;
    newItemCount: number;
    alertY: Animated.Value;
    isEndOfList: boolean;
}
export declare class AutoScrollFlatList<T> extends React.PureComponent<Props<T>, State> {
    static displayName: string;
    static defaultProps: Pick<Props<any>, "threshold" | "showScrollToEndIndicator" | "showNewItemAlert" | "autoScrollDisabled">;
    private readonly listRef;
    private flatListHeight;
    private flatListWidth;
    private contentHeight;
    private contentWidth;
    private scrollTop;
    constructor(props: Props<T>);
    componentDidUpdate(prevProps: Readonly<Props<T>>, prevState: Readonly<State>): void;
    /**
     *  Exposing FlatList Methods To AutoScrollFlatList's Ref
     */
    scrollToEnd: (params?: {
        animated: boolean;
    }) => void;
    scrollToIndex: (params: {
        index: number;
        viewOffset?: number;
        viewPosition?: number;
        animated?: boolean;
    }) => void;
    scrollToItem: (params: {
        item: T;
        viewPosition?: number;
        animated: boolean;
    }) => void;
    scrollToOffset: (params: {
        offset: number;
        animated?: boolean;
    }) => void;
    recordInteraction: () => void;
    flashScrollIndicators: () => void;
    getScrollableNode: () => any;
    getNativeScrollRef: () => React.RefObject<View> | React.RefObject<ScrollViewComponent> | null | undefined;
    getScrollResponder: () => JSX.Element | null | undefined;
    isAutoScrolling: () => boolean;
    render(): JSX.Element;
    /**
     * Private Methods
     */
    private getTriangleDirection;
    private getScrollToEndIndicatorPosition;
    private onLayout;
    private onContentSizeChange;
    private onScroll;
    private renderDefaultNewItemAlertComponent;
    private renderDefaultIndicatorComponent;
}
export {};
