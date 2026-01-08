import { useState, useMemo } from 'react';
import { useExhibitors } from '@/hooks/use-exhibitors';
import { SidebarFilters } from '@/components/SidebarFilters';
import { ExhibitorCard } from '@/components/ExhibitorCard';
import { ExhibitorDetail } from '@/components/ExhibitorDetail';
import { AddExhibitorDialog } from '@/components/AddExhibitorDialog';
import { Button } from '@/components/ui/button';
import type { VisitStatus } from '@/types';
import { Loader2, Download, Filter, Search, Globe } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import heroImg from '@/assets/hero.jpg';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { exhibitors, loading, actions } = useExhibitors();
  const { t, language, setLanguage } = useLanguage();
  
  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    venue: 'All',
    country: 'All',
    status: 'All' as VisitStatus | 'All',
    onlyStarred: false
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Selected Exhibitor for Detail View
  const [selectedExhibitorId, setSelectedExhibitorId] = useState<string | null>(null);

  // Memoized Unique Values for Filters
  const { venues, countries } = useMemo(() => {
    const vSet = new Set<string>();
    const cSet = new Set<string>();
    exhibitors.forEach(e => {
        if(e.booths) {
            // Simple heuristic for venue: take first part before comma or '—'
            const mainVenue = e.booths.split('—')[0].trim();
            if(mainVenue) vSet.add(mainVenue);
        }
        if(e.国家) cSet.add(e.国家);
    });
    return {
        venues: Array.from(vSet).sort(),
        countries: Array.from(cSet).sort()
    };
  }, [exhibitors]);

  // Filtering Logic
  const filteredExhibitors = useMemo(() => {
    return exhibitors.filter(e => {
        const matchSearch = !filters.search || e.名称.toLowerCase().includes(filters.search.toLowerCase());
        const matchVenue = filters.venue === 'All' || (e.booths && e.booths.includes(filters.venue));
        const matchCountry = filters.country === 'All' || e.国家 === filters.country;
        const matchStatus = filters.status === 'All' || e.userState.status === filters.status;
        const matchStarred = !filters.onlyStarred || e.userState.isStarred;

        return matchSearch && matchVenue && matchCountry && matchStatus && matchStarred;
    });
  }, [exhibitors, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredExhibitors.length / itemsPerPage);
  const currentExhibitors = filteredExhibitors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useMemo(() => setCurrentPage(1), [filters]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const selectedExhibitor = exhibitors.find(e => e.iid === selectedExhibitorId) || null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Hero Header */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden shrink-0">
         <img src={heroImg} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="CES Hero" />
         <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
         <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full max-w-7xl mx-auto flex justify-between items-end">
            <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 drop-shadow-lg">{t.appTitle}</h1>
                <p className="text-slate-200 text-sm md:text-base max-w-xl drop-shadow-md">
                    {t.appSubtitle}
                </p>
            </div>
            <div className="hidden md:flex gap-3">
                <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10"
                    onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                >
                    <Globe className="h-4 w-4 mr-2" />
                    {language === 'en' ? '中文' : 'English'}
                </Button>
                <AddExhibitorDialog onAdd={actions.addXFactor} />
                <Button variant="secondary" onClick={actions.exportData} className="gap-2 shadow-lg">
                    <Download className="h-4 w-4" /> {t.actions.exportCSV}
                </Button>
            </div>
         </div>
      </div>

      <div className="flex-1 max-w-[1920px] mx-auto w-full p-4 md:p-6 grid md:grid-cols-[280px_1fr] gap-6 relative">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> {t.filters.title}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="py-4">
                         <h3 className="font-bold mb-4 text-lg">{t.filters.title}</h3>
                         <SidebarFilters filters={filters} setFilters={setFilters} venues={venues} countries={countries} />
                    </div>
                </SheetContent>
            </Sheet>
             <div className="flex gap-2">
                 <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                >
                    <Globe className="h-4 w-4" />
                </Button>
                <AddExhibitorDialog onAdd={actions.addXFactor} />
                <Button variant="secondary" size="icon" onClick={actions.exportData}>
                    <Download className="h-4 w-4" />
                </Button>
             </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block space-y-6">
             <div className="sticky top-6 bg-card border border-border/50 rounded-xl p-4 shadow-sm">
                <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" /> {t.filters.title}
                </h3>
                <SidebarFilters filters={filters} setFilters={setFilters} venues={venues} countries={countries} />
             </div>

             {/* Mini Stats */}
             <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm text-primary">{t.stats.progress}</h4>
                <div className="flex justify-between text-sm">
                    <span>{t.stats.visited}</span>
                    <span className="font-bold">{exhibitors.filter(e => e.userState.status === 'Visited').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                     <span>{t.stats.toVisit}</span>
                    <span className="font-bold">{exhibitors.filter(e => e.userState.status === 'To Visit').length}</span>
                </div>
                 <div className="flex justify-between text-sm">
                     <span>{t.stats.starred}</span>
                    <span className="font-bold">{exhibitors.filter(e => e.userState.isStarred).length}</span>
                </div>
             </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col h-full min-h-[500px]">
            <div className="flex justify-between items-center mb-4">
                 <p className="text-muted-foreground text-sm">
                    {t.common.showing} <span className="font-bold text-foreground">{filteredExhibitors.length}</span> {t.common.results}
                 </p>
                 <div className="text-xs text-muted-foreground hidden sm:block">
                    {t.common.page} {currentPage} {t.common.of} {totalPages || 1}
                 </div>
            </div>

            {filteredExhibitors.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{t.common.noResults}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        {t.common.tryAdjusting}
                    </p>
                    <Button 
                        variant="link" 
                        onClick={() => setFilters({ search: '', venue: 'All', country: 'All', status: 'All', onlyStarred: false })}
                    >
                        {t.common.clearAll}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                    {currentExhibitors.map(exhibitor => (
                        <ExhibitorCard 
                            key={exhibitor.iid} 
                            exhibitor={exhibitor} 
                            onToggleStar={actions.toggleStar}
                            onClick={() => setSelectedExhibitorId(exhibitor.iid)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-auto py-4 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {/* Simple Pagination Logic: Show current, prev, next */}
                            {currentPage > 2 && (
                                <PaginationItem>
                                     <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                                </PaginationItem>
                            )}
                            {currentPage > 3 && <PaginationItem>...</PaginationItem>}

                            {currentPage > 1 && (
                                 <PaginationItem>
                                     <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</PaginationLink>
                                </PaginationItem>
                            )}

                             <PaginationItem>
                                 <PaginationLink isActive>{currentPage}</PaginationLink>
                            </PaginationItem>

                            {currentPage < totalPages && (
                                 <PaginationItem>
                                     <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</PaginationLink>
                                </PaginationItem>
                            )}

                             {currentPage < totalPages - 2 && <PaginationItem>...</PaginationItem>}
                             
                             {currentPage < totalPages - 1 && (
                                <PaginationItem>
                                     <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
      </div>

      <ExhibitorDetail 
        exhibitor={selectedExhibitor}
        open={!!selectedExhibitorId}
        onOpenChange={(open) => !open && setSelectedExhibitorId(null)}
        onUpdateStatus={actions.updateStatus}
        onUpdateNotes={actions.updateNotes}
        onToggleStar={actions.toggleStar}
        onDelete={actions.removeExhibitor}
      />
    </div>
  );
}
