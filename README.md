# Browser Bulk Image Tools

**A browser-side batch image processing engine for resize, crop, rotate, flip, watermark, compression, and format conversion.**

[Explore bulkimage.io image tools](https://bulkimage.io/) · [Open the batch image editor](https://bulkimage.io/editor) · [Browse hosted tools](#hosted-image-tools-on-bulkimageio)

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

## Hosted image tools on bulkimage.io

The links below open specific tools on bulkimage.io. Core editing tools process images locally in the browser. AI generation and expansion use online AI services. This repository contains the reusable processing engine only; it does not include the hosted pages or their UI.

### Batch image editing

| Tool | What it helps with | Direct link |
| --- | --- | --- |
| Batch image editor | Apply multiple edits to many images in one workflow | [Open the batch image editor](https://bulkimage.io/editor) |
| Bulk image converter | Convert a batch to JPEG, PNG, or WebP | [Open the bulk image converter](https://bulkimage.io/bulk-image-converter) |
| Bulk image compressor | Reduce image file sizes in batches | [Open the bulk image compressor](https://bulkimage.io/bulk-image-compress) |
| Bulk image resizer | Resize many images to consistent dimensions | [Open the bulk image resizer](https://bulkimage.io/bulk-image-resize) |
| Bulk image cropper | Crop many images with shared settings | [Open the bulk image cropper](https://bulkimage.io/bulk-image-crop) |
| Bulk image rotator | Rotate multiple images at once | [Open the bulk image rotator](https://bulkimage.io/bulk-image-rotate) |
| Bulk image flipper | Flip multiple images horizontally or vertically | [Open the bulk image flipper](https://bulkimage.io/bulk-image-flip) |
| Batch flip images | Quickly flip a folder of images | [Open the batch flip tool](https://bulkimage.io/batch-flip-images) |
| Bulk image watermark | Add text or image watermarks to a batch | [Open the bulk watermark tool](https://bulkimage.io/bulk-image-watermark) |
| Bulk image border | Add borders and preset border styles to many images | [Open the bulk image border tool](https://bulkimage.io/bulk-image-border) |
| Bulk image filters | Apply consistent filters across a batch | [Open the bulk image filters](https://bulkimage.io/bulk-image-filters) |
| Bulk image rename | Rename image files with a repeatable pattern | [Open the bulk image renamer](https://bulkimage.io/bulk-image-rename) |
| Bulk image DPI converter | Change image DPI metadata in batches | [Open the bulk DPI converter](https://bulkimage.io/bulk-image-dpi-converter) |

### Crop and shape tools

| Tool | What it helps with | Direct link |
| --- | --- | --- |
| Bulk circle crop | Crop many images into circles | [Open the bulk circle crop tool](https://bulkimage.io/bulk-image-circle-crop) |
| Bulk rounded corners | Add rounded corners to many images | [Open the rounded corners tool](https://bulkimage.io/bulk-image-rounded-corners-image) |

### Image format converters

| Tool | What it helps with | Direct link |
| --- | --- | --- |
| HEIC to JPG | Convert HEIC photos to widely supported JPG files | [Convert HEIC to JPG](https://bulkimage.io/heic-to-jpg) |
| PNG to JPG | Convert PNG images to JPG | [Convert PNG to JPG](https://bulkimage.io/png-to-jpg) |
| PNG to WebP | Convert PNG images to WebP | [Convert PNG to WebP](https://bulkimage.io/png-to-webp) |
| JPG to WebP | Convert JPG images to WebP | [Convert JPG to WebP](https://bulkimage.io/jpg-to-webp) |
| WebP to JPG | Convert WebP images to JPG | [Convert WebP to JPG](https://bulkimage.io/webp-to-jpg) |
| WebP to PNG | Convert WebP images to PNG | [Convert WebP to PNG](https://bulkimage.io/webp-to-png) |

### Image and GIF compression

| Tool | What it helps with | Direct link |
| --- | --- | --- |
| Compress image to 10KB | Target a 10 KB image file size | [Compress an image to 10KB](https://bulkimage.io/compress-to-10kb) |
| Compress image to 20KB | Target a 20 KB image file size | [Compress an image to 20KB](https://bulkimage.io/compress-image-to-20kb) |
| Compress image to 50KB | Target a 50 KB image file size | [Compress an image to 50KB](https://bulkimage.io/compress-image-to-50kb) |
| GIF compressor | Reduce animated GIF file size | [Open the GIF compressor](https://bulkimage.io/gif-compressor) |
| Compress GIF to 1MB | Prepare a GIF under a 1 MB target | [Compress a GIF to 1MB](https://bulkimage.io/compress-gif-to-1mb) |
| Compress GIF for Discord | Optimize GIFs for Discord upload limits | [Compress a GIF for Discord](https://bulkimage.io/compress-gif-for-discord) |

### Metadata, privacy, and cleanup

| Tool | What it helps with | Direct link |
| --- | --- | --- |
| EXIF viewer | Inspect camera and image metadata | [Open the EXIF viewer](https://bulkimage.io/exif-viewer) |
| Bulk metadata editor | Edit image metadata across a batch | [Open the bulk metadata editor](https://bulkimage.io/bulk-image-metadata-editor) |
| Bulk metadata remover | Remove metadata from many images | [Open the bulk metadata remover](https://bulkimage.io/bulk-image-metadata-remover) |
| Bulk background remover | Remove image backgrounds in batches | [Open the bulk background remover](https://bulkimage.io/bulk-image-background-remover) |

### AI image tools

| Tool | What it helps with | Direct link |
| --- | --- | --- |
| AI image generator | Create images from a text prompt | [Open the AI image generator](https://bulkimage.io/ai-image-generator) |
| AI image extender | Expand an image beyond its original canvas | [Open the AI image extender](https://bulkimage.io/ai-image-extender) |
| AI face blur | Detect and blur faces in images | [Open the AI face blur tool](https://bulkimage.io/ai-face-blur) |

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

[浏览 bulkimage.io 图片工具](https://bulkimage.io/) · [打开批量图片编辑器](https://bulkimage.io/editor) · [查看全部在线工具](#更多-bulkimageio-在线图片工具)

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

## 更多 bulkimage.io 在线图片工具

下面的链接会直接打开 bulkimage.io 上的具体工具。核心编辑工具在浏览器本地处理图片；AI 图片生成和扩图功能会使用在线 AI 服务。本仓库只包含可复用的图片处理引擎，不包含在线工具页面及其 UI。

### 批量图片编辑

| 工具 | 用途 | 直接入口 |
| --- | --- | --- |
| 批量图片编辑器 | 在一个流程中批量完成多种图片处理 | [打开批量图片编辑器](https://bulkimage.io/editor) |
| 批量图片转换 | 将多张图片转换为 JPEG、PNG 或 WebP | [打开批量图片转换工具](https://bulkimage.io/bulk-image-converter) |
| 批量图片压缩 | 批量减小图片文件体积 | [打开批量图片压缩工具](https://bulkimage.io/bulk-image-compress) |
| 批量图片缩放 | 将多张图片统一调整为指定尺寸 | [打开批量图片缩放工具](https://bulkimage.io/bulk-image-resize) |
| 批量图片裁剪 | 使用统一设置裁剪多张图片 | [打开批量图片裁剪工具](https://bulkimage.io/bulk-image-crop) |
| 批量图片旋转 | 一次旋转多张图片 | [打开批量图片旋转工具](https://bulkimage.io/bulk-image-rotate) |
| 批量图片翻转 | 批量水平或垂直翻转图片 | [打开批量图片翻转工具](https://bulkimage.io/bulk-image-flip) |
| 批量翻转图片 | 快速翻转整个图片文件夹 | [打开批量翻转工具](https://bulkimage.io/batch-flip-images) |
| 批量图片水印 | 为多张图片添加文字或图片水印 | [打开批量图片水印工具](https://bulkimage.io/bulk-image-watermark) |
| 批量图片边框 | 为多张图片添加边框和预设样式 | [打开批量图片边框工具](https://bulkimage.io/bulk-image-border) |
| 批量图片滤镜 | 为整批图片应用一致的滤镜 | [打开批量图片滤镜工具](https://bulkimage.io/bulk-image-filters) |
| 批量图片重命名 | 按统一规则批量重命名图片文件 | [打开批量图片重命名工具](https://bulkimage.io/bulk-image-rename) |
| 批量图片 DPI 转换 | 批量修改图片 DPI 元数据 | [打开批量 DPI 转换工具](https://bulkimage.io/bulk-image-dpi-converter) |

### 裁剪与形状工具

| 工具 | 用途 | 直接入口 |
| --- | --- | --- |
| 批量圆形裁剪 | 将多张图片裁剪为圆形 | [打开批量圆形裁剪工具](https://bulkimage.io/bulk-image-circle-crop) |
| 批量圆角图片 | 为多张图片添加圆角 | [打开批量圆角工具](https://bulkimage.io/bulk-image-rounded-corners-image) |

### 图片格式转换

| 工具 | 用途 | 直接入口 |
| --- | --- | --- |
| HEIC 转 JPG | 将 HEIC 照片转换为兼容性更好的 JPG | [HEIC 转 JPG](https://bulkimage.io/heic-to-jpg) |
| PNG 转 JPG | 将 PNG 图片转换为 JPG | [PNG 转 JPG](https://bulkimage.io/png-to-jpg) |
| PNG 转 WebP | 将 PNG 图片转换为 WebP | [PNG 转 WebP](https://bulkimage.io/png-to-webp) |
| JPG 转 WebP | 将 JPG 图片转换为 WebP | [JPG 转 WebP](https://bulkimage.io/jpg-to-webp) |
| WebP 转 JPG | 将 WebP 图片转换为 JPG | [WebP 转 JPG](https://bulkimage.io/webp-to-jpg) |
| WebP 转 PNG | 将 WebP 图片转换为 PNG | [WebP 转 PNG](https://bulkimage.io/webp-to-png) |

### 图片与 GIF 压缩

| 工具 | 用途 | 直接入口 |
| --- | --- | --- |
| 图片压缩到 10KB | 将图片压缩到约 10 KB | [压缩图片到 10KB](https://bulkimage.io/compress-to-10kb) |
| 图片压缩到 20KB | 将图片压缩到约 20 KB | [压缩图片到 20KB](https://bulkimage.io/compress-image-to-20kb) |
| 图片压缩到 50KB | 将图片压缩到约 50 KB | [压缩图片到 50KB](https://bulkimage.io/compress-image-to-50kb) |
| GIF 压缩 | 减小动态 GIF 文件体积 | [打开 GIF 压缩工具](https://bulkimage.io/gif-compressor) |
| GIF 压缩到 1MB | 将 GIF 压缩到 1 MB 目标范围 | [压缩 GIF 到 1MB](https://bulkimage.io/compress-gif-to-1mb) |
| Discord GIF 压缩 | 针对 Discord 上传限制优化 GIF | [压缩 Discord GIF](https://bulkimage.io/compress-gif-for-discord) |

### 元数据、隐私与清理

| 工具 | 用途 | 直接入口 |
| --- | --- | --- |
| EXIF 查看器 | 查看相机和图片元数据 | [打开 EXIF 查看器](https://bulkimage.io/exif-viewer) |
| 批量元数据编辑 | 批量编辑图片元数据 | [打开批量元数据编辑器](https://bulkimage.io/bulk-image-metadata-editor) |
| 批量元数据移除 | 从多张图片中移除元数据 | [打开批量元数据移除工具](https://bulkimage.io/bulk-image-metadata-remover) |
| 批量背景移除 | 批量移除图片背景 | [打开批量背景移除工具](https://bulkimage.io/bulk-image-background-remover) |

### AI 图片工具

| 工具 | 用途 | 直接入口 |
| --- | --- | --- |
| AI 图片生成器 | 根据文字提示生成图片 | [打开 AI 图片生成器](https://bulkimage.io/ai-image-generator) |
| AI 图片扩展 | 扩展图片原始画布之外的区域 | [打开 AI 图片扩展工具](https://bulkimage.io/ai-image-extender) |
| AI 人脸模糊 | 检测并模糊图片中的人脸 | [打开 AI 人脸模糊工具](https://bulkimage.io/ai-face-blur) |

## 许可证

MIT
