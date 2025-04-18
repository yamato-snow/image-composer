'use client';

import React, { useEffect, useState } from 'react';
import { useBatchStore } from '@/store/batchStore';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BatchProcessorProps {
  csvData: string[][];
  onComplete?: () => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ csvData, onComplete }) => {
  const {
    processingStatus,
    startProcessing,
    updateProgress,
    setImageResult,
    completeProcessing,
    setError
  } = useBatchStore();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // バッチ処理の実行
  useEffect(() => {
    if (isInitialized || !csvData || csvData.length <= 1) return;
    
    const processImages = async () => {
      try {
        const headers = csvData[0];
        const rows = csvData.slice(1);
        
        // 処理開始
        startProcessing(rows.length);
        
        let successful = 0;
        let failed = 0;
        
        // データ行ごとに処理
        for (let i = 0; i < rows.length; i++) {
          try {
            // 画像処理（実際の実装では、ここでcanvasに描画してblobを生成）
            // この例では、URLを模擬的に生成
            const row = rows[i];
            const mockImageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==`;
            
            // 結果を保存
            setImageResult({
              filename: `image_${i + 1}.png`,
              url: mockImageUrl,
              success: true
            });
            
            successful++;
          } catch (err) {
            console.error('画像処理エラー:', err);
            setImageResult({
              filename: `image_${i + 1}.png`,
              url: '',
              success: false,
              error: err instanceof Error ? err.message : '不明なエラー'
            });
            
            failed++;
          }
          
          // 進捗更新
          updateProgress(i + 1, successful, failed);
          
          // UIの更新を待つ（非同期処理を少し遅延させる）
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // すべての処理が完了
        // 実際の実装では、ここでZIPファイルを生成またはサーバーからのURLを取得
        const mockZipUrl = URL.createObjectURL(new Blob(['mock zip content'], { type: 'application/zip' }));
        completeProcessing(mockZipUrl);
        
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('バッチ処理エラー:', error);
        setError(error instanceof Error ? error.message : '不明なエラー');
      }
    };
    
    setIsInitialized(true);
    processImages();
  }, [csvData, isInitialized, startProcessing, updateProgress, setImageResult, completeProcessing, setError, onComplete]);
  
  // 進捗がない場合は何も表示しない
  if (!processingStatus.processing && processingStatus.progress === 0) {
    return null;
  }
  
  // エラー表示
  if (processingStatus.error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>
          {processingStatus.error}
        </AlertDescription>
      </Alert>
    );
  }
  
  // 進捗表示
  return (
    <div className="space-y-4 mb-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>処理中...</span>
          <span>{processingStatus.progress} / {processingStatus.total}</span>
        </div>
        <Progress value={(processingStatus.progress / processingStatus.total) * 100} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded-md">
          <div className="font-medium text-green-800">成功</div>
          <div className="text-lg font-bold text-green-700">{processingStatus.successful}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-md">
          <div className="font-medium text-red-800">失敗</div>
          <div className="text-lg font-bold text-red-700">{processingStatus.failed}</div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessor; 