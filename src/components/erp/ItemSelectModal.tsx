import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Check, Package } from "lucide-react";

export interface CatalogItem {
  code: string;
  name: string;
  spec?: string;
  unit: string;
  price: number;
  stockQty?: number;
}

interface ItemSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CatalogItem[];
  onSelect: (item: CatalogItem) => void;
  selectedCodes?: string[];
  showStock?: boolean;
  title?: string;
}

const ItemSelectModal = ({
  open,
  onOpenChange,
  items,
  onSelect,
  selectedCodes = [],
  showStock = false,
  title = "품목 선택",
}: ItemSelectModalProps) => {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.spec && item.spec.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (item: CatalogItem) => {
    onSelect(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="w-4 h-4 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center gap-1.5 bg-secondary rounded-md px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              placeholder="품목코드, 품목명, 규격으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <Badge variant="outline" className="text-xs px-2 py-1">
            {filteredItems.length}건
          </Badge>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border border-border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border bg-muted/50">
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3 w-10"></TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3">품목코드</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3">품목명</TableHead>
                {!showStock && (
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3">규격</TableHead>
                )}
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3 text-center">단위</TableHead>
                {showStock && (
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3 text-right">현재고</TableHead>
                )}
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3 text-right">단가</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-9 px-3 w-20 text-center">선택</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showStock ? 7 : 7} className="text-center py-8 text-muted-foreground text-sm">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedCodes.includes(item.code);
                  return (
                    <TableRow
                      key={item.code}
                      className={`border-border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => !isSelected && handleSelect(item)}
                    >
                      <TableCell className="px-3 py-2">
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary">
                        {item.code}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      {!showStock && (
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                          {item.spec || "-"}
                        </TableCell>
                      )}
                      <TableCell className="px-3 py-2 text-xs text-center text-muted-foreground">
                        {item.unit}
                      </TableCell>
                      {showStock && (
                        <TableCell className="px-3 py-2 text-xs text-right font-mono">
                          <span className={item.stockQty && item.stockQty <= 5 ? "text-warning" : "text-success"}>
                            {item.stockQty?.toLocaleString() ?? "-"}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                        ¥{item.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        {isSelected ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                            추가됨
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item);
                            }}
                          >
                            선택
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectModal;
