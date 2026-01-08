import { useState, useEffect, useMemo } from 'react';
import type { Exhibitor, UserState, ExhibitorWithState, VisitStatus } from '@/types';
import exhibitorsData from '@/assets/exhibitors.json';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const STORAGE_KEY_USER_STATES = 'ces_tracker_user_states';
const STORAGE_KEY_X_FACTORS = 'ces_tracker_x_factors';

export function useExhibitors() {
  const [userStates, setUserStates] = useState<Record<string, UserState>>({});
  const [xFactors, setXFactors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data from local storage
  useEffect(() => {
    try {
      const savedStates = localStorage.getItem(STORAGE_KEY_USER_STATES);
      if (savedStates) {
        setUserStates(JSON.parse(savedStates));
      }
      
      const savedXFactors = localStorage.getItem(STORAGE_KEY_X_FACTORS);
      if (savedXFactors) {
        setXFactors(JSON.parse(savedXFactors));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_USER_STATES, JSON.stringify(userStates));
    }
  }, [userStates, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_X_FACTORS, JSON.stringify(xFactors));
    }
  }, [xFactors, loading]);

  // Merge static data, x-factors, and user states
  const allExhibitors = useMemo(() => {
    const staticData = (exhibitorsData as any[]).map(e => ({
      ...e,
      isXFactor: false
    }));
    
    const combined = [...staticData, ...xFactors];
    
    return combined.map((exhibitor): ExhibitorWithState => {
      const state = userStates[exhibitor.iid] || {
        isStarred: false,
        status: 'None',
        notes: ''
      };
      return { ...exhibitor, userState: state };
    });
  }, [xFactors, userStates]);

  // Actions
  const toggleStar = (iid: string) => {
    setUserStates(prev => {
      const current = prev[iid] || { isStarred: false, status: 'None', notes: '' };
      return {
        ...prev,
        [iid]: { ...current, isStarred: !current.isStarred }
      };
    });
  };

  const updateStatus = (iid: string, status: VisitStatus) => {
    setUserStates(prev => {
      const current = prev[iid] || { isStarred: false, status: 'None', notes: '' };
      return {
        ...prev,
        [iid]: { ...current, status }
      };
    });
  };

  const updateNotes = (iid: string, notes: string) => {
    setUserStates(prev => {
      const current = prev[iid] || { isStarred: false, status: 'None', notes: '' };
      return {
        ...prev,
        [iid]: { ...current, notes }
      };
    });
  };

  const addXFactor = (data: Omit<Exhibitor, 'iid' | 'isXFactor'>) => {
    const newExhibitor: Exhibitor = {
      ...data,
      iid: `xf-${nanoid()}`,
      isXFactor: true
    };
    setXFactors(prev => [newExhibitor, ...prev]);
    toast.success('X-Factor Exhibitor Added');
  };

  const removeExhibitor = (iid: string) => {
    if (iid.startsWith('xf-')) {
      setXFactors(prev => prev.filter(x => x.iid !== iid));
      // Clean up state
      setUserStates(prev => {
        const next = { ...prev };
        delete next[iid];
        return next;
      });
      toast.success('Exhibitor Removed');
    } else {
      toast.error('Cannot remove official exhibitors');
    }
  };

  const exportData = () => {
    const headers = ['ID', 'Name', 'Booth', 'Category', 'Country', 'Starred', 'Status', 'Notes', 'Website'];
    const csvContent = [
      headers.join(','),
      ...allExhibitors.map(e => [
        e.iid,
        `"${(e.名称 || '').replace(/"/g, '""')}"`,
        `"${(e.booths || '').replace(/"/g, '""')}"`,
        `"${(e.category || '').replace(/"/g, '""')}"`,
        `"${(e.国家 || '').replace(/"/g, '""')}"`,
        e.userState.isStarred ? 'Yes' : 'No',
        e.userState.status,
        `"${(e.userState.notes || '').replace(/"/g, '""')}"`,
        e.website || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ces_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exhibitors: allExhibitors,
    loading,
    actions: {
      toggleStar,
      updateStatus,
      updateNotes,
      addXFactor,
      removeExhibitor,
      exportData
    }
  };
}
