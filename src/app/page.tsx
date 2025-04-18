"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTemplateStore } from "@/store";
import { Template } from "@/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import * as ScrollArea from "@radix-ui/react-scroll-area";

export default function Home() {
  const { templates, createNewTemplate } = useTemplateStore();
  const [mounted, setMounted] = useState(false);

  // Hydration errorを防ぐためにクライアント側でマウント後にレンダリング
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateNew = () => {
    createNewTemplate("新規テンプレート");
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">テンプレート一覧</h1>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          新規作成
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">テンプレートがありません</p>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            新規テンプレートを作成
          </button>
        </div>
      ) : (
        <ScrollArea.Root className="h-[calc(100vh-180px)] rounded-md overflow-hidden">
          <ScrollArea.Viewport className="w-full h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
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
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Link
      href={`/templates/${template.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
    >
      <div
        className="h-40 flex items-center justify-center"
        style={{ backgroundColor: template.backgroundColor || "#ffffff" }}
      >
        <span className="text-gray-500 text-sm">
          {template.width} x {template.height}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-medium">{template.name}</h3>
        <p className="text-sm text-gray-500">
          更新日: {template.updatedAt
            ? new Date(template.updatedAt).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
