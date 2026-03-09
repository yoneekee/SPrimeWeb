/**
 * ページネーション共通UIコンポーネント
 * 
 * usePagination()フックと組み合わせて使用
 * 
 * 使用例:
 *   const pagination = usePagination(filteredData, 10);
 *   <PaginationControls pagination={pagination} />
 */

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationResult } from "@/hooks/use-pagination";

interface PaginationControlsProps {
  pagination: PaginationResult<any>;
  pageSizeOptions?: number[];
  showPageNumbers?: boolean;
}

export const PaginationControls = ({
  pagination,
  pageSizeOptions = [5, 10, 15, 20],
  showPageNumbers = true,
}: PaginationControlsProps) => {
  const { 
    currentPage, 
    itemsPerPage, 
    totalPages, 
    totalItems, 
    startIndex, 
    endIndex,
    goToPage,
    prevPage,
    nextPage,
    changeItemsPerPage,
  } = pagination;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      {/* Left: Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">表示件数</span>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(v) => changeItemsPerPage(Number(v))}
        >
          <SelectTrigger className="h-7 w-20 text-xs border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}件
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {totalItems}件中 {startIndex}-{endIndex}件
        </span>
      </div>

      {/* Right: Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={currentPage === 1}
            onClick={prevPage}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          {showPageNumbers && (
            <>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={currentPage === totalPages}
            onClick={nextPage}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
