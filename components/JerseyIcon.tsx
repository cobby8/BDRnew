import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface JerseyIconProps {
    size?: number;
    color?: string;
    number?: string;
    style?: any;
}

export default function JerseyIcon({ size = 24, color = 'black', style }: JerseyIconProps) {
    // A simplified sleeveless basketball jersey path
    // M: Move to top-left shoulder
    // L: Line to neck
    // Q: Curve for neck
    // L: Right shoulder
    // L: Right armpit (curved in)
    // L: Bottom right
    // L: Bottom left
    // L: Left armpit (curved in)
    // Z: Close

    // Path designed on 24x24 viewBox
    const path = "M7 2 L9 2 L12 5 L15 2 L17 2 L19 6 V19 A2 2 0 0117 21 H7 A2 2 0 015 19 V6 Z";
    // Adjusted path for sleeveless look (simpler tank top)
    const jerseyPath = "M6 4 L8 2 H16 L18 4 V9 C18 9 20 9 20 11 V20 C20 21.1 19.1 22 18 22 H6 C4.9 22 4 21.1 4 20 V11 C4 9 6 9 6 9 V4 Z";

    // Refined Path for "Classic Basketball Jersey"
    // Shoulders at top, deep arm holes, flat bottom.
    const classicJerseyPath = `
        M7 2 
        L9 4 
        Q12 7 15 4 
        L17 2 
        L20 4 
        Q19 10 20 12 
        V20 
        Q20 22 18 22 
        H6 
        Q4 22 4 20 
        V12 
        Q5 10 4 4 
        Z
    `;

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
            <Path d={classicJerseyPath} fill={color} stroke="none" />
        </Svg>
    );
}
