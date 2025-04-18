'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CSVPreviewProps {
  data: string[][];
}

export default function CSVPreview({ data }: CSVPreviewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        CSVデータがありません。ファイルをアップロードしてください。
      </div>
    );
  }

  // ヘッダー行と残りのデータを分離
  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="w-full">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">CSVデータのプレビュー</h3>
        <p className="text-sm text-muted-foreground">
          {rows.length}行のデータが読み込まれました。
          処理を開始する前に内容を確認してください。
        </p>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
} 