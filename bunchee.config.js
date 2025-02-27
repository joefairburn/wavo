module.exports = {
  // Ensure named exports are preserved
  format: ['esm', 'cjs'],
  // Disable tree-shaking to preserve all exports
  treeshake: false,
  // Ensure all exports are preserved
  preserveModules: true,
  // External dependencies
  external: ['react', 'react-dom', 'react/jsx-runtime'],
};
