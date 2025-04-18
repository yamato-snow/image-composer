import { Template, TextElement, ImageElement } from "@/types";

/**
 * テンプレートを画像として描画し、データURLまたはBlobとして返す
 */
export const renderTemplate = async (
  template: Template,
  elements: (TextElement | ImageElement)[],
  format: "dataUrl" | "blob" = "dataUrl",
  mimeType: string = "image/png"
): Promise<string | Blob> => {
  // Canvas要素を作成
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not supported");
  }
  
  // 背景色を設定
  ctx.fillStyle = template.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 要素をzIndexで並べ替え
  const sortedElements = [...elements].sort((a, b) => {
    return (a.zIndex || 0) - (b.zIndex || 0);
  });
  
  // 全ての画像を読み込み
  const imagePromises = sortedElements
    .filter((element): element is ImageElement => "path" in element && !!element.path)
    .map((element) => loadImage(element.path));
  
  const loadedImages = await Promise.all(imagePromises);
  const imageCache = new Map<string, HTMLImageElement>();
  
  sortedElements
    .filter((element): element is ImageElement => "path" in element && !!element.path)
    .forEach((element, index) => {
      imageCache.set(element.path, loadedImages[index]);
    });
  
  // 要素を描画
  for (const element of sortedElements) {
    if ("text" in element) {
      drawTextElement(ctx, element);
    } else if ("path" in element) {
      const image = imageCache.get(element.path);
      if (image) {
        drawImageElement(ctx, element, image);
      }
    }
  }
  
  // 結果を返す
  if (format === "dataUrl") {
    return canvas.toDataURL(mimeType);
  } else {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create Blob from canvas"));
        }
      }, mimeType);
    });
  }
};

/**
 * CSV変数を含むテキストを置換して描画
 */
export const renderTemplateWithData = async (
  template: Template,
  elements: (TextElement | ImageElement)[],
  data: Record<string, string>,
  format: "dataUrl" | "blob" = "dataUrl",
  mimeType: string = "image/png"
): Promise<string | Blob> => {
  // 要素を複製して変数を置換
  const processedElements = elements.map((element) => {
    if ("text" in element) {
      // テキスト要素の場合、変数置換を行う
      const newElement = { ...element };
      newElement.text = replaceVariables(newElement.text, data);
      return newElement;
    } else {
      // 画像要素の場合はそのまま
      return { ...element };
    }
  });
  
  // 描画処理を実行
  return renderTemplate(template, processedElements, format, mimeType);
};

/**
 * テンプレートとCSVデータから一括で画像を生成
 */
export const processBatch = async (
  template: Template,
  elements: (TextElement | ImageElement)[],
  dataRows: Record<string, string>[],
  options: {
    format: "dataUrl" | "blob";
    mimeType: string;
    filenameTemplate: string;
  }
): Promise<Array<{ filename: string; data: string | Blob }>> => {
  const results = [];
  
  // for...ofループを使用して配列を処理
  for (let index = 0; index < dataRows.length; index++) {
    const data = dataRows[index];
    
    // データを使用して画像を生成
    const imageData = await renderTemplateWithData(
      template,
      elements,
      data,
      options.format,
      options.mimeType
    );
    
    // ファイル名テンプレートから実際のファイル名を生成
    let filename = replaceVariables(options.filenameTemplate, data);
    
    // ファイル名が空の場合はインデックスを使用
    if (!filename.trim()) {
      filename = `image_${index + 1}`;
    }
    
    // 拡張子を追加
    const extension = options.mimeType.split("/")[1] || "png";
    if (!filename.endsWith(`.${extension}`)) {
      filename += `.${extension}`;
    }
    
    results.push({
      filename,
      data: imageData,
    });
  }
  
  return results;
};

/**
 * テキスト内の変数参照を実際の値で置換
 */
export const replaceVariables = (
  text: string,
  data: Record<string, string>
): string => {
  // ${variable}形式の変数を検出して置換
  return text.replace(/\${([^}]+)}/g, (match, variableName) => {
    return data[variableName] !== undefined ? data[variableName] : match;
  });
};

/**
 * 画像の読み込み
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * テキスト要素の描画
 */
const drawTextElement = (
  ctx: CanvasRenderingContext2D,
  element: TextElement
): void => {
  ctx.save();
  
  // テキストスタイルを設定
  ctx.font = `${element.italic ? "italic " : ""}${element.bold ? "bold " : ""}${element.fontSize}px ${element.fontFamily || "sans-serif"}`;
  ctx.fillStyle = element.color;
  ctx.textBaseline = "top";
  
  // テキスト位置の配置を設定
  let x = element.x;
  if (element.alignment === "center") {
    ctx.textAlign = "center";
    x += 0; // 中央揃えの場合はxは変更しない
  } else if (element.alignment === "right") {
    ctx.textAlign = "right";
    x += 0; // 右揃えの場合はxは変更しない
  } else {
    ctx.textAlign = "left";
  }
  
  // 回転
  if (element.rotation) {
    ctx.translate(element.x, element.y);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-element.x, -element.y);
  }
  
  // テキストを描画
  ctx.fillText(element.text, x, element.y);
  
  ctx.restore();
};

/**
 * 画像要素の描画
 */
const drawImageElement = (
  ctx: CanvasRenderingContext2D,
  element: ImageElement,
  image: HTMLImageElement
): void => {
  ctx.save();
  
  // 不透明度を設定
  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity;
  }
  
  // 回転
  if (element.rotation) {
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-(element.x + element.width / 2), -(element.y + element.height / 2));
  }
  
  // 画像を描画
  ctx.drawImage(
    image,
    element.x,
    element.y,
    element.width,
    element.height
  );
  
  ctx.restore();
}; 