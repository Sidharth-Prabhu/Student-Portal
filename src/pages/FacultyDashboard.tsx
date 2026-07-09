import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Download,
  Calendar,
  AlertCircle,
  Search,
  LogOut
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { students } from '../data/students';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface AttendanceRecord {
  id: string;
  absents?: string[];
  internal_od?: string[];
  external_od?: string[];
  [key: string]: any;
}

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInitialDates = useCallback(async () => {
    try {
      const q = query(collection(db, 'attendance'));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const sortedIds = snap.docs.map(d => d.id).sort();
        setFromDate(sortedIds[0]);
        
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord))
          .sort((a, b) => b.id.localeCompare(a.id));
        
        setRecords(data);
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        setFromDate(d.toISOString().split('T')[0]);
      }
    } catch (e) {
      console.error("Initial fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialDates();
  }, [fetchInitialDates]);

  const filteredRecords = React.useMemo(() => {
    return records.filter(doc => doc.id >= fromDate && doc.id <= toDate);
  }, [records, fromDate, toDate]);

  const getSummary = () => {
    return students.map(s => {
      let absentCount = 0;
      let iodCount = 0;
      let eodCount = 0;
      
      filteredRecords.forEach(r => {
        if (r.absents?.includes(s.regNum)) absentCount++;
        if (r.internal_od?.includes(s.regNum)) iodCount++;
        if (r.external_od?.includes(s.regNum)) eodCount++;
      });

      const totalDays = filteredRecords.length;
      const presentCount = totalDays - absentCount;
      const percentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 100;

      return {
        ...s,
        absentCount,
        iodCount,
        eodCount,
        presentCount,
        totalDays,
        percentage
      };
    }).filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.regNum.includes(searchQuery)
    );
  };

  const handleExport = async () => {
    const summary = getSummary();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Reg Number', key: 'regNum', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Total Days', key: 'totalDays', width: 15 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Absent', key: 'absent', width: 10 },
      { header: 'I-OD', key: 'iod', width: 10 },
      { header: 'E-OD', key: 'eod', width: 10 },
      { header: 'Percentage', key: 'percentage', width: 15 }
    ];

    // Style headers
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    summary.forEach(s => {
      const row = sheet.addRow({
        regNum: s.regNum,
        name: s.name,
        totalDays: s.totalDays,
        present: s.presentCount,
        absent: s.absentCount,
        iod: s.iodCount,
        eod: s.eodCount,
        percentage: `${s.percentage.toFixed(2)}%`
      });

      if (s.percentage < 75) {
        row.getCell('percentage').font = { color: { argb: 'FFFF0000' }, bold: true };
        row.getCell('percentage').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE5E5' }
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Faculty_Attendance_${fromDate}_to_${toDate}.xlsx`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const summaryData = getSummary();

  return (
    <div className="space-y-6 max-w-lg md:max-w-5xl mx-auto pb-8">
      <div className="flex items-center justify-between px-2 pt-2">
        <h1 className="text-2xl font-black text-text-primary">Faculty Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column - Filters */}
        <div className="md:col-span-4 space-y-6">
          <section className="neu-flat rounded-3xl p-6 border border-border-color/10 space-y-4">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Calendar size={16} className="text-accent-blue" />
              Date Range
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">From</label>
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full neu-input rounded-xl p-3 text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">To</label>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full neu-input rounded-xl p-3 text-xs font-bold"
                />
              </div>
            </div>
          </section>

          <section className="neu-flat rounded-3xl p-6 border border-border-color/10 space-y-4">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Search size={16} className="text-accent-purple" />
              Search
            </h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or reg no..."
                className="w-full neu-input rounded-xl p-3 pl-10 text-sm placeholder:text-text-secondary/30"
              />
            </div>
          </section>

          <button
            onClick={handleExport}
            className="w-full neu-btn text-emerald-500 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export to Excel
          </button>
        </div>

        {/* Right Column - Data */}
        <div className="md:col-span-8 space-y-6">
          <section className="neu-flat rounded-3xl p-6 border border-border-color/10">
            <h2 className="text-sm font-bold text-text-primary mb-4">Student Analytics</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
              </div>
            ) : summaryData.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-text-secondary mb-3" size={32} />
                <p className="text-text-secondary text-sm font-medium">No records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summaryData.map(s => {
                  const isCritical = s.percentage < 75;
                  return (
                    <motion.div
                      key={s.regNum}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx(
                        "p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all",
                        isCritical 
                          ? "bg-red-500/10 border-red-500/30 shadow-[inset_0_2px_10px_rgba(239,68,68,0.1)]" 
                          : "neu-flat border-border-color/10"
                      )}
                    >
                      <div>
                        <h3 className={clsx("font-bold text-sm", isCritical ? "text-red-400" : "text-text-primary")}>
                          {s.name}
                        </h3>
                        <p className="text-xs font-mono text-text-secondary mt-0.5">{s.regNum}</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          <div>
                            <span className="text-text-secondary mr-2">P:</span>
                            <span className="font-bold text-emerald-500">{s.presentCount}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary mr-2">A:</span>
                            <span className="font-bold text-red-500">{s.absentCount}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary mr-2">I-OD:</span>
                            <span className="font-bold text-accent-blue">{s.iodCount}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary mr-2">E-OD:</span>
                            <span className="font-bold text-accent-purple">{s.eodCount}</span>
                          </div>
                        </div>
                        
                        <div className={clsx(
                          "px-3 py-1.5 rounded-xl font-bold text-sm min-w-[70px] text-center",
                          isCritical ? "bg-red-500/20 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {s.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
