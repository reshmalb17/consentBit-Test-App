import path from "path";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";
import fs from "fs";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Plugin to clean old chunk files and assets before building
class CleanOldChunksPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tap("CleanOldChunksPlugin", (compilation) => {
      const outputPath = compiler.options.output.path;
      if (!fs.existsSync(outputPath)) return;
      
      const files = fs.readdirSync(outputPath);
      const filesToKeep = ['bundle.js', 'index.html', 'styles.css', 'assets'];
      let cleanedCount = 0;
      
      files.forEach(file => {
        // Skip files/directories we want to keep
        if (filesToKeep.includes(file)) return;
        
        const filePath = path.join(outputPath, file);
        const stat = fs.statSync(filePath);
        
        // Remove old chunk files (JS files with hashes that aren't bundle.js)
        if (file.endsWith('.js') && 
            file !== 'bundle.js' && 
            !file.includes('node_modules') &&
            !file.endsWith('.LICENSE.txt')) {
          try {
            fs.unlinkSync(filePath);
            cleanedCount++;
          } catch (err) {
            // Ignore errors
          }
        }
        // Remove old asset files (SVG, PNG, JPG, WEBP with hash patterns)
        // Webpack generates assets with hashes, old ones should be cleaned
        else if (/\.(svg|png|jpg|jpeg|webp|gif)$/i.test(file) && stat.isFile()) {
          // Remove files that are:
          // 1. Pure hash filenames (like "020f7028ee30a97ff82d.svg")
          // 2. Files with hash patterns (like "name.abc12345.svg")
          // 3. Files in root that aren't explicitly kept (assets should be in assets/ folder)
          const isHashedAsset = /^[a-f0-9]{16,}\.(svg|png|jpg|jpeg|webp|gif)$/i.test(file) ||
                                 /\.([a-f0-9]{8,})\.(svg|png|jpg|jpeg|webp|gif)$/i.test(file);
          
          // Keep only specific known files (like message-icon.png, warning-2.png if they exist)
          const keepFiles = ['message-icon.png', 'warning-2.png'];
          const shouldKeep = keepFiles.includes(file.toLowerCase());
          
          if (!shouldKeep && (isHashedAsset || !file.startsWith('assets'))) {
            try {
              fs.unlinkSync(filePath);
              cleanedCount++;
            } catch (err) {
              // Ignore errors
            }
          }
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`✓ Cleaned ${cleanedCount} old files from public folder`);
      }
    });
  }
}

// Plugin to safely replace new Function patterns for marketplace compliance
// This runs AFTER bundling to ensure we don't break functionality
class SafeNewFunctionReplacerPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("SafeNewFunctionReplacerPlugin", (compilation) => {
      const outputPath = compilation.outputOptions.path;
      const bundleDir = path.join(path.dirname(outputPath), 'bundle');
      
      // Function to clean a directory
      const cleanDirectory = (dir) => {
        if (!fs.existsSync(dir)) return;
        
        const bundleFiles = fs.readdirSync(dir).filter(file => 
          file.endsWith('.bundle.js') || file === 'bundle.js' ||
          (file.endsWith('.js') && !file.includes('node_modules')) // Process all webpack-generated JS files
        );
        
        bundleFiles.forEach(filename => {
          const bundlePath = path.join(dir, filename);
          this.processFile(bundlePath, filename);
        });
      };
      
      // Clean public directory (webpack output)
      // Process main bundle and all chunk files (lazy-loaded components)
      const bundleFiles = fs.readdirSync(outputPath).filter(file => 
        file.endsWith('.bundle.js') || file === 'bundle.js' || 
        (file.endsWith('.js') && !file.includes('node_modules')) // Process all webpack-generated JS files
      );
      
      bundleFiles.forEach(filename => {
        const bundlePath = path.join(outputPath, filename);
        this.processFile(bundlePath, filename);
      });
      
      // Also clean bundle directory if it exists (after webflow extension bundle copies files)
      cleanDirectory(bundleDir);
    });
  }
  
  processFile(bundlePath, filename) {
    if (!fs.existsSync(bundlePath)) return;
    
    let bundleContent = fs.readFileSync(bundlePath, "utf8");
    const originalContent = bundleContent;
    
    // CRITICAL: Replace new Function("return this")() with a safe alternative
    // This pattern is used by framer-motion to get global object in strict mode
    // Replacement: (function(){return this||window})() works in all contexts
    
    // Run multiple passes to catch all variations (minified code can have different spacing)
    let previousContent = '';
    let passCount = 0;
    const maxPasses = 3;
    
    while (previousContent !== bundleContent && passCount < maxPasses) {
      previousContent = bundleContent;
      passCount++;
      
      // Pattern 1: this||new Function("return this")() - handle various spacing
      bundleContent = bundleContent.replace(
        /this\|\|new\s+Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        'this||(function(){return this||window})()'
      );
      bundleContent = bundleContent.replace(
        /this\|\|new\s*Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        'this||(function(){return this||window})()'
      );
      
      // Pattern 2: ||new Function("return this")()
      bundleContent = bundleContent.replace(
        /\|\|new\s+Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        '||(function(){return this||window})()'
      );
      bundleContent = bundleContent.replace(
        /\|\|new\s*Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        '||(function(){return this||window})()'
      );
      
      // Pattern 3: standalone new Function("return this")() - most flexible pattern
      bundleContent = bundleContent.replace(
        /new\s+Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        '(function(){return this||window})()'
      );
      bundleContent = bundleContent.replace(
        /new\s*Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        '(function(){return this||window})()'
      );
      
      // Pattern 4: new Function("return window")()
      bundleContent = bundleContent.replace(
        /new\s+Function\s*\(\s*["']return\s+window["']\s*\)\s*\(\s*\)/g,
        'window'
      );
      bundleContent = bundleContent.replace(
        /new\s*Function\s*\(\s*["']return\s+window["']\s*\)\s*\(\s*\)/g,
        'window'
      );
      
      // Pattern 5: await new Function("return this")()
      bundleContent = bundleContent.replace(
        /await\s+new\s+Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        'await Promise.resolve((function(){return this||window})())'
      );
      bundleContent = bundleContent.replace(
        /await\s+new\s*Function\s*\(\s*["']return\s+this["']\s*\)\s*\(\s*\)/g,
        'await Promise.resolve((function(){return this||window})())'
      );
    }
    
    // Remove eval patterns (safe to remove)
    bundleContent = bundleContent.replace(
      /\(0,\s*eval\)\s*\(["'][^"']*["']\)/g,
      'null'
    );
    bundleContent = bundleContent.replace(
      /await\s*\(0,\s*eval\)\s*\(["'][^"']*["']\)/g,
      'await Promise.resolve(null)'
    );
    
    // Only write if content changed
    if (bundleContent !== originalContent) {
      fs.writeFileSync(bundlePath, bundleContent, "utf8");
      console.log(`✓ Cleaned new Function/eval from ${filename}`);
    }
  }
}

export default {
  mode: "production", 
  devtool: false,     
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    // Use chunkFilename for async chunks (lazy-loaded components)
    // This prevents filename conflicts when code splitting is enabled
    chunkFilename: "[name].[contenthash:8].js",
    path: path.resolve(dirname, "public"),
    // Prevent webpack from using eval/new Function for runtime
    // Use "window" instead of "this" to avoid new Function("return this")
    globalObject: "window",
    // Explicitly set the environment to prevent webpack from needing to detect it
    environment: {
      arrowFunction: true,
      bigIntLiteral: false,
      const: true,
      destructuring: true,
      dynamicImport: false,
      forOf: true,
      module: false,
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  // Disable Node.js polyfills to prevent eval usage
  node: false,
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb - inline small images as base64
          },
        },
        generator: {
          filename: "assets/[name].[hash:8][ext]",
        },
      },
    ],
  },
  optimization: {
    // Enable code splitting for lazy-loaded components
    // Split vendors only from async chunks to avoid filename conflicts with main bundle
    splitChunks: {
      chunks: 'async', // Only split async chunks (lazy-loaded components)
      minSize: 20000, // Only create chunks larger than 20KB
      maxSize: 250000, // Try to keep chunks under 250KB
      cacheGroups: {
        default: false,
        // Split vendor code from lazy-loaded components into separate chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Extract package name for better chunk naming
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
            if (packageName) {
              // For large packages, create separate chunks
              if (packageName.startsWith('react') || packageName.startsWith('react-dom')) {
                return 'react-vendor';
              }
              if (packageName.startsWith('@tanstack')) {
                return 'tanstack-vendor';
              }
              if (packageName.startsWith('framer-motion')) {
                return 'framer-vendor';
              }
            }
            return 'vendor';
          },
          chunks: 'async',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Create separate chunks for lazy-loaded components
        components: {
          name(module) {
            // Extract component name from the module path for better chunk naming
            const match = module.resource?.match(/[\\/]components[\\/]([^\\/]+)\.tsx?$/);
            return match ? match[1].toLowerCase() : 'component';
          },
          test: /[\\/]src[\\/]components[\\/]/,
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Split shared code between components
        common: {
          minChunks: 2, // Code used in 2+ chunks
          chunks: 'async',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // Disable runtime chunk to prevent webpack runtime from using new Function
    runtimeChunk: false,
    // Minimize without using eval or new Function
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            // Disable features that might use eval or new Function
            drop_console: false,
            pure_funcs: [],
            // Explicitly disable eval
            evaluate: true, // This is safe - it's static evaluation, not eval()
            unsafe: false, // Disable unsafe optimizations that might use eval
            unsafe_comps: false,
            unsafe_math: false,
            unsafe_methods: false,
            unsafe_proto: false,
            unsafe_regexp: false,
            unsafe_undefined: false,
          },
          mangle: true,
          format: {
            comments: false,
          },
          // Prevent Terser from using eval or new Function
          ecma: 2015,
          safari10: true,
          // Explicitly disable any code generation that uses eval
          parse: {
            ecma: 2015,
          },
        },
        // Prevent Terser from generating eval or new Function
        extractComments: false,
      }),
    ],
  },
  // Prevent webpack from using eval/new Function in generated code
  experiments: {
    topLevelAwait: false,
  },
  plugins: [
    new CleanOldChunksPlugin(),
    new SafeNewFunctionReplacerPlugin(),
  ],
  devServer: {
    static: [{ directory: path.join(dirname, "public") }],
    compress: true,
    port: 3000,
  },
};
