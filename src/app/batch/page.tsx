'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import CSVUploader from '@/components/batch/CSVUploader';
import CSVPreview from '@/components/batch/CSVPreview';
import BatchProcessor from '@/components/batch/BatchProcessor';
import ResultDownload from '@/components/batch/ResultDownload';
import { useBatchStore } from '@/store/batchStore';

export default function BatchPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const { processingStatus, reset } = useBatchStore();
  
  const handleCSVUpload = (parsedData: string[][]) => {
    setCsvData(parsedData);
    setActiveTab('preview');
  };
  
  const handleStartProcessing = () => {
    setActiveTab('process');
  };
  
  const handleProcessingComplete = () => {
    setActiveTab('download');
  };
  
  const handleReset = () => {
    reset();
    setCsvData([]);
    setActiveTab('upload');
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">バッチ処理</h1>
        <p className="text-muted-foreground">
          CSVファイルから複数の画像を一括生成します。ヘッダー行を含むCSVファイルをアップロードしてください。
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" disabled={activeTab === 'process'}>
            1. CSVアップロード
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={csvData.length === 0 || activeTab === 'process'}>
            2. データ確認
          </TabsTrigger>
          <TabsTrigger value="process" disabled={csvData.length === 0 || activeTab === 'process' && !processingStatus.completed}>
            3. 処理実行
          </TabsTrigger>
          <TabsTrigger value="download" disabled={!processingStatus.completed}>
            4. 結果ダウンロード
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <CSVUploader onUpload={handleCSVUpload} />
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <CSVPreview data={csvData} />
            <div className="mt-6 flex justify-end">
              <Button onClick={handleStartProcessing} className="gap-2">
                <Upload className="h-4 w-4" />
                処理を開始
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="process" className="space-y-4">
          <Card className="p-6">
            <BatchProcessor 
              csvData={csvData} 
              onComplete={handleProcessingComplete}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="download" className="space-y-4">
          <ResultDownload onReset={handleReset} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 