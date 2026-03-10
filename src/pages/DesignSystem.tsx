/**
 * ============================================================
 * デザインシステム — ライブコンポーネントリファレンス
 * ============================================================
 *
 * ルート: /design-system
 *
 * 目的: すべてのUIコンポーネントをバリエーション付きで一覧表示し、
 *       バックエンドエンジニアがコードをコピー＆ペーストで再利用できるようにする。
 *
 * 注意: このページはログイン不要（開発参照用）
 */

import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from "@/components/ui/tooltip";
import {
  AlertTriangle, Check, Copy, Info, Moon, Palette, Sun, Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_HUE, COMPANY } from "@/lib/constants";
import { toast } from "sonner";

/* ────────── helper: section wrapper ────────── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <h2 className="text-base font-bold text-foreground border-b border-border pb-2">{title}</h2>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
);

/* ────────── page component ────────── */
const DesignSystem = () => {
  const { theme, toggleTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-bold">S-Prime Design System</h1>
            <Badge variant="outline" className="text-[10px]">{COMPANY.version}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Brand Hue: <code className="text-primary font-mono">{BRAND_HUE}</code></span>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-1.5 text-xs">
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ─── COLOR TOKENS ─── */}
        <Section title="Color Tokens">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: "primary", cls: "bg-primary text-primary-foreground" },
              { name: "secondary", cls: "bg-secondary text-secondary-foreground" },
              { name: "destructive", cls: "bg-destructive text-destructive-foreground" },
              { name: "success", cls: "bg-success text-success-foreground" },
              { name: "warning", cls: "bg-warning text-warning-foreground" },
              { name: "info", cls: "bg-info text-info-foreground" },
              { name: "muted", cls: "bg-muted text-muted-foreground" },
              { name: "accent", cls: "bg-accent text-accent-foreground" },
              { name: "card", cls: "bg-card text-card-foreground border border-border" },
              { name: "background", cls: "bg-background text-foreground border border-border" },
              { name: "popover", cls: "bg-popover text-popover-foreground border border-border" },
              { name: "sidebar", cls: "bg-sidebar text-sidebar-foreground border border-border" },
            ].map((c) => (
              <div key={c.name} className={cn("rounded-lg p-3 text-center text-xs font-medium", c.cls)}>
                {c.name}
              </div>
            ))}
          </div>
        </Section>

        {/* ─── BUTTONS ─── */}
        <Section title="Buttons">
          <Row label="Variants">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </Row>
          <Row label="Sizes">
            <Button size="lg">Large</Button>
            <Button size="default">Default</Button>
            <Button size="sm">Small</Button>
            <Button size="icon"><Check className="w-4 h-4" /></Button>
          </Row>
          <Row label="States">
            <Button disabled>Disabled</Button>
            <Button className="gap-1.5"><Copy className="w-3.5 h-3.5" /> With Icon</Button>
          </Row>
        </Section>

        {/* ─── BADGES ─── */}
        <Section title="Badges">
          <Row label="Variants">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </Row>
          <Row label="Semantic (custom class)">
            <Badge className="bg-success/20 text-success border-success/30">Success</Badge>
            <Badge className="bg-warning/20 text-warning border-warning/30">Warning</Badge>
            <Badge className="bg-info/20 text-info border-info/30">Info</Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30">Primary Light</Badge>
          </Row>
        </Section>

        {/* ─── INPUTS ─── */}
        <Section title="Form Inputs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Text Input</Label>
              <Input placeholder="プレースホルダー" />
            </div>
            <div className="space-y-1.5">
              <Label>Disabled</Label>
              <Input placeholder="入力不可" disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="パスワード" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Textarea</Label>
              <Textarea placeholder="複数行のテキスト入力" />
            </div>
            <div className="space-y-1.5">
              <Label>Select</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Option A</SelectItem>
                  <SelectItem value="b">Option B</SelectItem>
                  <SelectItem value="c">Option C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Row label="Toggle Controls">
            <div className="flex items-center gap-2">
              <Switch id="sw-demo" />
              <Label htmlFor="sw-demo" className="text-xs">Switch</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-demo" />
              <Label htmlFor="cb-demo" className="text-xs">Checkbox</Label>
            </div>
          </Row>
        </Section>

        {/* ─── CARDS ─── */}
        <Section title="Cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Default Card</CardTitle>
                <CardDescription>Standard card component</CardDescription>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">Card body content.</p></CardContent>
              <CardFooter><Button size="sm">Action</Button></CardFooter>
            </Card>
            <Card className="card-glow border-glow">
              <CardHeader>
                <CardTitle className="text-sm">Glow Card</CardTitle>
                <CardDescription>With hover glow effect</CardDescription>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">Hover over this card.</p></CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm text-primary">Accent Card</CardTitle>
                <CardDescription>Highlighted variant</CardDescription>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">For emphasis.</p></CardContent>
            </Card>
          </div>
        </Section>

        {/* ─── TABS ─── */}
        <Section title="Tabs">
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab One</TabsTrigger>
              <TabsTrigger value="tab2">Tab Two</TabsTrigger>
              <TabsTrigger value="tab3">Tab Three</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1"><Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Content for Tab 1</p></CardContent></Card></TabsContent>
            <TabsContent value="tab2"><Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Content for Tab 2</p></CardContent></Card></TabsContent>
            <TabsContent value="tab3"><Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Content for Tab 3</p></CardContent></Card></TabsContent>
          </Tabs>
        </Section>

        {/* ─── TABLE ─── */}
        <Section title="Table">
          <Card>
            <CardContent className="px-0 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Code</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">Amount</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { code: "ITM-001", name: "シリコンウェーハ 300mm", amount: "¥85,000", status: "success" },
                    { code: "ITM-002", name: "フォトレジスト AZ-5214", amount: "¥120,000", status: "warning" },
                    { code: "ITM-003", name: "高純度窒素ガス（N2）", amount: "¥45,000", status: "destructive" },
                  ].map((row) => (
                    <TableRow key={row.code} className="border-border hover:bg-secondary/50">
                      <TableCell className="text-xs font-mono text-primary">{row.code}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-foreground">{row.amount}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", {
                          "bg-success/10 text-success border-success/30": row.status === "success",
                          "bg-warning/10 text-warning border-warning/30": row.status === "warning",
                          "bg-destructive/10 text-destructive border-destructive/30": row.status === "destructive",
                        })}>{row.status === "success" ? "充足" : row.status === "warning" ? "注意" : "不足"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Section>

        {/* ─── DIALOG / MODAL ─── */}
        <Section title="Dialog / Modal">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm">Dialog Title</DialogTitle>
                <DialogDescription className="text-xs">
                  This is a dialog description. Confirm your action below.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label className="text-xs">入力フィールド</Label>
                <Input className="mt-1.5" placeholder="テキスト入力" />
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => { setDialogOpen(false); toast.success("Action confirmed"); }}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* ─── PROGRESS ─── */}
        <Section title="Progress & Indicators">
          <Row label="Progress Bar">
            <div className="w-full max-w-md space-y-2">
              <Progress value={25} className="h-2" />
              <Progress value={60} className="h-2" />
              <Progress value={90} className="h-2" />
            </div>
          </Row>
          <Row label="Status Dots">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs"><span className="status-dot-success" /> Success</span>
              <span className="flex items-center gap-1.5 text-xs"><span className="status-dot-warning" /> Warning</span>
              <span className="flex items-center gap-1.5 text-xs"><span className="status-dot-destructive" /> Error</span>
            </div>
          </Row>
        </Section>

        {/* ─── TOOLTIP ─── */}
        <Section title="Tooltip">
          <Row label="Hover to see">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5"><Info className="w-3.5 h-3.5" /> Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </Row>
        </Section>

        {/* ─── SEPARATOR ─── */}
        <Section title="Separator">
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-3 h-6">
              <span className="text-xs text-muted-foreground">Left</span>
              <Separator orientation="vertical" />
              <span className="text-xs text-muted-foreground">Right</span>
            </div>
          </div>
        </Section>

        {/* ─── UTILITIES ─── */}
        <Section title="Utility Classes">
          <Row label="text-gradient">
            <span className="text-gradient text-lg font-bold">Gradient Text</span>
          </Row>
          <Row label="data-text (monospace)">
            <span className="data-text text-foreground">¥68,750,000</span>
          </Row>
          <Row label="card-glow + border-glow">
            <div className="card-glow border-glow rounded-lg bg-card px-4 py-3">
              <span className="text-xs text-foreground">Hover for glow</span>
            </div>
          </Row>
          <Row label="animate-slide-up">
            <div className="animate-slide-up bg-secondary rounded-lg px-4 py-3">
              <span className="text-xs text-foreground">Slide-up animation</span>
            </div>
          </Row>
        </Section>

        {/* ─── TOAST ─── */}
        <Section title="Toast / Sonner">
          <Row label="Click to trigger">
            <Button size="sm" variant="outline" onClick={() => toast.success("成功しました！")}>Success Toast</Button>
            <Button size="sm" variant="outline" onClick={() => toast.error("エラーが発生しました")}>Error Toast</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("情報メッセージ")}>Info Toast</Button>
            <Button size="sm" variant="outline" onClick={() => toast.warning("警告メッセージ")}>Warning Toast</Button>
          </Row>
        </Section>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>{COMPANY.name} Design System Reference — {COMPANY.version}</p>
          <p className="mt-1">
            Edit <code className="text-primary">src/index.css</code> (CSS variables) or <code className="text-primary">src/lib/constants.ts</code> (BRAND_HUE) to change the theme.
          </p>
        </div>

      </main>
    </div>
  );
};

export default DesignSystem;
