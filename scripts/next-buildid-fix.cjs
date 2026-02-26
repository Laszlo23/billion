const generateBuildIdModule = require("next/dist/build/generate-build-id");

if (
  generateBuildIdModule &&
  typeof generateBuildIdModule.generateBuildId === "function"
) {
  const originalGenerateBuildId = generateBuildIdModule.generateBuildId;

  generateBuildIdModule.generateBuildId = async function patchedGenerateBuildId(
    generate,
    fallback,
  ) {
    const safeGenerate = typeof generate === "function" ? generate : () => null;
    const safeFallback =
      typeof fallback === "function"
        ? fallback
        : () => `billion-build-${Date.now()}`;

    return originalGenerateBuildId(safeGenerate, safeFallback);
  };
}
