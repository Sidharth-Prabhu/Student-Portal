import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const examSchedule = [
  { date: '21-May-26', session: 'F.N.', courseCode: 'AD23411', courseName: 'Data Analytics' },
  { date: '23-May-26', session: 'F.N.', courseCode: 'CS23415', courseName: 'Operating Systems' },
  { date: '25-May-26', session: 'A.N.', courseCode: 'GE23411', courseName: 'Environmental Science and Sustainability' },
  { date: '29-May-26', session: 'F.N.', courseCode: 'AL23411', courseName: 'Machine Learning' },
  { date: '30-May-26', session: 'F.N.', courseCode: 'CS23431', courseName: 'Design and Analysis of Algorithms' },
  { date: '02-Jun-26', session: 'F.N.', courseCode: 'MA23411', courseName: 'Probability and Statistics' },
];

const ExamTimetable: React.FC = () => {
  const navigate = useNavigate();

  // Helper to parse dates like "21-May-26"
  const parseDateStr = (dateStr: string) => {
    // 21-May-26 -> 2026-05-21
    const parts = dateStr.split('-');
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return new Date(`20${parts[2]}-${months[parts[1]]}-${parts[0]}T00:00:00`);
  };

  const getDaysRemaining = (examDateStr: string) => {
    // Treat "today" as fixed for this example if needed, or dynamic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = parseDateStr(examDateStr);

    // time difference
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-bg-card border border-border-color rounded-xl hover:bg-bg-secondary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="text-accent-blue" />
          End Semester Exams
        </h1>
      </div>

      <section className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-xl relative overflow-hidden text-center mb-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-blue/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <p className="text-xs uppercase font-bold tracking-widest text-text-secondary mb-1">Semester 4 • AI & DS</p>
        <h2 className="text-2xl font-black text-white">April - May 2026</h2>
      </section>

      <div className="space-y-4">
        {examSchedule.map((exam, index) => {
          const daysRemaining = getDaysRemaining(exam.date);
          const isPast = daysRemaining < 0;
          const isNext = daysRemaining >= 0 && daysRemaining <= 7; // Next 7 days

          return (
            <motion.div
              key={exam.courseCode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all",
                isPast
                  ? "bg-bg-secondary/30 border-border-color/50 opacity-60 grayscale-[50%]"
                  : isNext
                    ? "bg-bg-card border-accent-blue/30 shadow-accent-blue/5"
                    : "bg-bg-card border-border-color"
              )}
            >
              {isNext && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-2xl rounded-full"></div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold shadow-inner",
                    isPast ? "bg-bg-secondary text-text-secondary" : "bg-accent-blue/10 text-accent-blue"
                  )}>
                    <span className="text-[10px] uppercase">{exam.date.split('-')[1]}</span>
                    <span className="text-lg leading-tight">{exam.date.split('-')[0]}</span>
                  </div>
                  <div>
                    <h3 className={clsx("font-bold text-sm", isPast ? "text-text-secondary" : "text-white")}>
                      {exam.courseName}
                    </h3>
                    <p className="text-[10px] font-mono text-text-secondary mt-0.5">{exam.courseCode}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={clsx(
                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                    exam.session === 'F.N.'
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  )}>
                    <Clock size={10} />
                    {exam.session}
                  </div>
                  {!isPast && (
                    <span className="text-[9px] text-text-secondary font-bold">
                      {daysRemaining === 0 ? 'TODAY' : `in ${daysRemaining} days`}
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[9px] text-green-500/70 font-bold flex items-center gap-1">
                      <CheckCircle2 size={10} /> DONE
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamTimetable;
