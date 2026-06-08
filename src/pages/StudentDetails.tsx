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

  if (!student) return <div className="p-8 text-center">Student not found</div>;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-bg-card border border-border-color rounded-xl">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Student Profile</h1>
      </div>

      {/* Profile Card */}
      <section className="bg-bg-card border border-border-color rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-3xl font-black shadow-2xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-black">{student.name}</h2>
            <p className="text-text-secondary font-mono text-sm mt-1">{student.regNum}</p>
          </div>

          <div className="flex gap-3 w-full mt-4">
            <a 
              href={`tel:${student.phone}`}
              className="flex-grow flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border-color rounded-2xl font-bold text-xs active:scale-95 transition-transform"
            >
              <Phone size={16} className="text-accent-blue" />
              Call
            </a>
            <a 
              href={`https://wa.me/${student.phone}`}
              target="_blank"
              rel="noreferrer"
              className="flex-grow flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border-color rounded-2xl font-bold text-xs active:scale-95 transition-transform"
            >
              <MessageCircle size={16} className="text-emerald-400" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-bg-card border border-border-color p-4 rounded-3xl text-center shadow-lg">
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Absents</p>
          <p className="text-xl font-black text-red-400">{history.absents.length}</p>
        </div>
        <div className="bg-bg-card border border-border-color p-4 rounded-3xl text-center shadow-lg">
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">I-OD</p>
          <p className="text-xl font-black text-blue-400">{history.iods.length}</p>
        </div>
        <div className="bg-bg-card border border-border-color p-4 rounded-3xl text-center shadow-lg">
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">E-OD</p>
          <p className="text-xl font-black text-purple-400">{history.eods.length}</p>
        </div>
      </section>

      {/* History Lists */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Calendar size={16} className="text-text-secondary" />
          <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Historical Logs</h3>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.absents.map(date => (
              <div key={date} className="flex items-center justify-between p-4 bg-bg-card border border-border-color rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400">
                    <AlertCircle size={16} />
                  </div>
                  <p className="text-sm font-bold">{date}</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-red-400/50">Absent</p>
              </div>
            ))}
            {history.iods.map(date => (
              <div key={date} className="flex items-center justify-between p-4 bg-bg-card border border-border-color rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
                    <Clock size={16} />
                  </div>
                  <p className="text-sm font-bold">{date}</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-blue-400/50">Internal OD</p>
              </div>
            ))}
            {history.eods.map(date => (
              <div key={date} className="flex items-center justify-between p-4 bg-bg-card border border-border-color rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center text-purple-400">
                    <Clock size={16} />
                  </div>
                  <p className="text-sm font-bold">{date}</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-purple-400/50">External OD</p>
              </div>
            ))}
            {history.absents.length === 0 && history.iods.length === 0 && history.eods.length === 0 && (
              <div className="p-12 text-center text-text-secondary bg-bg-card border border-border-color rounded-3xl border-dashed">
                <p className="text-sm font-bold">No records found for this student.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
