import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const theme = useThemeColor();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity: fadeAnim,
        },
        style,
      ]}
    />
  );
}
