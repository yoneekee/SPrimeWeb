/**
 * ページネーション共通ロジック - カスタムフック
 * 
 * 使用例:
 *   const { currentPage, itemsPerPage, paged, totalPages, goToPage, changeItemsPerPage } 
 *     = usePagination(filteredData, 10);
 * 
 *   <Table>
 *     {paged.map(item => <TableRow key={item.id}>...</TableRow>)}
 *   </Table>
 */

import { useState, useMemo } from "react";

export interface PaginationResult<T> {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  paged: T[];
  totalItems: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changeItemsPerPage: (perPage: number) => void;
}

/**
 * ページネーション処理を統一管理するカスタムフック
 * 
 * @param data - ページネーション対象のデータ配列
 * @param initialItemsPerPage - 初期表示件数 (デフォルト: 10)
 * @returns ページネーション制御オブジェクト
 */
export function usePagination<T>(
  data: T[],
  initialItemsPerPage: number = 10
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage) || 1;
  }, [data.length, itemsPerPage]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, data.length);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const changeItemsPerPage = (perPage: number) => {
    setItemsPerPage(perPage);
    setCurrentPage(1); // 件数変更時は1ページ目にリセット
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paged,
    totalItems: data.length,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    changeItemsPerPage,
  };
}
