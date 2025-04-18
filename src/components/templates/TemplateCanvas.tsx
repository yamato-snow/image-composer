"use client";

import { useEffect, useRef, useState } from "react";
import { useTemplateStore } from "@/store";
import { TextElement, ImageElement } from "@/types/index";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const TemplateCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    currentTemplate,
    elements,
    selectedElementId,
    selectElement,
    updateElement,
  } = useTemplateStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [zoomLevel, setZoomLevel] = useState(1);

  // ズームレベルを変更する関数
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // テンプレートや要素が変更されたときにキャンバスを再描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentTemplate) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスサイズを設定
    canvas.width = currentTemplate.width;
    canvas.height = currentTemplate.height;

    // 背景を描画
    ctx.fillStyle = currentTemplate.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 要素を描画
    const sortedElements = [...elements].sort((a, b) => {
      return (a.zIndex || 0) - (b.zIndex || 0);
    });

    sortedElements.forEach((element) => {
      if ("text" in element) {
        drawTextElement(ctx, element);
      } else if ("path" in element) {
        drawImageElement(ctx, element);
      }
    });

    // 選択された要素の境界線を描画
    if (selectedElementId) {
      const selectedElement = elements.find((el) => el.id === selectedElementId);
      if (selectedElement) {
        drawSelectionBorder(ctx, selectedElement);
      }
    }
  }, [currentTemplate, elements, selectedElementId, loadedImages]);

  // 画像要素の読み込み
  useEffect(() => {
    const imageElements = elements.filter((el): el is ImageElement => "path" in el);
    
    imageElements.forEach((element) => {
      if (element.path && !loadedImages[element.path]) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages((prev) => ({ ...prev, [element.path]: img }));
        };
        img.src = element.path;
      }
    });
  }, [elements, loadedImages]);

  const drawTextElement = (ctx: CanvasRenderingContext2D, element: TextElement) => {
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

  const drawImageElement = (ctx: CanvasRenderingContext2D, element: ImageElement) => {
    if (!element.path || !loadedImages[element.path]) return;
    
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
      loadedImages[element.path],
      element.x,
      element.y,
      element.width,
      element.height
    );
    
    ctx.restore();
  };

  const drawSelectionBorder = (ctx: CanvasRenderingContext2D, element: TextElement | ImageElement) => {
    ctx.save();
    
    ctx.strokeStyle = "#2563eb"; // 青色の境界線
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]); // 点線
    
    let width, height;
    
    if ("text" in element) {
      // テキスト要素の場合、おおよそのテキストの幅を測定
      ctx.font = `${element.italic ? "italic " : ""}${element.bold ? "bold " : ""}${element.fontSize}px ${element.fontFamily || "sans-serif"}`;
      width = ctx.measureText(element.text).width;
      height = element.fontSize * 1.2; // 高さの近似値
    } else {
      // 画像要素の場合
      width = element.width;
      height = element.height;
    }
    
    // 境界線を描画
    ctx.strokeRect(element.x - 5, element.y - 5, width + 10, height + 10);
    
    // 選択ハンドルを描画
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#2563eb";
    ctx.setLineDash([]);
    
    // 四隅にハンドルを描画
    [
      { x: element.x - 5, y: element.y - 5 },
      { x: element.x + width + 5, y: element.y - 5 },
      { x: element.x - 5, y: element.y + height + 5 },
      { x: element.x + width + 5, y: element.y + height + 5 },
    ].forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    
    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // キャンバス上のクリック位置を計算
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // 要素の判定（最前面の要素から）
    const sortedElements = [...elements].sort((a, b) => {
      return (b.zIndex || 0) - (a.zIndex || 0);
    });
    
    let clickedElement = null;
    
    for (const element of sortedElements) {
      if (isPointInElement(x, y, element)) {
        clickedElement = element;
        break;
      }
    }
    
    if (clickedElement) {
      selectElement(clickedElement.id);
    } else {
      selectElement(null);
    }
  };

  const isPointInElement = (x: number, y: number, element: TextElement | ImageElement) => {
    let width, height;
    
    if ("text" in element) {
      // テキスト要素の場合
      const canvas = canvasRef.current;
      if (!canvas) return false;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      
      ctx.font = `${element.italic ? "italic " : ""}${element.bold ? "bold " : ""}${element.fontSize}px ${element.fontFamily || "sans-serif"}`;
      width = ctx.measureText(element.text).width;
      height = element.fontSize * 1.2; // 高さの近似値
    } else {
      // 画像要素の場合
      width = element.width;
      height = element.height;
    }
    
    return (
      x >= element.x &&
      x <= element.x + width &&
      y >= element.y &&
      y <= element.y + height
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedElementId || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // キャンバス上のマウス位置を計算
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const selectedElement = elements.find((el) => el.id === selectedElementId);
    if (!selectedElement) return;
    
    if (isPointInElement(x, y, selectedElement)) {
      setIsDragging(true);
      setDragStartPos({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // キャンバス上のマウス位置を計算
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // 移動量を計算
    const deltaX = x - dragStartPos.x;
    const deltaY = y - dragStartPos.y;
    
    // 要素の位置を更新
    const selectedElement = elements.find((el) => el.id === selectedElementId);
    if (!selectedElement) return;
    
    updateElement(selectedElementId, {
      x: selectedElement.x + deltaX,
      y: selectedElement.y + deltaY,
    });
    
    // ドラッグ開始位置を更新
    setDragStartPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!currentTemplate) return null;

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">プレビュー</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1 bg-white rounded border border-gray-300 hover:bg-gray-50"
            title="縮小"
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 bg-white rounded border border-gray-300 hover:bg-gray-50 text-sm"
            title="リセット"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 bg-white rounded border border-gray-300 hover:bg-gray-50"
            title="拡大"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div 
        className="flex justify-center items-center bg-gray-200 rounded border border-gray-300 overflow-auto"
        style={{
          height: 'calc(100vh - 220px)',
          padding: '20px',
        }}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateCanvas; 