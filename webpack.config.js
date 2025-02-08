const path = require("path");

module.exports = {
  entry: {
    main: "./src/index.tsx",
    inject: "./src/utils/inject.ts",
    searchPlayers: "./src/utils/searchPlayers.ts",
    playerLocation: "./src/utils/playerLocation.ts",
    trackTarget: "./src/utils/trackTarget.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
