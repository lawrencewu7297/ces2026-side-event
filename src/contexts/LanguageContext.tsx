import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: 'CES Tracker',
    appSubtitle: 'Track your visits, manage key accounts, and organize your exhibition schedule efficiently.',
    searchPlaceholder: 'Search exhibitors...',
    filters: {
      title: 'Filters',
      search: 'Search',
      starredOnly: 'Starred Only',
      status: 'Status',
      allStatuses: 'All Statuses',
      venue: 'Venue',
      allVenues: 'All Venues',
      country: 'Country',
      allCountries: 'All Countries',
      clearFilters: 'Clear Filters',
    },
    status: {
      'None': 'None',
      'To Visit': 'To Visit',
      'Visited': 'Visited',
      'Contacted': 'Contacted',
      'Follow Up': 'Follow Up',
    },
    actions: {
      addXFactor: 'Add X-Factor',
      exportCSV: 'Export CSV',
      save: 'Save Exhibitor',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this exhibitor?',
      visitStatus: 'Visit Status',
      meetingNotes: 'Meeting Notes',
      notesPlaceholder: 'Add communication notes, meeting minutes, or follow-up items...',
      boothLocation: 'Booth Location',
      website: 'Website',
      contactInfo: 'Contact Info',
      about: 'About',
    },
    dialog: {
      addTitle: 'Add New Exhibitor',
      addDesc: 'Add a new exhibitor to your tracking list manually.',
      name: 'Name',
      booth: 'Booth',
      category: 'Category',
      contact: 'Contact',
    },
    stats: {
      progress: 'Your Progress',
      visited: 'Visited',
      toVisit: 'To Visit',
      starred: 'Starred',
    },
    common: {
      showing: 'Showing',
      results: 'results',
      page: 'Page',
      of: 'of',
      noResults: 'No exhibitors found',
      tryAdjusting: 'Try adjusting your filters or search terms.',
      clearAll: 'Clear all filters',
    },
  },
  zh: {
    appTitle: 'CES 展商追蹤',
    appSubtitle: '高效管理您的展會行程，追蹤拜訪進度與重點客戶。',
    searchPlaceholder: '搜尋展商...',
    filters: {
      title: '篩選條件',
      search: '搜尋',
      starredOnly: '僅顯示重點 (星號)',
      status: '拜訪狀態',
      allStatuses: '所有狀態',
      venue: '展館',
      allVenues: '所有展館',
      country: '國家',
      allCountries: '所有國家',
      clearFilters: '清除篩選',
    },
    status: {
      'None': '未標記',
      'To Visit': '待拜訪',
      'Visited': '已拜訪',
      'Contacted': '已聯繫',
      'Follow Up': '需跟進',
    },
    actions: {
      addXFactor: '新增 X-Factor',
      exportCSV: '匯出報表',
      save: '儲存展商',
      delete: '刪除',
      confirmDelete: '確定要刪除此展商嗎？',
      visitStatus: '拜訪狀態',
      meetingNotes: '會議筆記',
      notesPlaceholder: '新增溝通記錄、會議紀要或跟進事項...',
      boothLocation: '攤位位置',
      website: '網站',
      contactInfo: '聯絡資訊',
      about: '關於',
    },
    dialog: {
      addTitle: '新增展商',
      addDesc: '手動新增一位展商到您的追蹤清單。',
      name: '名稱',
      booth: '攤位',
      category: '類別',
      contact: '聯絡人',
    },
    stats: {
      progress: '拜訪進度',
      visited: '已拜訪',
      toVisit: '待拜訪',
      starred: '重點客戶',
    },
    common: {
      showing: '顯示',
      results: '筆結果',
      page: '第',
      of: '頁，共',
      noResults: '找不到展商',
      tryAdjusting: '試著調整篩選條件或搜尋關鍵字。',
      clearAll: '清除所有篩選',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese as per user request context
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
