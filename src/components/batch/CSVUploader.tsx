'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseCSV } from '@/lib/utils/csvParser';

interface CSVUploaderProps {
  onUpload: (data: string[][]) => void;
}

export default function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setError(null);
    
    // CSVファイルのみを受け付ける
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('CSVまたはテキストファイルを選択してください');
      return;
    }
    
    try {
      const text = await file.text();
      const result = parseCSV(text);
      
      if (result.headers.length === 0 && result.rows.length === 0) {
        setError('CSVデータが空です');
        return;
      }
      
      // ヘッダーと行データをまとめて渡す
      const formattedData = [result.headers, ...result.rows];
      onUpload(formattedData);
    } catch (err) {
      setError('ファイルの解析に失敗しました: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">CSVファイルをアップロード</h3>
        <p className="text-sm text-muted-foreground">
          ヘッダー行を含むCSVファイルをアップロードしてください。
          1行目はヘッダー、2行目以降がデータとして処理されます。
        </p>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium mb-1">
            クリックしてCSVファイルを選択するか、ここにドラッグ＆ドロップ
          </p>
          <p className="text-xs text-muted-foreground">.csv または .txt ファイル</p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 