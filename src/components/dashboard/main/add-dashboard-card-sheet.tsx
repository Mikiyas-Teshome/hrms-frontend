"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import {
  X,
  Search,
  BarChart3,
  LineChart,
  PieChart,
  PencilLine,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// ─────────────────────────────────────────────────────────────────────────────
// Chart preview mini-components
// ─────────────────────────────────────────────────────────────────────────────

function TablePreview() {
  return (
    <div className="w-25 h-25 border border-border rounded-[5px] overflow-hidden flex bg-background">
      {[0, 1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col flex-1 border-r border-border last:border-r-0">
          <div className="h-3.5 bg-secondary border-b border-border shrink-0" />
          {Array.from({ length: 9 }).map((_, row) => (
            <div key={row} className="flex-1 border-b border-border last:border-b-0" />
          ))}
        </div>
      ))}
    </div>
  )
}

function PieChartPreview() {
  return (
    <div className="w-25 h-25 flex items-center justify-center bg-background">
      <svg width="84" height="84" viewBox="0 0 84 84">
        {/* Filled segments approximated as colored slices */}
        <circle cx="42" cy="42" r="42" fill="#EA580C" />
        <path d="M42 42 L42 0 A42 42 0 0 1 84 42 Z" fill="#F59E0B" />
        <path d="M42 42 L84 42 A42 42 0 0 1 42 84 Z" fill="#FBBF24" />
        <path d="M42 42 L42 84 A42 42 0 0 1 0 42 Z" fill="#164E63" />
        <path d="M42 42 L0 42 A42 42 0 0 1 42 0 Z" fill="#0D9488" />
        {/* Donut hole */}
        <circle cx="42" cy="42" r="18" fill="white" />
      </svg>
    </div>
  )
}

function LineChartPreview() {
  return (
    <div className="w-25 h-25 flex items-center justify-center bg-background overflow-hidden">
      <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lcTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lcOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid baseline */}
        <line x1="0" y1="72" x2="100" y2="72" stroke="#E5E5E5" strokeWidth="1" />
        {/* Teal area + line */}
        <polygon points="0,58 20,44 40,54 60,46 80,50 100,48 100,72 0,72" fill="url(#lcTeal)" />
        <polyline points="0,58 20,44 40,54 60,46 80,50 100,48" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Orange area + line */}
        <polygon points="0,34 20,14 40,28 60,20 80,24 100,18 100,72 0,72" fill="url(#lcOrange)" />
        <polyline points="0,34 20,14 40,28 60,20 80,24 100,18" fill="none" stroke="#EA580C" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function BarChartPreview() {
  const bars = [
    { x: 4,  h: 39 },
    { x: 20, h: 88 },
    { x: 36, h: 50 },
    { x: 52, h: 67 },
    { x: 68, h: 39 },
    { x: 84, h: 54 },
  ]
  return (
    <div className="w-25 h-25 flex items-center justify-center bg-background">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <line x1="0" y1="98" x2="100" y2="98" stroke="#E5E5E5" strokeWidth="1" />
        {bars.map(({ x, h }, i) => (
          <rect key={i} x={x} y={98 - h} width="12" height={h} rx="3" fill="#EA580C" />
        ))}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CardDef {
  id: string
  title: string
  description: string
  details?: string
  type: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconColor: string
}

interface AddDashboardCardSheetProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (cardId: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Card Structure sub-view
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = ["Engineering", "Production", "Sales", "Marketing", "HR"]
const SCOPES      = ["Department", "Team", "Location", "Division"]

const VIZ_OPTIONS = [
  { id: "table",      label: "Table",      Preview: TablePreview },
  { id: "pie_chart",  label: "Pie chart",  Preview: PieChartPreview },
  { id: "line_chart", label: "Line chart", Preview: LineChartPreview },
  { id: "bar_chart",  label: "Bar chart",  Preview: BarChartPreview },
]

interface EditCardStructureViewProps {
  card: CardDef
  onBack: () => void
  onClose: () => void
  isRTL: boolean
}

function EditCardStructureView({ card, onBack, onClose, isRTL }: EditCardStructureViewProps) {
  const [roleName, setRoleName]         = React.useState("")
  const [scope, setScope]               = React.useState("Department")
  const [selectedDepts, setSelectedDepts] = React.useState<string[]>(["Engineering", "Production", "Sales", "Marketing"])
  const [visualization, setVisualization] = React.useState("bar_chart")

  const toggleDept = (dept: string) =>
    setSelectedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    )

  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  return (
    <div className={cn("flex flex-col h-full bg-background text-foreground", isRTL && "direction-rtl")}>
      {/* ── Header ── */}
      <div className={cn("flex flex-col pt-6 gap-6 shrink-0", isRTL ? "px-10" : "px-10")}>
        {/* Top action row */}
        <div className={cn("flex flex-row items-start w-full h-9", isRTL ? "flex-row-reverse" : "justify-between")}>
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-muted transition-colors"
          >
            <BackIcon className="w-4 h-4 text-foreground/80" />
            <span className="font-medium text-sm leading-5 text-foreground/80">Back</span>
          </button>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-muted text-foreground/80"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Card title */}
        <div className="flex items-center h-8">
          <h2 className={cn("text-2xl font-bold leading-8 text-foreground", isRTL && "text-right w-full")}>
            {card.title}
          </h2>
        </div>

        {/* Divider */}
        <div className="border-b border-border" />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-10 py-6 flex flex-col gap-6">

        {/* Card settings panel */}
        <div className="flex flex-col w-full bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
          <div className={cn("flex items-center px-6 h-12.5 bg-secondary/60", isRTL && "justify-end")}>
            <span className="font-semibold text-sm leading-none text-foreground">Card settings</span>
          </div>
          <div className="flex flex-col px-6 py-6 gap-6">
            {/* Row 1: Role name + Distribution scope */}
            <div className={cn("flex gap-6 items-start", isRTL ? "flex-row-reverse" : "flex-row")}>
              <div className="flex flex-col gap-3 flex-1">
                <label className={cn("font-medium text-sm leading-5 text-foreground", isRTL && "text-right")}>
                  Role name
                </label>
                <Input
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="Enter role name"
                  dir={isRTL ? "rtl" : "ltr"}
                  className="h-9 border-border bg-background shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <label className={cn("font-medium text-sm leading-5 text-foreground", isRTL && "text-right")}>
                  Distribution scope
                </label>
                <div className="relative">
                  <select
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    dir={isRTL ? "rtl" : "ltr"}
                    className="w-full h-9 px-3 pr-9 border border-border rounded-lg bg-background text-sm text-foreground shadow-[0px_1px_2px_rgba(0,0,0,0.05)] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none", isRTL ? "left-3" : "right-3")} />
                </div>
              </div>
            </div>

            {/* Row 2: Departments to include */}
            <div className="flex flex-col gap-4">
              <label className={cn("font-medium text-sm leading-5 text-foreground", isRTL && "text-right")}>
                Departments to include
              </label>
              <div className={cn("flex flex-row flex-wrap gap-x-6 gap-y-4", isRTL && "flex-row-reverse")}>
                {DEPARTMENTS.map(dept => (
                  <label key={dept} className={cn("flex items-center gap-3 cursor-pointer", isRTL && "flex-row-reverse")}>
                    <Checkbox
                      checked={selectedDepts.includes(dept)}
                      onCheckedChange={() => toggleDept(dept)}
                      className="w-4 h-4 rounded-[4px] border-border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="font-medium text-sm leading-none text-foreground">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visualization panel */}
        <div className="flex flex-col w-full bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
          <div className={cn("flex items-center px-6 h-12.5 bg-secondary/60", isRTL && "justify-end")}>
            <span className="font-semibold text-sm leading-none text-foreground">Visualization</span>
          </div>
          <div className="px-6 py-6">
            <div className={cn("grid grid-cols-2 gap-x-16 gap-y-8", isRTL && "direction-rtl")}>
              {VIZ_OPTIONS.map(({ id, label, Preview }) => (
                <label
                  key={id}
                  className={cn(
                    "flex items-center gap-6 cursor-pointer",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={() => setVisualization(id)}
                >
                  {/* Checkbox + label */}
                  <div className={cn("flex flex-col justify-center gap-3 w-30", isRTL && "items-end")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <Checkbox
                        checked={visualization === id}
                        onCheckedChange={() => setVisualization(id)}
                        className="w-4 h-4 rounded-[4px] border-border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="font-medium text-sm leading-none text-foreground">{label}</span>
                    </div>
                  </div>
                  {/* Chart preview */}
                  <div className={cn(
                    "rounded-lg overflow-hidden border transition-all",
                    visualization === id
                      ? "border-primary/50 ring-1 ring-primary/20"
                      : "border-border"
                  )}>
                    <Preview />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={cn("flex items-end px-10 py-4 gap-6 border-t border-border shrink-0", isRTL ? "flex-row-reverse justify-end" : "flex-row justify-end")}>
        <Button
          variant="outline"
          onClick={onBack}
          className="h-9 min-w-25 border-border text-foreground/80 font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
        >
          Cancel
        </Button>
        <Button
          onClick={onBack}
          className="h-9 min-w-25 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
        >
          Save role
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AddDashboardCardSheet
// ─────────────────────────────────────────────────────────────────────────────

export function AddDashboardCardSheet({ isOpen, onClose, onAdd }: AddDashboardCardSheetProps) {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"

  const [activeCategory, setActiveCategory] = React.useState("workforce")
  const [selectedCards, setSelectedCards]   = React.useState<string[]>([])
  const [editingCard, setEditingCard]       = React.useState<CardDef | null>(null)

  // Reset editing view when sheet closes
  React.useEffect(() => {
    if (!isOpen) setEditingCard(null)
  }, [isOpen])

  const categories = [
    { id: "workforce",               label: t("edit.categories.workforce") },
    { id: "attendanceAndTime",       label: t("edit.categories.attendanceAndTime") },
    { id: "leave",                   label: t("edit.categories.leave") },
    { id: "payroll",                 label: t("edit.categories.payroll") },
    { id: "documentsAndCompliance",  label: t("edit.categories.documentsAndCompliance") },
    { id: "benefits",                label: t("edit.categories.benefits") },
    { id: "notifications",           label: t("edit.categories.notifications") },
    { id: "actions",                 label: t("edit.categories.actions") },
    { id: "reportsAndInsights",      label: t("edit.categories.reportsAndInsights") },
    { id: "others",                  label: t("edit.categories.others") },
  ]

  const cards: CardDef[] = [
    {
      id: "employee_distribution",
      title: t("edit.dashboardCards.employeeDistribution.title"),
      description: t("edit.dashboardCards.employeeDistribution.desc"),
      details: t("edit.dashboardCards.employeeDistribution.details"),
      type: t("edit.dashboardCards.employeeDistribution.type"),
      icon: BarChart3,
      iconColor: "#A855F7",
    },
    {
      id: "new_hires_exits",
      title: t("edit.dashboardCards.newHiresExits.title"),
      description: t("edit.dashboardCards.newHiresExits.desc"),
      type: t("edit.dashboardCards.newHiresExits.type"),
      icon: LineChart,
      iconColor: "#10B981",
    },
    {
      id: "status_overview",
      title: t("edit.dashboardCards.statusOverview.title"),
      description: t("edit.dashboardCards.statusOverview.desc"),
      type: t("edit.dashboardCards.statusOverview.type"),
      icon: PieChart,
      iconColor: "#EA580C",
    },
  ]

  const toggleCard = (id: string) =>
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isRTL ? "left" : "right"}
        className="p-0 w-234.75 max-w-234.75 border-none shadow-2xl overflow-hidden"
        showCloseButton={false}
      >
        {/* Edit card structure overlay — slides in over the card list */}
        {editingCard ? (
          <EditCardStructureView
            card={editingCard}
            onBack={() => setEditingCard(null)}
            onClose={onClose}
            isRTL={isRTL}
          />
        ) : (
          <div className="flex flex-col h-full bg-background text-foreground">
            {/* ── Header ── */}
            <div className="flex flex-col p-[24px_40px_0px] gap-6">
              <div className="flex items-center justify-between w-full h-9">
                <div className="flex items-center gap-12 flex-1">
                  <SheetTitle className="text-2xl font-bold leading-[32px] text-foreground whitespace-nowrap">
                    {t("edit.addCardTitle")}
                  </SheetTitle>

                  <div className="relative w-87.5 shrink-0">
                    <Search className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none",
                      isRTL ? "right-3" : "left-3"
                    )} />
                    <Input
                      placeholder={t("edit.searchCardPlaceholder")}
                      className={cn(
                        "h-9 w-full bg-background border-border rounded-lg text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus-visible:ring-primary",
                        isRTL ? "pr-10 text-right" : "pl-10 text-left"
                      )}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="w-11 h-9 rounded-lg hover:bg-muted shrink-0 text-foreground/80"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-6 border-b border-border" />
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden p-[24px_40px] gap-6">
              {/* Category sidebar */}
              <div className="w-50.25 flex flex-col gap-1 shrink-0 overflow-y-auto pr-2 pb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center px-4 h-8 rounded-lg text-sm transition-colors",
                      isRTL ? "text-right" : "text-left",
                      activeCategory === cat.id
                        ? "bg-muted font-medium text-foreground"
                        : "text-foreground hover:bg-muted font-normal"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Card grid */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                <h2 className="text-lg font-bold leading-[32px] text-foreground">
                  {t("edit.workforceCards")}
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6 pr-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex flex-col w-75 h-52.5 bg-card border border-border rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] hover:border-primary/50 transition-all cursor-pointer relative"
                      onClick={() => toggleCard(card.id)}
                    >
                      {/* Card header row */}
                      <div className="flex items-center justify-between px-4 h-12.5 bg-muted/50 rounded-t-xl shrink-0 border-b border-border">
                        <Checkbox
                          checked={selectedCards.includes(card.id)}
                          onCheckedChange={() => toggleCard(card.id)}
                          className="w-4 h-4 rounded-[4px] border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="flex items-center justify-center px-2 h-5 bg-background border border-border rounded-lg">
                          <span className="text-xs font-semibold text-foreground">{card.type}</span>
                        </div>

                        {/* Edit icon — opens EditCardStructureView */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg text-foreground/80 hover:bg-background/50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(card)
                          }}
                        >
                          <PencilLine className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Card body */}
                      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
                        <div className="w-13 h-[44px] flex items-center justify-center rounded-lg border border-border/50">
                          <card.icon className="w-7 h-7" style={{ color: card.iconColor }} />
                        </div>

                        <div className="text-center space-y-1">
                          <p className="text-base font-semibold leading-4 text-foreground">{card.title}</p>
                          <p className="text-sm font-normal leading-4.25 text-muted-foreground">{card.description}</p>
                        </div>

                        {card.details && (
                          <p className="text-xs font-normal text-muted-foreground">{card.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex justify-end p-[16px_40px_24px] gap-6 bg-background border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-9 min-w-25 border-muted-foreground text-foreground/80 font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              >
                {t("edit.cancel")}
              </Button>
              <Button
                onClick={() => {
                  selectedCards.forEach(id => onAdd(id))
                  onClose()
                }}
                className="h-9 min-w-25 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              >
                {t("edit.saveRole")}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
