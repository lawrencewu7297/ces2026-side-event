import { statusColors, statusOptions } from "@/types";
import type { ExhibitorWithState, VisitStatus } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Star, Trash2, ExternalLink, MapPin, Globe, Mail, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExhibitorDetailProps {
  exhibitor: ExhibitorWithState | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: VisitStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ExhibitorDetail({ 
  exhibitor, 
  open, 
  onOpenChange, 
  onUpdateStatus, 
  onUpdateNotes,
  onToggleStar,
  onDelete
}: ExhibitorDetailProps) {
  const { t } = useLanguage();
  if (!exhibitor) return null;

  const { iid, 名称, booths, category, 关于, website, contact, 国家, isXFactor, userState } = exhibitor;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col bg-card border-l border-border/50">
        <SheetHeader className="p-6 pb-2 space-y-4">
            <div className="flex justify-between items-start gap-4">
                <SheetTitle className="text-2xl font-bold leading-tight text-foreground">{名称}</SheetTitle>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStar(iid)}
                        className={userState.isStarred ? "text-amber-400" : "text-muted-foreground"}
                    >
                        <Star className={cn("h-5 w-5", userState.isStarred && "fill-current")} />
                    </Button>
                    {isXFactor && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                            if(confirm(t.actions.confirmDelete)) {
                                onDelete(iid);
                                onOpenChange(false);
                            }
                        }}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {category?.split(',').map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{cat.trim()}</Badge>
                ))}
            </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 pb-8">
                {/* Status & Notes Section */}
                <div className="bg-secondary/20 p-4 rounded-lg space-y-4 border border-border/50">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-muted-foreground">{t.actions.visitStatus}</label>
                        <Select 
                            value={userState.status} 
                            onValueChange={(val) => onUpdateStatus(iid, val as VisitStatus)}
                        >
                            <SelectTrigger className={cn("w-full border-0 ring-1 ring-border", statusColors[userState.status])}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{t.status[opt]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">{t.actions.meetingNotes}</label>
                        <Textarea 
                            placeholder={t.actions.notesPlaceholder}
                            value={userState.notes}
                            onChange={(e) => onUpdateNotes(iid, e.target.value)}
                            className="min-h-[120px] bg-background/50 resize-none focus-visible:ring-primary/50"
                        />
                    </div>
                </div>

                <Separator />

                {/* Info Section */}
                <div className="space-y-4 text-sm">
                    {booths && (
                        <div className="flex gap-3">
                            <MapPin className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="font-medium mb-1 text-foreground">{t.actions.boothLocation}</h4>
                                <p className="text-muted-foreground">{booths}</p>
                            </div>
                        </div>
                    )}
                    
                    {国家 && (
                        <div className="flex gap-3">
                            <Globe className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="font-medium mb-1 text-foreground">{t.filters.country}</h4>
                                <p className="text-muted-foreground">{国家}</p>
                            </div>
                        </div>
                    )}

                    {website && (
                        <div className="flex gap-3">
                            <ExternalLink className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="font-medium mb-1 text-foreground">{t.actions.website}</h4>
                                <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                    {website}
                                </a>
                            </div>
                        </div>
                    )}

                    {contact && (
                         <div className="flex gap-3">
                            <Mail className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="font-medium mb-1 text-foreground">{t.actions.contactInfo}</h4>
                                <p className="text-muted-foreground whitespace-pre-line">{contact}</p>
                            </div>
                        </div>
                    )}

                    {关于 && (
                         <div className="flex gap-3">
                            <Info className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="font-medium mb-1 text-foreground">{t.actions.about}</h4>
                                <p className="text-muted-foreground leading-relaxed">{关于}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
