# Browser Bulk Image Tools

**A browser-side batch image processing engine for resize, crop, rotate, flip, watermark, compression, and format conversion.**

[Explore bulkimage.io image tools](https://bulkimage.io/) · [Try the bulk image converter](https://bulkimage.io/bulk-image-converter)

Browser Bulk Image Tools is a small, dependency-free TypeScript engine for developers building bulk image workflows. It exposes processing functions and a batch queue; it does not include a website UI, React components, or server endpoints. Processing uses browser image and canvas APIs, and the package itself makes no network requests.

## Image processing features

| Operation | What it does |
| --- | --- |
| Resize | Fit within dimensions, cover a target box, or stretch to exact dimensions |
| Crop | Extract a pixel-based crop region |
| Rotate | Rotate by any finite degree value while keeping the full result |
| Flip | Flip horizontally, vertically, or both |
| Watermark | Add configurable text at a selected position |
| Compress | Set JPEG or WebP output quality |
| Convert | Encode output as JPEG, PNG, or WebP |
| Batch queue | Bound concurrency, report progress, isolate file errors, and cancel queued work |
| Pipeline | Apply multiple operations in order, then encode once |

The batch queue coordinates asynchronous browser decoding and encoding. Image drawing runs through Canvas APIs on the main thread; this package does not currently create Web Workers.

## Install

```sh
npm install github:WanderZil/browser-bulk-image-tools
```

An npm registry release is planned. The GitHub package includes built JavaScript and TypeScript declarations.

## Quick start

```ts
import { createBatchProcessor } from 'browser-bulk-image-tools';

const files = Array.from(fileInput.files ?? []);
const batch = createBatchProcessor(
  files,
  [
    { type: 'resize', width: 1600, height: 1600, mode: 'contain' },
    { type: 'watermark', text: 'bulkimage.io', position: 'bottom-right', opacity: 0.65 },
  ],
  {
    format: 'image/webp',
    quality: 0.82,
    concurrency: 2,
    onProgress({ completed, total }) {
      console.log(`${completed}/${total}`);
    },
  },
);

// Call batch.cancel() from your own UI when the user cancels.
const result = await batch.promise;

for (const item of result.results) {
  if (item.status === 'success') {
    const url = URL.createObjectURL(item.blob!);
    // Use the URL in your own download UI, then revoke it when finished.
  }
}
```

## Process one image

```ts
import { processImage } from 'browser-bulk-image-tools';

const output = await processImage(file, [
  { type: 'crop', x: 100, y: 80, width: 900, height: 600 },
  { type: 'rotate', degrees: 90 },
  { type: 'resize', width: 1200, height: 1200, mode: 'contain' },
], {
  format: 'image/jpeg',
  quality: 0.88,
});
```

Operations run in array order. Compression and format conversion happen during the final encode, avoiding an extra encode between pipeline steps.

## Resize modes

- `contain` preserves the image ratio inside the requested maximum width and height. This is the default, and smaller images are not enlarged by default.
- `cover` fills an exact width and height box and crops overflow from the center. It can enlarge an image to fill the box.
- `stretch` draws to exact width and height and may change the image ratio.

## Batch behavior

- Results stay in the same order as the input files.
- A file error is returned on that file's result and does not stop other files.
- Cancellation stops queued files from starting. Files already decoding or encoding may still finish.
- Concurrency is limited to 1–16; the default is 2.
- Output is capped at 16,384 pixels per side and 100 million pixels per image.

## Browser support and limitations

The engine uses `createImageBitmap` and either `OffscreenCanvas` or `HTMLCanvasElement`. It is intended for browser environments, not Node.js. Actual input decoding and JPEG/WebP encoding support depends on the browser. Animated GIF frames are not preserved by the Canvas processing pipeline. Metadata such as EXIF is not copied to the output; re-encoding through Canvas normally removes it.

## More bulk image tools

The links below open the hosted bulkimage.io tools. This repository contains processing code only; it does not include those pages or their interface.

| Tool | Use it |
| --- | --- |
| Bulk image converter | [Convert image formats](https://bulkimage.io/bulk-image-converter) |
| Bulk image compressor | [Compress image batches](https://bulkimage.io/bulk-image-compress) |
| Bulk image resizer | [Resize image batches](https://bulkimage.io/bulk-image-resize) |
| Bulk image cropper | [Crop image batches](https://bulkimage.io/bulk-image-crop) |
| Bulk image watermark | [Add image watermarks](https://bulkimage.io/bulk-image-watermark) |
| Bulk image rotator | [Rotate image batches](https://bulkimage.io/bulk-image-rotate) |
| Bulk image flipper | [Flip image batches](https://bulkimage.io/bulk-image-flip) |

## Development

```sh
npm install
npm run build
```

## License

MIT

---

# 浏览器批量图片处理工具引擎

**为浏览器端批量处理流程提供缩放、裁剪、旋转、翻转、水印、压缩和格式转换能力。**

[浏览 bulkimage.io 图片工具](https://bulkimage.io/) · [试用批量图片转换工具](https://bulkimage.io/bulk-image-converter)

这是一个轻量、无运行时依赖的 TypeScript 图片处理引擎，面向需要构建批量图片流程的开发者。项目提供处理函数和批量任务队列，不包含网站 UI、React 组件或服务端接口。图片在浏览器中通过图片和 Canvas API 处理，库本身不会发起网络请求。

## 支持的图片处理

| 功能 | 说明 |
| --- | --- |
| 缩放 | 按边界缩放、填充目标尺寸或拉伸到指定尺寸 |
| 裁剪 | 按像素坐标裁剪区域 |
| 旋转 | 按角度旋转并保留完整结果 |
| 翻转 | 水平、垂直或同时翻转 |
| 文字水印 | 在指定位置添加可配置文字 |
| 压缩 | 设置 JPEG 或 WebP 输出质量 |
| 格式转换 | 编码为 JPEG、PNG 或 WebP |
| 批量队列 | 限制并发、报告进度、隔离单文件错误、取消排队任务 |
| 操作流水线 | 按顺序执行多个处理步骤，最后统一编码 |

批量队列协调异步解码和编码；图像绘制由主线程上的 Canvas API 执行。当前版本不创建 Web Worker。

## 安装

```sh
npm install github:WanderZil/browser-bulk-image-tools
```

目前通过 GitHub 安装，NPM 正式发布后会补充包仓库安装方式。GitHub 仓库包含编译后的 JavaScript 和 TypeScript 类型声明。

## 批量处理示例

```ts
import { createBatchProcessor } from 'browser-bulk-image-tools';

const files = Array.from(fileInput.files ?? []);
const batch = createBatchProcessor(
  files,
  [
    { type: 'resize', width: 1600, height: 1600, mode: 'contain' },
    { type: 'watermark', text: 'bulkimage.io', position: 'bottom-right', opacity: 0.65 },
  ],
  {
    format: 'image/webp',
    quality: 0.82,
    concurrency: 2,
    onProgress: ({ completed, total }) => console.log(`${completed}/${total}`),
  },
);

const result = await batch.promise;
// 成功项的 result.blob 可由调用方接入自己的下载界面。
```

## 流水线与限制

处理步骤按数组顺序执行，最后统一编码。`contain` 默认保持比例且不放大较小图片；`cover` 填满目标尺寸并从中心裁切，必要时会放大；`stretch` 拉伸到精确尺寸。取消会阻止排队中的图片开始处理，已进入解码或编码阶段的图片仍可能完成。

引擎依赖 `createImageBitmap` 以及 `OffscreenCanvas` 或 `HTMLCanvasElement`，面向浏览器，不适用于 Node.js。格式解码和编码能力取决于浏览器。Canvas 流程不会保留 GIF 动画帧；EXIF 等元数据不会复制到输出文件，Canvas 重新编码通常会移除这些信息。

## 更多批量图片工具

以下链接指向 bulkimage.io 在线工具。本仓库只包含图片处理代码，不包含这些工具页面和界面。

| 工具 | 使用入口 |
| --- | --- |
| 批量图片转换 | [格式转换](https://bulkimage.io/bulk-image-converter) |
| 批量图片压缩 | [批量压缩](https://bulkimage.io/bulk-image-compress) |
| 批量图片缩放 | [批量缩放](https://bulkimage.io/bulk-image-resize) |
| 批量图片裁剪 | [批量裁剪](https://bulkimage.io/bulk-image-crop) |
| 批量图片水印 | [添加水印](https://bulkimage.io/bulk-image-watermark) |
| 批量图片旋转 | [批量旋转](https://bulkimage.io/bulk-image-rotate) |
| 批量图片翻转 | [批量翻转](https://bulkimage.io/bulk-image-flip) |

## 许可证

MIT
