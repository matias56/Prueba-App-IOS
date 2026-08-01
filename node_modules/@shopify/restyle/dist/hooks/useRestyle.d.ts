import { StyleProp } from 'react-native';
import { BaseTheme, RestyleFunctionContainer, RNStyle } from '../types';
declare const useRestyle: <Theme extends BaseTheme, TRestyleProps extends Record<string, any>, TProps extends TRestyleProps & {
    style?: StyleProp<RNStyle>;
}>(restyleFunctions: (RestyleFunctionContainer<TProps, Theme, keyof TProps, keyof Theme | undefined> | RestyleFunctionContainer<TProps, Theme, keyof TProps, keyof Theme | undefined>[])[], props: TProps) => Pick<TProps, Exclude<keyof TProps, keyof TProps>>;
export default useRestyle;
