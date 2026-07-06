import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MessageCircle, 
  Calendar, 
  ChevronLeft,
  AlertCircle,
  Clock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { students } from '../data/students';

const StudentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = students.find(s => s.regNum === id);
  const [history, setHistory] = useState<{ absents: string[], iods: string[], eods: string[] }>({
    absents: [],
    iods: [],
    eods: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) return;
      try {
        const snap = await getDocs(collection(db, 'attendance'));
        const absents: string[] = [];
        const iods: string[] = [];
        const eods: string[] = [];

        snap.docs.forEach(doc => {
          const data = doc.data();
          if (data.absents?.includes(id)) absents.push(doc.id);
          if (data.internal_od?.includes(id)) iods.push(doc.id);
          if (data.external_od?.includes(id)) eods.push(doc.id);
        });

        setHistory({ absents, iods, eods });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (!student) return <div className="p-8 text-center neu-flat rounded-3xl">Student not found</div>;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Student Profile</h1>
      </div>

      {/* Profile Card */}
      <section className="neu-flat rounded-3xl p-8 relative overflow-hidden border border-border-color/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-full neu-inset flex items-center justify-center text-accent-blue text-3xl font-black border border-border-color/15">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary">{student.name}</h2>
            <p className="text-text-secondary font-mono text-xs mt-1.5">{student.regNum}</p>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <a 
              href={`tel:${student.phone}`}
              className="flex-grow flex items-center justify-center gap-2 py-4 neu-btn rounded-2xl font-bold text-xs text-accent-blue"
            >
              <Phone size={15} />
              Call
            </a>
            <a 
              href={`https://wa.me/${student.phone}`}
              target="_blank"
              rel="noreferrer"
              className="flex-grow flex items-center justify-center gap-2 py-4 neu-btn rounded-2xl font-bold text-xs text-emerald-500"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        <div className="neu-inset p-4 rounded-2xl text-center">
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Absents</p>
          <p className="text-xl font-black text-red-500 dark:text-red-400 mt-1">{history.absents.length}</p>
        </div>
        <div className="neu-inset p-4 rounded-2xl text-center">
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">I-OD</p>
          <p className="text-xl font-black text-blue-500 dark:text-blue-400 mt-1">{history.iods.length}</p>
        </div>
        <div className="neu-inset p-4 rounded-2xl text-center">
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">E-OD</p>
          <p className="text-xl font-black text-purple-500 dark:text-purple-400 mt-1">{history.eods.length}</p>
        </div>
      </section>

      {/* History Lists */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Calendar size={16} className="text-text-secondary" />
          <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Historical Logs</h3>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center neu-flat rounded-3xl border border-border-color/10">
            <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.absents.map(date => (
              <div key={date} className="flex items-center justify-between p-4 neu-flat rounded-2xl border border-border-color/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-red-500 dark:text-red-400 shrink-0">
                    <AlertCircle size={15} />
                  </div>
                  <p className="text-sm font-bold text-text-primary">{date}</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-red-500 dark:text-red-400/70">Absent</p>
              </div>
            ))}
            {history.iods.map(date => (
              <div key={date} className="flex items-center justify-between p-4 neu-flat rounded-2xl border border-border-color/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
                    <Clock size={15} />
                  </div>
                  <p className="text-sm font-bold text-text-primary">{date}</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400/70">Internal OD</p>
              </div>
            ))}
            {history.eods.map(date => (
              <div key={date} className="flex items-center justify-between p-4 neu-flat rounded-2xl border border-border-color/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                    <Clock size={15} />
                  </div>
                  <p className="text-sm font-bold text-text-primary">{date}</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-purple-500 dark:text-purple-400/70">External OD</p>
              </div>
            ))}
            {history.absents.length === 0 && history.iods.length === 0 && history.eods.length === 0 && (
              <div className="p-12 text-center text-text-secondary neu-flat rounded-3xl border border-dashed border-border-color/40 flex flex-col items-center justify-center">
                <p className="text-xs text-text-secondary">No records found for this student.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
