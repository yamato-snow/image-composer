"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTemplateStore } from "@/store";
import TemplateEditor from "@/components/templates/TemplateEditor";
import TemplateCanvas from "@/components/templates/TemplateCanvas";

export default function TemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { 
    templates, 
    currentTemplate, 
    selectTemplate,
    createNewTemplate
  } = useTemplateStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // テンプレートが存在するか確認
    const templateExists = templates.some(template => template.id === id);
    
    if (templateExists) {
      selectTemplate(id);
    } else {
      // 新規テンプレートを作成して、そのページにリダイレクト
      createNewTemplate("新規テンプレート");
      // 新規作成後、最新のテンプレートのIDを取得してリダイレクト
      const newTemplate = useTemplateStore.getState().currentTemplate;
      if (newTemplate) {
        router.replace(`/templates/${newTemplate.id}`);
      }
    }
  }, [id, templates, selectTemplate, createNewTemplate, router]);

  if (!mounted || !currentTemplate) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <TemplateEditor />
      </div>
      <div className="lg:col-span-2">
        <TemplateCanvas />
      </div>
    </div>
  );
} 