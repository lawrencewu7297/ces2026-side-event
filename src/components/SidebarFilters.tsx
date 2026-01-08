import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { statusOptions } from "@/types";
import type { VisitStatus } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterState {
  search: string;
  venue: string;
  country: string;
  status: VisitStatus | 'All';
  onlyStarred: boolean;
}

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  venues: string[];
  countries: string[];
}

export function SidebarFilters({ filters, setFilters, venues, countries }: SidebarFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t.filters.search}</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="starred">{t.filters.starredOnly}</Label>
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="starred" 
                    checked={filters.onlyStarred}
                    onCheckedChange={(checked) => setFilters({ ...filters, onlyStarred: !!checked })}
                />
            </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.filters.status}</Label>
        <Select 
            value={filters.status} 
            onValueChange={(val) => setFilters({ ...filters, status: val as VisitStatus | 'All' })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.filters.allStatuses} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t.filters.allStatuses}</SelectItem>
            {statusOptions.map(opt => (
              <SelectItem key={opt} value={opt}>{t.status[opt]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.filters.venue}</Label>
        <Select 
            value={filters.venue} 
            onValueChange={(val) => setFilters({ ...filters, venue: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.filters.allVenues} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t.filters.allVenues}</SelectItem>
            {venues.map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.filters.country}</Label>
         <Select 
            value={filters.country} 
            onValueChange={(val) => setFilters({ ...filters, country: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.filters.allCountries} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t.filters.allCountries}</SelectItem>
            {countries.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setFilters({ search: '', venue: 'All', country: 'All', status: 'All', onlyStarred: false })}
      >
        <X className="mr-2 h-4 w-4" /> {t.filters.clearFilters}
      </Button>
    </div>
  );
}
