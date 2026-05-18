import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';

interface Props {
  children: (width: number) => React.ReactNode;
  minWidth?: number;
}

export default function ResponsiveChartContainer({ children, minWidth = 200 }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const chartWidth = Math.max(containerWidth, minWidth);

  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      {containerWidth > 0 && children(chartWidth)}
    </View>
  );
}
