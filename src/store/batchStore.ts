import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { BatchJob, Template } from '../types';

export interface ProcessingStatus {
  processing: boolean;
  completed: boolean;
  progress: number;
  total: number;
  successful: number;
  failed: number;
  outputZipUrl: string | null;
  error: string | null;
}

export interface ImageResult {
  filename: string;
  url: string;
  success: boolean;
  error?: string;
}

interface BatchState {
  jobs: BatchJob[];
  currentJob: BatchJob | null;
  
  // バッチ処理用の新しいプロパティ
  csvData: Record<string, string>[];
  templates: Template[];
  selectedTemplate: Template | null;
  processingStatus: ProcessingStatus;
  imageResults: ImageResult[];
  
  // 既存のジョブ操作
  createJob: (templateId: string, csvData: string[][]) => string;
  updateJobProgress: (jobId: string, progress: number) => void;
  updateJobStatus: (jobId: string, status: BatchJob['status']) => void;
  updateJobResults: (jobId: string, results: BatchJob['results']) => void;
  selectJob: (jobId: string) => void;
  deleteJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  
  // バッチ処理用の新しい操作
  setCsvData: (data: Record<string, string>[]) => void;
  setTemplates: (templates: Template[]) => void;
  setSelectedTemplate: (template: Template | null) => void;
  processImages: () => void;
  resetProcessingStatus: () => void;
  
  // アクション
  startProcessing: (total: number) => void;
  updateProgress: (processed: number, successful: number, failed: number) => void;
  setImageResult: (result: ImageResult) => void;
  completeProcessing: (zipUrl: string | null) => void;
  setError: (error: string) => void;
  reset: () => void;
}

// 初期状態のプロセスステータス
const initialProcessingStatus: ProcessingStatus = {
  processing: false,
  completed: false,
  progress: 0,
  total: 0,
  successful: 0,
  failed: 0,
  outputZipUrl: null,
  error: null,
};

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      jobs: [],
      currentJob: null,
      csvData: [],
      templates: [],
      selectedTemplate: null,
      processingStatus: { ...initialProcessingStatus },
      imageResults: [],
      
      createJob: (templateId, csvData) => {
        const newJob: BatchJob = {
          id: uuidv4(),
          templateId,
          csvData,
          progress: 0,
          status: 'pending',
          createdAt: new Date(),
        };
        
        set((state) => ({
          jobs: [...state.jobs, newJob],
          currentJob: newJob,
        }));
        
        return newJob.id;
      },
      
      updateJobProgress: (jobId, progress) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, progress, updatedAt: new Date() } : job
          ),
          currentJob:
            state.currentJob?.id === jobId
              ? { ...state.currentJob, progress, updatedAt: new Date() }
              : state.currentJob,
        }));
      },
      
      updateJobStatus: (jobId, status) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, status, updatedAt: new Date() } : job
          ),
          currentJob:
            state.currentJob?.id === jobId
              ? { ...state.currentJob, status, updatedAt: new Date() }
              : state.currentJob,
        }));
      },
      
      updateJobResults: (jobId, results) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, results, updatedAt: new Date() } : job
          ),
          currentJob:
            state.currentJob?.id === jobId
              ? { ...state.currentJob, results, updatedAt: new Date() }
              : state.currentJob,
        }));
      },
      
      selectJob: (jobId) => {
        const { jobs } = get();
        const job = jobs.find((j) => j.id === jobId) || null;
        set({ currentJob: job });
      },
      
      deleteJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== jobId),
          currentJob:
            state.currentJob?.id === jobId ? null : state.currentJob,
        }));
      },
      
      clearCompletedJobs: () => {
        set((state) => {
          const filteredJobs = state.jobs.filter(
            (job) => job.status !== 'completed'
          );
          return {
            jobs: filteredJobs,
            currentJob:
              state.currentJob?.status === 'completed' ? null : state.currentJob,
          };
        });
      },
      
      // バッチ処理用の新しい操作実装
      setCsvData: (data) => {
        set({ csvData: data });
      },
      
      setTemplates: (templates) => {
        set({ templates });
      },
      
      setSelectedTemplate: (template) => {
        set({ selectedTemplate: template });
      },
      
      processImages: () => {
        const { csvData, selectedTemplate } = get();
        
        if (!selectedTemplate || csvData.length === 0) return;
        
        // 処理開始のステータス更新
        set({
          processingStatus: {
            ...initialProcessingStatus,
            processing: true,
            total: csvData.length,
          }
        });
        
        // 実際のバッチ処理はここで実装する
        // 以下はモック処理（実際の実装はImaginativeなImageProcessorが必要）
        let processed = 0;
        let successful = 0;
        let failed = 0;
        
        // 処理の進捗を模擬的に更新する処理
        const mockProcessing = () => {
          const delay = Math.random() * 1000 + 500; // ランダムな処理時間
          
          setTimeout(() => {
            processed++;
            
            // ランダムに成功・失敗を判定（実際の実装では実際の処理結果に基づく）
            if (Math.random() > 0.1) {
              successful++;
            } else {
              failed++;
            }
            
            // ステータス更新
            set({
              processingStatus: {
                ...initialProcessingStatus,
                progress: processed,
                total: csvData.length,
                successful,
                failed,
                processing: processed < csvData.length,
                completed: processed >= csvData.length,
                // 全処理完了時にダウンロードURLを設定（実際の実装ではAPIからのレスポンスなど）
                outputZipUrl: processed >= csvData.length ? '#download-mock-link' : null
              }
            });
            
            // 全ての処理が終わるまで繰り返し
            if (processed < csvData.length) {
              mockProcessing();
            }
          }, delay);
        };
        
        // 処理開始
        mockProcessing();
      },
      
      resetProcessingStatus: () => {
        set({ processingStatus: { ...initialProcessingStatus } });
      },
      
      // アクション実装
      startProcessing: (total) => set({
        processingStatus: {
          ...initialProcessingStatus,
          processing: true,
          total,
        },
        imageResults: [],
      }),

      updateProgress: (processed, successful, failed) => set((state) => ({
        processingStatus: {
          ...state.processingStatus,
          progress: processed,
          successful,
          failed,
        },
      })),

      setImageResult: (result) => set((state) => ({
        imageResults: [...state.imageResults, result],
      })),

      completeProcessing: (zipUrl) => set((state) => ({
        processingStatus: {
          ...state.processingStatus,
          processing: false,
          completed: true,
          outputZipUrl: zipUrl,
        },
      })),

      setError: (error) => set((state) => ({
        processingStatus: {
          ...state.processingStatus,
          processing: false,
          error,
        },
      })),

      reset: () => set({
        processingStatus: { ...initialProcessingStatus },
        imageResults: [],
      }),
    }),
    {
      name: 'batch-storage',
      partialize: (state) => ({
        jobs: state.jobs,
        templates: state.templates,
      }),
    }
  )
); 