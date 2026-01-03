import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Download, 
  Search, 
  SlidersHorizontal, 
  Building2, 
  Briefcase, 
  ExternalLink, 
  Phone, 
  Mail, 
  Save, 
  RotateCcw,
  Menu,
  X,
  Languages,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import rawData from "@/assets/attendees.json";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import heroBg from "@/assets/hero-bg.jpg";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { translations, type Language } from "@/lib/i18n";

// --- Types ---
type Attendee = {
  "分類": string;
  name: string;
  email: string;
  phone_number: string | number;
  "What company do you work for?": string;
  "What is your job title?": string;
  "What is your LinkedIn profile?": string;
  approval_status: string;
  created_at: string;
  ticket_name: string;
  "Country / Region": string;
  "洽談情況": string;
  "目標優先級": string;
  "notes"?: string; // New field for notes
  [key: string]: any;
};

// --- Utils ---
const CATEGORY_COLORS: Record<string, string> = {
  "AI品牌": "var(--chart-3)", // Green
  "VC/投資人": "var(--chart-2)", // Magenta
  "其他": "var(--chart-4)", // Yellow
};

const STATUS_OPTIONS = ["未開始", "洽談中", "已確認", "不感興趣"];
const PRIORITY_OPTIONS = ["高", "中", "低"];
const APPROVAL_OPTIONS = ["approved", "pending_approval"];

const STORAGE_KEY = "side-event-attendees-data-v1";
const LANG_STORAGE_KEY = "side-event-lang-pref";

export default function Home() {
  // --- Language State ---
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key;

  // --- State with LocalStorage Initialization ---
  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    // Initialize raw data with empty notes if needed
    return (rawData as unknown as Attendee[]).map(a => ({ ...a, notes: a.notes || "" }));
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [approvalFilter, setApprovalFilter] = useState("ALL");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- Persistence Effect ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
  }, [attendees]);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    return attendees.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item["What company do you work for?"].toLowerCase().includes(search.toLowerCase()) ||
        item["What is your job title?"].toLowerCase().includes(search.toLowerCase());
      
      const matchCategory = categoryFilter === "ALL" || item["分類"] === categoryFilter;
      const matchStatus = statusFilter === "ALL" || item["洽談情況"] === statusFilter;
      const matchPriority = priorityFilter === "ALL" || item["目標優先級"] === priorityFilter;
      const matchApproval = approvalFilter === "ALL" || item.approval_status === approvalFilter;

      return matchSearch && matchCategory && matchStatus && matchPriority && matchApproval;
    });
  }, [attendees, search, categoryFilter, statusFilter, priorityFilter, approvalFilter]);

  // --- Stats Logic ---
  const stats = useMemo(() => {
    const total = filteredData.length;
    const byCategory = filteredData.reduce((acc, curr) => {
      acc[curr["分類"]] = (acc[curr["分類"]] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, byCategory };
  }, [filteredData]);

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));

  // --- Handlers ---
  const handleExport = () => {
    // Add notes to export
    const headers = ["分類", "Name", "Company", "Title", "Email", "Phone", "LinkedIn", "Status", "Priority", "Approval", "Notes"].join(",");
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers + "\n" +
      filteredData.map(e => {
        const row = [
          e["分類"],
          e.name,
          e["What company do you work for?"],
          e["What is your job title?"],
          e.email,
          e.phone_number,
          e["What is your LinkedIn profile?"],
          e["洽談情況"],
          e["目標優先級"],
          e.approval_status,
          e.notes || ""
        ].map(v => `"${String(v).replace(/"/g, '""')}"`); // Escape quotes
        return row.join(",");
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `attendees_export_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success(t("msg.export_success"));
  };

  const handleUpdateAttendee = (index: number, field: keyof Attendee, value: string) => {
    // Find absolute index in main array
    const target = filteredData[index];
    const newAttendees = attendees.map(a => 
      (a.name === target.name && a.email === target.email) ? { ...a, [field]: value } : a
    );
    setAttendees(newAttendees);
  };

  const handleResetData = () => {
    if (confirm(t("msg.confirm_reset"))) {
      localStorage.removeItem(STORAGE_KEY);
      setAttendees((rawData as unknown as Attendee[]).map(a => ({ ...a, notes: "" })));
      toast.success(t("msg.reset_success"));
    }
  };

  const toggleLang = () => {
    setLang(l => l === 'en' ? 'zh' : 'en');
  };

  // --- Components ---
  const ApprovalBadge = ({ status }: { status: string }) => {
    const isApproved = status === 'approved';
    return (
      <div className={cn(
        "flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit",
        isApproved 
          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
      )}>
        {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
        {t(`approval.${status}` as any)}
      </div>
    );
  };

  const FilterSection = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={t("search.placeholder")} 
          className="pl-8 bg-background/50 border-white/10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase">{t("category.label")}</label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("option.all_categories")}</SelectItem>
            <SelectItem value="AI品牌">{t("stats.ai_brands")}</SelectItem>
            <SelectItem value="VC/投資人">{t("stats.investors")}</SelectItem>
            <SelectItem value="其他">{t("stats.others")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase">{t("approval.label")}</label>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("option.all")}</SelectItem>
            {APPROVAL_OPTIONS.map(o => (
              <SelectItem key={o} value={o}>{t(`approval.${o}` as any)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-semibold uppercase">{t("status.label")}</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("option.all")}</SelectItem>
              {STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-semibold uppercase">{t("priority.label")}</label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("option.all")}</SelectItem>
              {PRIORITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-2">
         <Button className="w-full gap-2" onClick={handleExport}>
           <Download className="h-4 w-4" /> {t("action.export")}
         </Button>
         <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-destructive" onClick={handleResetData}>
           <RotateCcw className="h-4 w-4" /> {t("action.reset")}
         </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 dark bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 glass border-b border-white/10 p-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          Pulse<span className="text-primary">.AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLang} className="text-muted-foreground">
             <span className="text-xs font-bold">{lang === 'en' ? 'EN' : '中'}</span>
          </Button>
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-l-white/10">
              <SheetHeader>
                <SheetTitle>{t("filters.title")}</SheetTitle>
                <SheetDescription>{t("filters.desc")}</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSection />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Hero */}
      <div className="hidden lg:block relative h-[250px] w-full overflow-hidden mb-8 border-b border-white/10">
        <div className="absolute inset-0 bg-background/80 z-10" />
        <img 
          src={heroBg} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
        />
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-6">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="w-fit mb-4 bg-primary/20 text-primary border-primary/50">{t("ces.tool")}</Badge>
              <h1 className="text-4xl font-bold">{t("attendee.manager")}</h1>
              <p className="text-muted-foreground mt-2">{t("hero.subtitle")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLang} className="gap-2 bg-black/20 border-white/10 backdrop-blur-sm">
              <Languages className="h-4 w-4" />
              {lang === 'en' ? 'English' : '中文'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 space-y-6 lg:space-y-8 pt-4 lg:pt-0">
        
        {/* Mobile Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          <Card className="glass p-4 flex flex-col justify-center items-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">{t("stats.total")}</div>
          </Card>
          <Card className="glass p-4 flex flex-col justify-center items-center border-l-2" style={{ borderLeftColor: CATEGORY_COLORS["AI品牌"] }}>
            <div className="text-2xl font-bold">{stats.byCategory["AI品牌"] || 0}</div>
            <div className="text-xs text-muted-foreground">{t("stats.ai_brands")}</div>
          </Card>
          <Card className="glass p-4 flex flex-col justify-center items-center border-l-2" style={{ borderLeftColor: CATEGORY_COLORS["VC/投資人"] }}>
            <div className="text-2xl font-bold">{stats.byCategory["VC/投資人"] || 0}</div>
            <div className="text-xs text-muted-foreground">{t("stats.investors")}</div>
          </Card>
           <Card className="glass p-4 hidden md:flex flex-col justify-center items-center border-l-2" style={{ borderLeftColor: CATEGORY_COLORS["其他"] }}>
            <div className="text-2xl font-bold">{stats.byCategory["其他"] || 0}</div>
            <div className="text-xs text-muted-foreground">{t("stats.others")}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
             <Card className="glass sticky top-8">
               <CardHeader><CardTitle>{t("controls.title")}</CardTitle></CardHeader>
               <CardContent><FilterSection /></CardContent>
             </Card>
             <Card className="glass mt-4">
                <CardContent className="p-4 h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#8884d8"} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                     </PieChart>
                   </ResponsiveContainer>
                </CardContent>
             </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mobile Search Bar (Visible only on mobile) */}
            <div className="lg:hidden relative">
               <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder={t("search.placeholder")}
                  className="pl-9 bg-card border-white/10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card className="glass overflow-hidden min-h-[500px]">
              <CardHeader className="pb-3 border-b border-white/5 flex flex-row justify-between items-center">
                <CardTitle>{t("list.title")}</CardTitle>
                <Badge variant="outline">{filteredData.length}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                 {/* Mobile Card View */}
                 <div className="lg:hidden">
                    {filteredData.map((attendee, i) => (
                      <div key={i} className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg">{attendee.name}</div>
                            <div className="text-sm text-primary font-medium">{attendee["What company do you work for?"]}</div>
                            <div className="text-xs text-muted-foreground">{attendee["What is your job title?"]}</div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <ApprovalBadge status={attendee.approval_status} />
                                {attendee["What is your LinkedIn profile?"] && (
                                   <a 
                                     href={attendee["What is your LinkedIn profile?"]} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="text-xs text-primary flex items-center gap-1 hover:underline w-fit"
                                   >
                                     LinkedIn <ExternalLink className="h-3 w-3" />
                                   </a>
                                 )}
                            </div>
                          </div>
                          <Badge 
                             variant="outline" 
                             className="shrink-0"
                             style={{ color: CATEGORY_COLORS[attendee["分類"]] }}
                           >
                             {attendee["分類"]}
                           </Badge>
                        </div>
                        
                        {/* Quick Actions / Status */}
                        <div className="grid grid-cols-2 gap-2">
                           <Select 
                              value={attendee["洽談情況"]} 
                              onValueChange={(val) => handleUpdateAttendee(i, "洽談情況", val)}
                            >
                             <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               {STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                             </SelectContent>
                           </Select>
                           <Select 
                              value={attendee["目標優先級"]} 
                              onValueChange={(val) => handleUpdateAttendee(i, "目標優先級", val)}
                            >
                             <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10">
                               <SelectValue placeholder="Priority" />
                             </SelectTrigger>
                             <SelectContent>
                               {PRIORITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                             </SelectContent>
                           </Select>
                        </div>

                        {/* Expandable Notes Section */}
                        <div className="bg-black/20 rounded-lg p-3 space-y-2">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                             <Phone className="h-3 w-3" /> {attendee.phone_number}
                             <span className="text-white/20">|</span>
                             <Mail className="h-3 w-3" /> {attendee.email && attendee.email.substring(0, 15)}...
                           </div>
                           <Textarea 
                             placeholder={t("notes.placeholder")}
                             className="min-h-[60px] text-sm bg-transparent border-white/10 resize-none focus-visible:ring-1"
                             value={attendee.notes || ""}
                             onChange={(e) => handleUpdateAttendee(i, "notes", e.target.value)}
                           />
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Desktop Table View */}
                 <div className="hidden lg:block overflow-x-auto">
                   <Table>
                     <TableHeader className="bg-white/5">
                       <TableRow className="border-white/10">
                         <TableHead className="w-[180px]">{t("col.name_contact")}</TableHead>
                         <TableHead className="w-[200px]">{t("col.company")}</TableHead>
                         <TableHead className="w-[120px]">{t("col.approval")}</TableHead>
                         <TableHead className="w-[120px]">{t("col.status")}</TableHead>
                         <TableHead className="w-[100px]">{t("col.priority")}</TableHead>
                         <TableHead>{t("col.notes")}</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {filteredData.map((attendee, i) => (
                         <TableRow key={i} className="hover:bg-white/5 border-white/10 group align-top">
                           <TableCell>
                             <div className="font-bold">{attendee.name}</div>
                             <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                               <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {attendee.phone_number}</span>
                               <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {attendee.email && attendee.email.substring(0, 15)}...</span>
                             </div>
                             <Badge variant="outline" className="mt-2 text-[10px]" style={{ color: CATEGORY_COLORS[attendee["分類"]] }}>
                               {attendee["分類"]}
                             </Badge>
                           </TableCell>
                           <TableCell>
                             <div className="font-medium text-sm">{attendee["What company do you work for?"]}</div>
                             <div className="text-xs text-muted-foreground">{attendee["What is your job title?"]}</div>
                             {attendee["What is your LinkedIn profile?"] && (
                               <a href={attendee["What is your LinkedIn profile?"]} target="_blank" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                                 LinkedIn <ExternalLink className="h-3 w-3" />
                               </a>
                             )}
                           </TableCell>
                           <TableCell>
                             <ApprovalBadge status={attendee.approval_status} />
                           </TableCell>
                           <TableCell>
                             <Select value={attendee["洽談情況"]} onValueChange={(val) => handleUpdateAttendee(i, "洽談情況", val)}>
                               <SelectTrigger className="h-8 text-xs bg-white/5"><SelectValue /></SelectTrigger>
                               <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                             </Select>
                           </TableCell>
                           <TableCell>
                             <Select value={attendee["目標優先級"]} onValueChange={(val) => handleUpdateAttendee(i, "目標優先級", val)}>
                               <SelectTrigger className="h-8 text-xs bg-white/5"><SelectValue /></SelectTrigger>
                               <SelectContent>{PRIORITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                             </Select>
                           </TableCell>
                           <TableCell>
                             <Textarea 
                               placeholder={t("notes.placeholder")}
                               className="min-h-[80px] text-sm bg-transparent border-white/10 resize-none"
                               value={attendee.notes || ""}
                               onChange={(e) => handleUpdateAttendee(i, "notes", e.target.value)}
                             />
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
