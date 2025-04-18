"use client";

import { useState } from "react";
import { useTemplateStore } from "@/store";
import { TextElement, ImageElement } from "@/types/index";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import * as ScrollArea from "@radix-ui/react-scroll-area";

const TemplateEditor = () => {
  const {
    currentTemplate,
    updateTemplate,
    elements,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
    selectedElementId,
    selectElement
  } = useTemplateStore();

  const [activeTab, setActiveTab] = useState<"template" | "elements">("template");

  if (!currentTemplate) return null;

  const handleUpdateTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === "number" ? parseInt(value) : value;
    updateTemplate(currentTemplate.id, { [name]: updatedValue });
  };

  const handleAddTextElement = () => {
    addTextElement({
      text: "テキストを入力",
      x: 100,
      y: 100,
      fontSize: 20,
      color: "#000000",
    });
  };

  const handleAddImageElement = () => {
    addImageElement({
      path: "",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">{currentTemplate.name}</h2>

      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 ${
              activeTab === "template"
                ? "border-b-2 border-blue-500 font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("template")}
          >
            テンプレート設定
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === "elements"
                ? "border-b-2 border-blue-500 font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("elements")}
          >
            要素
          </button>
        </div>
      </div>

      {activeTab === "template" ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              テンプレート名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentTemplate.name}
              onChange={handleUpdateTemplate}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                幅 (px)
              </label>
              <input
                type="number"
                id="width"
                name="width"
                value={currentTemplate.width}
                onChange={handleUpdateTemplate}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                高さ (px)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={currentTemplate.height}
                onChange={handleUpdateTemplate}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
              背景色
            </label>
            <div className="flex">
              <input
                type="color"
                id="backgroundColor"
                name="backgroundColor"
                value={currentTemplate.backgroundColor}
                onChange={handleUpdateTemplate}
                className="h-10 w-10 rounded-md border-gray-300 shadow-sm"
              />
              <input
                type="text"
                value={currentTemplate.backgroundColor}
                onChange={handleUpdateTemplate}
                name="backgroundColor"
                className="flex-1 ml-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="font-medium">要素一覧</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleAddTextElement}
                className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                テキスト追加
              </button>
              <button
                onClick={handleAddImageElement}
                className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                画像追加
              </button>
            </div>
          </div>

          <ScrollArea.Root className="max-h-[calc(100vh-320px)]">
            <ScrollArea.Viewport className="w-full">
              <div className="space-y-4 pr-4">
                {elements.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">要素がありません</p>
                ) : (
                  elements.map((element) => (
                    <div
                      key={element.id}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedElementId === element.id
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => selectElement(element.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium">
                          {"text" in element ? (
                            <span>テキスト: {element.text.substring(0, 20)}{element.text.length > 20 ? "..." : ""}</span>
                          ) : (
                            <span>画像: {element.path || "画像が未設定"}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {selectedElementId === element.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {"text" in element ? (
                            <TextElementEditor element={element} />
                          ) : (
                            <ImageElementEditor element={element} />
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-[160ms] ease-out hover:bg-gray-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-gray-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="bg-gray-200" />
          </ScrollArea.Root>
        </div>
      )}
    </div>
  );
};

const TextElementEditor = ({ element }: { element: TextElement }) => {
  const { updateElement } = useTemplateStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let updatedValue: string | number | boolean = value;
    
    if (type === "number") {
      updatedValue = value === "" ? 0 : parseInt(value);
    } else if (type === "checkbox") {
      updatedValue = (e.target as HTMLInputElement).checked;
    }
    
    updateElement(element.id, { [name]: updatedValue });
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
          テキスト
        </label>
        <textarea
          id="text"
          name="text"
          value={element.text}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="x" className="block text-sm font-medium text-gray-700 mb-1">
            X位置
          </label>
          <input
            type="number"
            id="x"
            name="x"
            value={element.x}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="y" className="block text-sm font-medium text-gray-700 mb-1">
            Y位置
          </label>
          <input
            type="number"
            id="y"
            name="y"
            value={element.y}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-1">
            フォントサイズ
          </label>
          <input
            type="number"
            id="fontSize"
            name="fontSize"
            value={element.fontSize}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
            色
          </label>
          <div className="flex">
            <input
              type="color"
              id="color"
              name="color"
              value={element.color}
              onChange={handleChange}
              className="h-8 w-8 rounded-md border-gray-300 shadow-sm"
            />
            <input
              type="text"
              name="color"
              value={element.color}
              onChange={handleChange}
              className="flex-1 ml-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="bold"
              checked={element.bold || false}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">太字</span>
          </label>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="italic"
              checked={element.italic || false}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">斜体</span>
          </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="alignment" className="block text-sm font-medium text-gray-700 mb-1">
          配置
        </label>
        <select
          id="alignment"
          name="alignment"
          value={element.alignment || "left"}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="left">左揃え</option>
          <option value="center">中央揃え</option>
          <option value="right">右揃え</option>
        </select>
      </div>
    </div>
  );
};

const ImageElementEditor = ({ element }: { element: ImageElement }) => {
  const { updateElement } = useTemplateStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === "number" ? parseInt(value) : value;
    updateElement(element.id, { [name]: updatedValue });
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
          画像パス
        </label>
        <input
          type="text"
          id="path"
          name="path"
          value={element.path}
          onChange={handleChange}
          placeholder="画像URLまたはパス"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="x" className="block text-sm font-medium text-gray-700 mb-1">
            X位置
          </label>
          <input
            type="number"
            id="x"
            name="x"
            value={element.x}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="y" className="block text-sm font-medium text-gray-700 mb-1">
            Y位置
          </label>
          <input
            type="number"
            id="y"
            name="y"
            value={element.y}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
            幅
          </label>
          <input
            type="number"
            id="width"
            name="width"
            value={element.width}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            高さ
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={element.height}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="opacity" className="block text-sm font-medium text-gray-700 mb-1">
          不透明度
        </label>
        <input
          type="range"
          id="opacity"
          name="opacity"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity || 1}
          onChange={handleChange}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-right">{element.opacity || 1}</div>
      </div>
    </div>
  );
};

export default TemplateEditor; 