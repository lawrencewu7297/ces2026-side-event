import { statusColors } from "@/types";
import type { ExhibitorWithState } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, MapPin, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExhibitorCardProps {
  exhibitor: ExhibitorWithState;
  onToggleStar: (id: string) => void;
  onClick: () => void;
}

export function ExhibitorCard({ exhibitor, onToggleStar, onClick }: ExhibitorCardProps) {
  const { t } = useLanguage();
  const { 名称, booths, userState, 国家, website } = exhibitor;
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all hover:border-primary/50 cursor-pointer h-full flex flex-col",
        userState.isStarred && "border-amber-500/30 bg-amber-500/5"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-bold leading-tight line-clamp-2 min-h-[2.5rem]">
            {名称}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 -mt-1 -mr-2 shrink-0 transition-colors",
              userState.isStarred ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground hover:text-amber-400"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(exhibitor.iid);
            }}
          >
            <Star className={cn("h-5 w-5", userState.isStarred && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {booths && (
            <>
                <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-secondary-foreground" title={booths.split('—')[0].trim()}>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{booths.split('—')[0].trim()}</span>
                </div>
                 {booths.split('—')[1] && (
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-primary font-bold border border-primary/20">
                        <span className="truncate max-w-[100px]">{booths.split('—')[1].trim()}</span>
                    </div>
                )}
            </>
          )}
          {国家 && (
            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-secondary-foreground">
              <Globe className="h-3 w-3" />
              <span>{国家}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
            <Badge variant="outline" className={cn("text-xs font-normal", statusColors[userState.status])}>
                {t.status[userState.status]}
            </Badge>
            {website && (
                <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
