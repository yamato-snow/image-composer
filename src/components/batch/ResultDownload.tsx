'use client';

import React from 'react';
import { useBatchStore } from '@/store/batchStore';
import { Button } from '@/components/ui/button';
import { Download, File, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultDownloadProps {
  onReset?: () => void;
}

const ResultDownload: React.FC<ResultDownloadProps> = ({ onReset }) => {
  const { processingStatus, imageResults, reset } = useBatchStore();
  
  // 処理が完了していない場合は表示しない
  if (!processingStatus.completed) {
    return null;
  }
  
  const handleReset = () => {
    reset();
    if (onReset) {
      onReset();
    }
  };
  
  const handleDownloadZip = () => {
    if (processingStatus.outputZipUrl) {
      // ZIPファイルをダウンロード
      const link = document.createElement('a');
      link.href = processingStatus.outputZipUrl;
      link.download = `generated_images_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleDownloadSingleImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            処理完了
          </CardTitle>
          <CardDescription>
            {processingStatus.total}件の処理が完了しました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="bg-white p-3 rounded-md">
              <div className="font-medium text-green-800">成功</div>
              <div className="text-lg font-bold text-green-700">{processingStatus.successful}</div>
            </div>
            <div className="bg-white p-3 rounded-md">
              <div className="font-medium text-red-800">失敗</div>
              <div className="text-lg font-bold text-red-700">{processingStatus.failed}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-white border-t border-green-100 rounded-b-lg">
          <Button variant="outline" onClick={handleReset}>
            新しい処理を開始
          </Button>
          {processingStatus.outputZipUrl && (
            <Button onClick={handleDownloadZip} className="gap-1">
              <Download className="h-4 w-4" />
              すべての画像をダウンロード
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {imageResults.map((result, index) => (
          <Card key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                <span className="truncate">{result.filename}</span>
                {result.success && (
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleDownloadSingleImage(result.url, result.filename)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {result.success ? (
                <div className="relative pb-[100%] bg-slate-100">
                  <img 
                    src={result.url} 
                    alt={result.filename}
                    className="absolute inset-0 w-full h-full object-contain p-2" 
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 bg-red-50 text-red-600">
                  <File className="h-8 w-8 mr-2" />
                  <span className="text-sm">エラー: {result.error || '不明なエラー'}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResultDownload; 