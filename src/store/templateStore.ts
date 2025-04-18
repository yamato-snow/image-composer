import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Template, TextElement, ImageElement, Element } from '../types';

interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  elements: Element[];
  selectedElementId: string | null;

  // テンプレート操作
  addTemplate: (template: Omit<Template, 'id'>) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (id: string) => void;
  createNewTemplate: (name: string) => void;
  
  // 要素操作
  addTextElement: (element: Omit<TextElement, 'id'>) => void;
  addImageElement: (element: Omit<ImageElement, 'id'>) => void;
  updateElement: (id: string, element: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      currentTemplate: null,
      elements: [],
      selectedElementId: null,

      // テンプレート操作
      addTemplate: (templateData) => {
        const newTemplate = {
          ...templateData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
          currentTemplate: newTemplate,
          elements: [],
        }));
      },

      updateTemplate: (id, templateData) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id
              ? { ...t, ...templateData, updatedAt: new Date() }
              : t
          ),
          currentTemplate:
            state.currentTemplate?.id === id
              ? { ...state.currentTemplate, ...templateData, updatedAt: new Date() }
              : state.currentTemplate,
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          currentTemplate:
            state.currentTemplate?.id === id ? null : state.currentTemplate,
          elements:
            state.currentTemplate?.id === id ? [] : state.elements,
        }));
      },

      selectTemplate: (id) => {
        const { templates } = get();
        const template = templates.find((t) => t.id === id) || null;
        set({
          currentTemplate: template,
          elements: [], // 新しいテンプレートを選択したら要素をリセット
          selectedElementId: null,
        });
      },

      createNewTemplate: (name) => {
        const newTemplate = {
          id: uuidv4(),
          name,
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
          currentTemplate: newTemplate,
          elements: [],
          selectedElementId: null,
        }));
      },

      // 要素操作
      addTextElement: (elementData) => {
        const newElement = {
          ...elementData,
          id: uuidv4(),
        };
        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementId: newElement.id,
        }));
      },

      addImageElement: (elementData) => {
        const newElement = {
          ...elementData,
          id: uuidv4(),
        };
        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementId: newElement.id,
        }));
      },

      updateElement: (id, elementData) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...elementData } : el
          ),
        }));
      },

      deleteElement: (id) => {
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        }));
      },

      selectElement: (id) => {
        set({ selectedElementId: id });
      },

      moveElementUp: (id) => {
        set((state) => {
          const elements = [...state.elements];
          const index = elements.findIndex((el) => el.id === id);
          if (index < elements.length - 1) {
            // zIndexがある場合は更新
            elements[index] = {
              ...elements[index],
              zIndex: (elements[index].zIndex || 0) + 1,
            };
          }
          return { elements };
        });
      },

      moveElementDown: (id) => {
        set((state) => {
          const elements = [...state.elements];
          const index = elements.findIndex((el) => el.id === id);
          if (index > 0) {
            // zIndexがある場合は更新
            elements[index] = {
              ...elements[index],
              zIndex: Math.max(0, (elements[index].zIndex || 0) - 1),
            };
          }
          return { elements };
        });
      },
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({
        templates: state.templates,
        currentTemplate: state.currentTemplate,
      }),
    }
  )
); 