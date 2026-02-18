jest.mock("expo", () => ({
  NativeModule: class NativeModule {},
  registerWebModule: (ModuleClass) => new ModuleClass(),
  requireNativeModule: () => ({}),
}));

jest.mock("expo-modules-core", () => ({
  requireNativeViewManager: () => "NativeGoogleSigninButton",
}));

jest.mock("react-native", () => ({
  StyleSheet: {
    create: (styles) => styles,
  },
}));

describe("web module fallback", () => {
  it("throws a clear not-supported error on web methods", async () => {
    const webModule = require("../src/EssentialGoogleSigninModule.web").default;

    await expect(webModule.configure()).rejects.toThrow(
      /not supported on web/i,
    );
    await expect(webModule.signIn()).rejects.toThrow(/not supported on web/i);
    await expect(webModule.signOut()).rejects.toThrow(/not supported on web/i);
    await expect(webModule.hasPlayServices()).rejects.toThrow(
      /not supported on web/i,
    );
  });
});

describe("public exports", () => {
  it("exports native button helpers", () => {
    const pkg = require("../src/index");
    expect(pkg.GoogleSigninButton).toBeDefined();
    expect(pkg.Size).toEqual(
      expect.objectContaining({ Standard: 0, Wide: 1, Icon: 2 }),
    );
    expect(pkg.Color).toEqual(
      expect.objectContaining({ Light: "light", Dark: "dark" }),
    );
  });
});
