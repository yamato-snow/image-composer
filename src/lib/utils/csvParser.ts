/**
 * CSVファイルを解析して行と列のデータとして返す
 * @param csvText CSVテキスト
 * @param delimiter 区切り文字（デフォルトはカンマ）
 * @param hasHeader ヘッダー行があるかどうか
 * @returns 解析結果（ヘッダーと行データ）
 */
export const parseCSV = (
  csvText: string,
  delimiter: string = ",",
  hasHeader: boolean = true
): {
  headers: string[];
  rows: string[][];
} => {
  // 改行で分割して行を取得
  const lines = csvText
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // 各行をデリミタで分割
  const parsedRows = lines.map(line => {
    // カンマ区切りの中のダブルクォートで囲まれた値を適切に処理
    const result: string[] = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // エスケープされた引用符
          currentValue += '"';
          i++; // 次の引用符をスキップ
        } else {
          // 引用符の開始または終了
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        // 区切り文字に達した場合（引用符の外）
        result.push(currentValue);
        currentValue = "";
      } else {
        // 通常の文字
        currentValue += char;
      }
    }

    // 最後の値を追加
    result.push(currentValue);
    return result;
  });

  // ヘッダーと行データを分離
  let headers: string[] = [];
  let rows: string[][] = [];

  if (hasHeader && parsedRows.length > 0) {
    headers = parsedRows[0];
    rows = parsedRows.slice(1);
  } else {
    rows = parsedRows;
    // ヘッダーがない場合は列インデックスを自動生成
    if (rows.length > 0) {
      headers = Array.from({ length: rows[0].length }, (_, i) => `Column ${i + 1}`);
    }
  }

  return { headers, rows };
};

/**
 * 行データをオブジェクトの配列に変換する
 * @param headers ヘッダー（キー名）
 * @param rows 行データ
 * @returns オブジェクトの配列
 */
export const convertToObjects = (
  headers: string[],
  rows: string[][]
): Record<string, string>[] => {
  return rows.map(row => {
    const obj: Record<string, string> = {};
    
    // 各行のデータをヘッダーをキーとしてオブジェクトに変換
    headers.forEach((header, index) => {
      if (index < row.length) {
        obj[header] = row[index];
      } else {
        obj[header] = ""; // 値がない場合は空文字を設定
      }
    });
    
    return obj;
  });
};

/**
 * CSVテキストを解析してオブジェクトの配列として返す
 * @param csvText CSVテキスト
 * @param delimiter 区切り文字（デフォルトはカンマ）
 * @param hasHeader ヘッダー行があるかどうか
 * @returns オブジェクトの配列
 */
export const parseCSVToObjects = (
  csvText: string,
  delimiter: string = ",",
  hasHeader: boolean = true
): {
  headers: string[];
  data: Record<string, string>[];
} => {
  const { headers, rows } = parseCSV(csvText, delimiter, hasHeader);
  const data = convertToObjects(headers, rows);
  return { headers, data };
};

/**
 * CSVファイルの内容を検証して問題がないか確認する
 * @param headers ヘッダー
 * @param rows 行データ
 * @returns 検証結果
 */
export const validateCSV = (
  headers: string[],
  rows: string[][]
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // ヘッダーが空の場合
  if (headers.length === 0) {
    errors.push("ヘッダーが存在しません");
    return { valid: false, errors };
  }

  // 重複するヘッダーがないか確認
  const uniqueHeaders = new Set(headers);
  if (uniqueHeaders.size !== headers.length) {
    errors.push("重複するヘッダーが存在します");
  }

  // 各行のデータ数がヘッダー数と一致するか確認
  rows.forEach((row, index) => {
    if (row.length !== headers.length) {
      errors.push(`行 ${index + 1} のデータ数がヘッダー数と一致しません（${row.length} vs ${headers.length}）`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * オブジェクトの配列をCSVテキストに変換する
 * @param data オブジェクトの配列
 * @param headers 使用するヘッダー（指定がない場合は最初のオブジェクトのキーを使用）
 * @param delimiter 区切り文字（デフォルトはカンマ）
 * @returns CSVテキスト
 */
export const convertToCSV = (
  data: Record<string, string>[],
  headers?: string[],
  delimiter: string = ","
): string => {
  if (data.length === 0) {
    return "";
  }

  // ヘッダーが指定されていない場合は最初のオブジェクトのキーを使用
  const effectiveHeaders = headers || Object.keys(data[0]);

  // ヘッダー行の生成
  const headerRow = effectiveHeaders.map(header => {
    // 区切り文字やダブルクォートを含む場合はダブルクォートで囲む
    if (header.includes(delimiter) || header.includes('"') || header.includes('\n')) {
      return `"${header.replace(/"/g, '""')}"`;
    }
    return header;
  }).join(delimiter);

  // データ行の生成
  const rows = data.map(obj => {
    return effectiveHeaders.map(header => {
      const value = obj[header] || "";
      // 区切り文字やダブルクォートを含む場合はダブルクォートで囲む
      if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(delimiter);
  });

  // ヘッダーとデータ行を結合
  return [headerRow, ...rows].join('\n');
};

/**
 * CSVファイル解析ユーティリティ
 * CSVファイルを読み込み、解析して使いやすい形式に変換する関数群
 */

/**
 * CSVファイルを読み込み、内容を文字列として返す
 * @param file 読み込むCSVファイル
 * @returns CSVファイルの内容を含むPromise
 */
export const readCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('ファイルの読み込みに失敗しました'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込み中にエラーが発生しました'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * CSVファイルを読み込み、直接オブジェクト配列に変換
 * @param file 読み込むCSVファイル
 * @param delimiter 区切り文字（デフォルトはカンマ）
 * @param hasHeader ヘッダー行があるかどうか
 * @returns オブジェクトの配列を含むPromise
 */
export const parseCSVFile = async (
  file: File,
  delimiter: string = ',',
  hasHeader: boolean = true
): Promise<{
  headers: string[];
  data: Record<string, string>[];
}> => {
  const csvString = await readCSVFile(file);
  return parseCSVToObjects(csvString, delimiter, hasHeader);
}; 