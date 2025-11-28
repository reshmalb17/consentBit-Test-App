import React, { useState, useEffect } from "react";
import "../style/styless.css";

import { customCodeApi } from "../services/api";
import webflow from "../types/webflowtypes";
import PulseAnimation from "./PulseAnimation";

// FIX: Added reset functionality to allow users to reset CSV export state
// without downloading the data or changing month/year. This resolves the issue
// where users couldn't revert back to the initial state after generating a CSV.

const base_url = "https://app.consentbit.com";

const closePDFIcon = new URL("../assets/Close-icon.png", import.meta.url).href;
const emptyIcon = new URL("../assets/emptybox.svg", import.meta.url).href;
// const resetIcon = new URL("../assets/reset-icon.svg", import.meta.url).href;

interface CSVExportAdvancedProps {
  isVisible: boolean;
  onClose: () => void;
  sessionToken: string | null;
  siteInfo: { siteId: string; siteName: string; shortName: string } | null;
  onReset?: () => void;
}

interface ExportStats {
  pagesFetched: number;
  recordsCollected: number;
  totalAvailable: number;
  totalPages: number;
  currentStatus: string;
  isExporting: boolean;
  isCounting: boolean;
}

interface VisitorData {
  visitorId: string;
  pdfUrl: string;
  lastConsentDate: string;
  status: string;
  preferences?: any;
  expectedCookies?: any[];
  metadata?: any;
  lastUpdated?: string;
}

interface MonthlyVisitorsData {
  month: string;
  year: number;
  visitors: VisitorData[];
  summary: {
    totalVisitors: number;
    acceptedCount: number;
    rejectedCount: number;
    partialCount: number;
  };
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CSVExportAdvanced: React.FC<CSVExportAdvancedProps> = ({ 
  isVisible, 
  onClose, 
  sessionToken, 
  siteInfo, 
  onReset 
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [allRecords, setAllRecords] = useState<string[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [stats, setStats] = useState<ExportStats>({
    pagesFetched: 0,
    recordsCollected: 0,
    totalAvailable: -1,
    totalPages: 0,
    currentStatus: "",
    isExporting: false,
    isCounting: false
  });
  const [showDownload, setShowDownload] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [csvData, setCsvData] = useState<string>('');
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyVisitorsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecordsAvailable, setTotalRecordsAvailable] = useState<number>(-1);

  useEffect(() => {
    if (isVisible) {
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
      loadVisitorsData();
    }
  }, [isVisible]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isVisible) {
      // Reset all state to initial values
      setAllRecords([]);
      setCsvHeaders([]);
      setCurrentPage(0);
      setStats({
        pagesFetched: 0,
        recordsCollected: 0,
        totalAvailable: -1,
        totalPages: 0,
        currentStatus: "",
        isExporting: false,
        isCounting: false
      });
      setShowDownload(false);
      setShowCancel(false);
      setShowClear(false);
      setProgress({ current: 0, total: 0, message: '' });
      setCsvData('');
      setVisitorData([]);
      setMonthlyData([]);
      setIsLoading(false);
      setTotalRecordsAvailable(-1);
      
      // Call onReset callback if provided
      if (onReset) {
        onReset();
      }
    }
  }, [isVisible, onReset]);

  // Load visitors data when component opens or month/year changes
  const loadVisitorsData = async () => {
    if (!sessionToken || !siteInfo) {
      return;
    }
    
    setIsLoading(true);
    try {
      const domain = getDomain();
      if (!domain) {
        setVisitorData([]);
        setMonthlyData([]);
        setIsLoading(false);
        return;
      }

      const response = await customCodeApi.getVisitorsData(sessionToken, domain, selectedYear, selectedMonth);
      
      if (response && response.monthlyData && response.monthlyData.length > 0) {
        setMonthlyData(response.monthlyData);
        
        // Since backend now filters by month, we should get only the selected month
        const monthData = response.monthlyData[0]; // First (and likely only) month
        
                 if (monthData && monthData.visitors.length > 0) {
           // Sort visitors by lastConsentDate in descending order (most recent first)
           const sortedVisitors = monthData.visitors.sort((a, b) => {
             // Simple direct comparison using lastConsentDate
             const dateA = new Date(a.lastConsentDate || 0);
             const dateB = new Date(b.lastConsentDate || 0);
             
             // Ensure we have valid dates
             if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
               return 0;
             }
             
             // Sort in descending order (newest first)
             return dateB.getTime() - dateA.getTime();
           });
           
                                               // Verify sorting worked correctly
       
            // Create a new array to ensure the sort is applied
            const finalSortedVisitors = [...sortedVisitors];
            
            // Double-check the sorting manually
            const manuallySorted = finalSortedVisitors.sort((a, b) => {
              const dateA = new Date(a.lastConsentDate || 0);
              const dateB = new Date(b.lastConsentDate || 0);
              return dateB.getTime() - dateA.getTime();
            });
        
            
            setVisitorData(manuallySorted);
           setTotalRecordsAvailable(sortedVisitors.length);
         } else {
           setVisitorData([]);
           setTotalRecordsAvailable(0);
         }
      } else {
        setVisitorData([]);
        setMonthlyData([]);
        setTotalRecordsAvailable(0);
      }
    } catch (error) {
      setVisitorData([]);
      setMonthlyData([]);
      setTotalRecordsAvailable(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load visitors data when month or year changes
  useEffect(() => {
    if (isVisible && sessionToken && siteInfo) {
      loadVisitorsData();
    }
  }, [selectedMonth, selectedYear, isVisible, sessionToken, siteInfo]);

  const getDomain = () => {
    const domain = siteInfo?.shortName || siteInfo?.siteName || siteInfo?.siteId || '';
    return domain;
  };

  // Test function to check if API is working
  const testAPI = async () => {
    if (!sessionToken) {
      return;
    }
    
    const domain = getDomain();
    if (!domain) {
      return;
    }
    
    try {
      const response = await customCodeApi.getVisitorsData(sessionToken, domain, 2024);
    } catch (error) {
      // Error handled silently
    }
  };

  const countRecords = async () => {
    const domain = getDomain();
    if (!domain) {
      setStats(prev => ({ ...prev, currentStatus: 'No site info found', isCounting: false }));
      return;
    }
    setStats(prev => ({ ...prev, isCounting: true, currentStatus: 'Counting records...' }));
    try {
      const response = await customCodeApi.getVisitorsData(sessionToken!, domain, selectedYear);
      if (response && response.monthlyData) {
        // Convert selectedMonth (0-11) to month number format (01-12)
        const monthNumber = String(selectedMonth + 1).padStart(2, '0');
        const monthData = response.monthlyData.find(md => md.month === monthNumber && md.year === selectedYear);
        const totalRecords = monthData ? monthData.visitors.length : 0;
        const totalPages = totalRecords > 0 ? 1 : 0; // For monthly data, it's typically 1 page
        setStats(prev => ({
          ...prev,
          totalAvailable: totalRecords,
          totalPages: totalPages,
          currentStatus: `Found ${totalRecords} records for ${monthNames[selectedMonth]} ${selectedYear}`,
          isCounting: false
        }));
      } else {
        setStats(prev => ({
          ...prev,
          currentStatus: 'No records found',
          isCounting: false
        }));
      }
    } catch (error) {
      setStats(prev => ({
        ...prev,
        currentStatus: `Count failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isCounting: false
      }));
    }
  };

  const exportAllRecords = async () => {
    const domain = getDomain();
    
    if (!domain) {
      setStats(prev => ({ ...prev, currentStatus: 'No site info found', isExporting: false }));
      return;
    }
    if (!sessionToken) {
      setStats(prev => ({ ...prev, currentStatus: 'No session token found', isExporting: false }));
      return;
    }
    setStats(prev => ({ 
      ...prev, 
      isExporting: true, 
      currentStatus: 'Starting data collection...',
      pagesFetched: 0,
      recordsCollected: 0,
      totalPages: 0
    }));
    setAllRecords([]);
    setCsvHeaders([]);
    setCurrentPage(0);
    setShowDownload(false);
    setShowCancel(true);
    setShowClear(false);
    try {
      await fetchAllRecords(domain);
    } catch (error) {
      setStats(prev => ({
        ...prev,
        currentStatus: `Data collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isExporting: false
      }));
      resetUI();
    }
  };

  const fetchAllRecords = async (domain: string) => {
    let pageCount = 0;
    let allCollectedRecords: string[] = [];
    let headers: string[] = [];
    try {
      const response = await customCodeApi.getVisitorsData(sessionToken!, domain, selectedYear);
      
      if (response && response.monthlyData) {
        // Convert selectedMonth (0-11) to month number format (01-12)
        const monthNumber = String(selectedMonth + 1).padStart(2, '0');
        const monthData = response.monthlyData.find(md => md.month === monthNumber && md.year === selectedYear);
        
        if (!monthData) {
          setStats(prev => ({ ...prev, currentStatus: 'No data for selected month/year', isExporting: false }));
          setShowCancel(false);
          return;
        }
        pageCount = 1;
        setCurrentPage(pageCount);
        setStats(prev => ({ 
          ...prev, 
          pagesFetched: pageCount,
          totalPages: 1,
          currentStatus: `Processing ${monthNames[selectedMonth]} ${selectedYear}...`
        }));
        const monthRecords = monthData.visitors.map((visitor, idx) => {
          const preferences = visitor.preferences || {};
          const metadata = visitor.metadata || {};
          
          // Handle both GDPR and CCPA preferences
          const prefsArray = [];
          
          // GDPR fields
          prefsArray.push(`Necessary: ${preferences.necessary !== undefined ? (preferences.necessary ? 'Yes' : 'No') : 'Yes'}`);
          if (preferences.marketing !== undefined) prefsArray.push(`Marketing: ${preferences.marketing ? 'Yes' : 'No'}`);
          if (preferences.personalization !== undefined) prefsArray.push(`Personalization: ${preferences.personalization ? 'Yes' : 'No'}`);
          if (preferences.analytics !== undefined) prefsArray.push(`Analytics: ${preferences.analytics ? 'Yes' : 'No'}`);
          
          // CCPA fields
          if (preferences.donotshare !== undefined) prefsArray.push(`Do Not Share: ${preferences.donotshare ? 'Yes' : 'No'}`);
          if (preferences.donotselldata !== undefined) prefsArray.push(`Do Not Sell Data: ${preferences.donotselldata ? 'Yes' : 'No'}`);
          if (preferences.targetedAdvertising !== undefined) prefsArray.push(`Targeted Advertising: ${preferences.targetedAdvertising ? 'Yes' : 'No'}`);
          if (preferences.sale !== undefined) prefsArray.push(`Sale: ${preferences.sale ? 'Yes' : 'No'}`);
          if (preferences.profiling !== undefined) prefsArray.push(`Profiling: ${preferences.profiling ? 'Yes' : 'No'}`);
          
          // Legacy field for backward compatibility
          if (preferences.doNotShare !== undefined) prefsArray.push(`Do Not Share (Legacy): ${preferences.doNotShare ? 'Yes' : 'No'}`);
          
          const prefsString = prefsArray.length > 0 ? prefsArray.join('; ') : 'N/A';
          
          // Enhanced metadata handling
          const metaArray = [];
          metaArray.push(`IP: ${preferences.ip || metadata?.ip || '-'}`);
          metaArray.push(`Banner Type: ${metadata?.bannerType || 'Unknown'}`);
          metaArray.push(`Country: ${preferences.country || metadata?.country || '-'}`);
          
          let timestampStr = '-';
          const timestampSource = metadata?.timestamp;
          if (timestampSource) {
            try { timestampStr = new Date(timestampSource).toLocaleString(); } catch { timestampStr = String(timestampSource); }
          }
        
          if (metadata?.userAgent) metaArray.push(`UA: ${metadata.userAgent}`);
          const metadataString = metaArray.join('; ');
          
          let lastUpdatedStr = '-';
          const lastUpdatedSource = preferences.lastUpdated || visitor.lastUpdated || visitor.lastConsentDate;
          if (lastUpdatedSource) {
            try { lastUpdatedStr = new Date(lastUpdatedSource).toLocaleString(); } catch { lastUpdatedStr = String(lastUpdatedSource); }
          }
          
          const pdfUrl = `${base_url}/api/v2/consent-data/${domain}/visitor/${visitor.visitorId}/report?format=pdf`;
          // Create Excel hyperlink for the PDF URL
          const excelHyperlink = `=HYPERLINK("${pdfUrl}","Download PDF")`;
          
          return [
            idx + 1,
            visitor.visitorId,
            visitor.status || 'Unknown',
            preferences.country || metadata?.country || '-', 
            prefsString,
            metadataString,
            lastUpdatedStr,
            excelHyperlink
          ].map(escapeCsvCell).join(',');
        });
        
        headers = ['#', 'Visitor ID', 'Status', 'Country', 'Consent Preferences', 'Metadata', 'Last Updated', 'PDF Link'];
        setCsvHeaders(headers);
        allCollectedRecords.push(...monthRecords);
        setAllRecords([...allCollectedRecords]);
        setStats(prev => ({ 
          ...prev, 
          recordsCollected: allCollectedRecords.length,
          currentStatus: `Page ${pageCount} complete. Total records: ${allCollectedRecords.length}`
        }));
        setShowDownload(true);
        setShowCancel(false);
      }
    } catch (error) {
      throw error;
    }
  };

  const escapeCsvCell = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }
    return stringValue;
  };

  const deduplicateByVisitorId = (records: string[]): string[] => {
    const seen = new Set();
    const deduped: string[] = [];
    for (const rec of records) {
      const columns = rec.split(',');
      if (columns.length > 1) {
        const id = columns[1].replace(/"/g, '');
        if (!seen.has(id)) {
          seen.add(id);
          deduped.push(rec);
        }
      }
    }
    return deduped;
  };

  const downloadCSV = () => {
    if (!csvHeaders.length || !allRecords.length) {
      alert('No data to download');
      return;
    }
    
    const uniqueRecords = deduplicateByVisitorId(allRecords);
    
    const csvContent = [
      csvHeaders.join(','),
      ...uniqueRecords
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent_report_${getDomain()}_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Reset UI to initial state after download
    setAllRecords([]);
    setCsvHeaders([]);
    setCurrentPage(0);
    setShowDownload(false);
    setShowCancel(false);
    setShowClear(false);
    setStats(prev => ({
      ...prev,
      pagesFetched: 0,
      recordsCollected: 0,
      totalAvailable: -1,
      totalPages: 0,
      currentStatus: "",
      isExporting: false,
      isCounting: false
    }));
  };

  const clearData = () => {
    setAllRecords([]);
    setCsvHeaders([]);
    setCurrentPage(0);
         setStats(prev => ({
       ...prev,
       pagesFetched: 0,
       recordsCollected: 0,
       totalAvailable: -1,
       totalPages: 0,
       currentStatus: '',
       isExporting: false,
       isCounting: false
     }));
    resetUI();
  };

  const cancelExport = () => {
    setStats(prev => ({ ...prev, isExporting: false }));
    if (allRecords.length > 0) {
      setStats(prev => ({
        ...prev,
        currentStatus: `Export cancelled. ${allRecords.length} records were collected and are available for download.`
      }));
      setShowDownload(true);
      setShowClear(true);
      setShowCancel(false);
    } else {
      setStats(prev => ({
         ...prev,
        currentStatus: 'Export cancelled - no data collected'
      }));
      resetUI();
    }
  };

  const resetUI = () => {
    setShowDownload(false);
    setShowCancel(false);
    setShowClear(false);
  };

  // Handle PDF download for individual visitor
  const handleDownloadPDF = async (pdfUrl: string, visitorId: string) => {
    try {
      if (!sessionToken) {
        throw new Error("No session token found");
      }
  
      const filename = `consent-report-${visitorId}.pdf`;
      await customCodeApi.downloadPDFFromUrl(sessionToken, pdfUrl, filename);
            
    } catch (error) {
      alert('Failed to download consent report. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="export-data-overlay">
      <div className="export-data-modal">
        <div className="export-data-header">
          <h2>Advanced CSV Export</h2>
          <img src={closePDFIcon} alt="Close" onClick={onClose} />
        </div>
        <div className="export-data-content">
          {/* Month and Year Selectors */}
          <div className="month-year-selector">
            <div className="select-group">
              <label>Month:</label>
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="month-select"
                disabled={stats.isExporting || stats.isCounting}
              >
                {monthNames.map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>
            </div>
            <div className="select-group">
              <label>Year:</label>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="year-select"
                disabled={stats.isExporting || stats.isCounting}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Total Records Available Display */}
          {/* <div className="total-records-display">
            <div className="records-info">
              <span className="records-label">Loading state: {isLoading ? 'Loading...' : 'Not loading'}</span>
              <span className="records-count">Total records: {totalRecordsAvailable}</span>
            </div>
            {totalRecordsAvailable === 0 && !isLoading && (
              <div className="no-records-message">
                No consent records found for the selected period.
              </div>
            )}
            {isLoading && (
              <div className="loading-message">
                Loading data...
              </div>
            )}
          </div> */}

          {/* Action Buttons */}
          <div className="action-buttons">
            {!stats.isExporting && !stats.isCounting && (
              <button
                className="action-btn primary"
                onClick={exportAllRecords}
                disabled={stats.isExporting || stats.isCounting}
              >
                Generate CSV Report
              </button>
            )}
            {/* <button
              className="action-btn secondary"
              onClick={testAPI}
              disabled={stats.isExporting || stats.isCounting}
            >
              Test API
            </button> */}
            {/* <button
              className="action-btn secondary"
              onClick={countRecords}
              disabled={stats.isExporting || stats.isCounting}
            >
              {stats.isCounting ? 'Counting...' : 'Count Total Records'}
            </button> */}
                         {showDownload && (
               <>
                 <button
                   className="action-btn success"
                   onClick={downloadCSV}
                 >
                   Download Complete CSV
                 </button>
               </>
             )}
                         {showClear && (
               <button
                 className="action-btn warning"
                 onClick={clearData}
               >
                 Clear Data
               </button>
             )}
            {showCancel && (
              <button
                className="action-btn danger"
                onClick={cancelExport}
              >
                Cancel Export
              </button>
            )}
          </div>

                    {/* Progress Bar */}
          {(stats.isExporting || stats.isCounting) && (
            <div className="progress-container active">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${stats.totalPages > 0 ? (stats.pagesFetched / stats.totalPages) * 100 : 0}%` 
                    }}
                ></div>
              </div>
              <div className="progress-text">
                {stats.isExporting && stats.totalPages > 0 
                  ? `${stats.pagesFetched}/${stats.totalPages} pages completed (${stats.recordsCollected} records)`
                  : stats.currentStatus
                }
              </div>
            </div>
          )}

          {/* Statistics */}
          {(stats.isExporting || stats.isCounting || stats.totalAvailable > 0 || stats.recordsCollected > 0) && (
           <div className="stats-container" style={{marginLeft: "24px"}}>
              <div className="stats-header">
                <strong>Export Progress:</strong>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Pages fetched:</span>
                  <span className="stat-value">{stats.pagesFetched}/{stats.totalPages}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Records collected:</span>
                  <span className="stat-value">{stats.recordsCollected}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total records available:</span>
                  <span className="stat-value">{totalRecordsAvailable > 0 ? totalRecordsAvailable : '-'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Progress:</span>
                  <span className="stat-value">
                    {stats.totalPages > 0 ? `${Math.round((stats.pagesFetched / stats.totalPages) * 100)}%` : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {stats.currentStatus && (
            <div className={`status-message ${stats.currentStatus.includes('failed') || stats.currentStatus.includes('error') ? 'error' : 'success'}`}>
              {stats.currentStatus}
            </div>
          )}

      

          {/* Visitor Data Table */}
          {visitorData.length > 0 && (
            <div className="visitor-data-section">
              <h3>Available Consent Reports</h3>
              
              {!isLoading && (
                <div className="visitor-data-table">
                  <div className="table-header">
                    <div className="header-cell">Visitor ID</div>
                    <div className="header-cell">Timestamp</div>
                    <div className="header-cell">Consent Status</div>
                    <div className="header-cell">Actions</div>
                  </div>
                  <div className="table-body">
                    {visitorData.map((visitor) => {
                      const preferences = visitor.preferences || {};
                      const metadata = visitor.metadata || {};
                      
                      // Format the date for better display
                      let formattedDate = visitor.lastConsentDate;
                      try {
                        const date = new Date(visitor.lastConsentDate || visitor.lastUpdated || '');
                        if (!isNaN(date.getTime())) {
                          formattedDate = date.toLocaleString();
                        }
                      } catch (error) {
                        // Keep original date if parsing fails
                      }
                      
                      return (
                        <div key={visitor.visitorId} className="table-row">
                          <div className="table-cell">{visitor.visitorId}</div>
                          <div className="table-cell">{formattedDate}</div>
                          <div className="table-cell">
                            <span className={`status-badge ${(visitor.status || '').toLowerCase()}`}>
                              {visitor.status || 'Unknown'}
                            </span>
                          </div>
                          
                          <div className="table-cell">
                            <a 
                              className="download-pdf-btn"
                              onClick={() => handleDownloadPDF(visitor.pdfUrl, visitor.visitorId)}
                            >                       
                              Download PDF
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State - shown when no data */}
          {!isLoading && visitorData.length === 0 && (
            <div className="visitor-data-section">
              <div className="no-data">
                <div className="empty-state">
                 <img src={emptyIcon} alt="Empty" className="empty-icon"/>
                  <div className="empty-message">
                    No visitor data available for the selected period.
                  </div>
                  <div className="empty-subtitle">
                    Try selecting a different month or year, or check back later for new consent data.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVExportAdvanced; 


