module.exports = function (api) {
    // Disable Reanimated plugin on Web to prevent UI freeze
    const isWeb = api.caller((caller) => caller && caller.platform === 'web');

    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            !isWeb && "react-native-reanimated/plugin",
        ].filter(Boolean),
    };
};
