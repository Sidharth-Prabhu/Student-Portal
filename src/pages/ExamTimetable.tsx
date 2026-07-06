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

  const parseDateStr = (dateStr: string) => {
    const parts = dateStr.split('-');
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return new Date(`20${parts[2]}-${months[parts[1]]}-${parts[0]}T00:00:00`);
  };

  const getDaysRemaining = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = parseDateStr(examDateStr);

    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
          <CalendarIcon className="text-accent-blue" size={20} />
          End Semester Exams
        </h1>
      </div>

      <section className="neu-flat rounded-3xl p-6 relative overflow-hidden text-center mb-6 border border-border-color/10">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full"></div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary mb-1">Semester 4 • AI & DS</p>
        <h2 className="text-2xl font-black text-text-primary">April - May 2026</h2>
      </section>

      <div className="space-y-4">
        {examSchedule.map((exam, index) => {
          const daysRemaining = getDaysRemaining(exam.date);
          const isPast = daysRemaining < 0;
          const isNext = daysRemaining >= 0 && daysRemaining <= 7;

          return (
            <motion.div
              key={exam.courseCode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "p-5 rounded-3xl neu-flat relative overflow-hidden transition-all border",
                isPast
                  ? "opacity-60 border-border-color/10"
                  : isNext
                    ? "border-accent-blue/30 shadow-[inset_1px_1px_5px_rgba(59,130,246,0.05)]"
                    : "border-border-color/10"
              )}
            >
              {isNext && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-2xl rounded-full"></div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold neu-inset shrink-0",
                    isPast ? "text-text-secondary" : "text-accent-blue"
                  )}>
                    <span className="text-[9px] uppercase leading-none font-bold">{exam.date.split('-')[1]}</span>
                    <span className="text-lg leading-tight font-extrabold mt-0.5">{exam.date.split('-')[0]}</span>
                  </div>
                  <div>
                    <h3 className={clsx("font-bold text-sm leading-snug", isPast ? "text-text-secondary" : "text-text-primary")}>
                      {exam.courseName}
                    </h3>
                    <p className="text-[10px] font-mono text-text-secondary mt-0.5">{exam.courseCode}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className={clsx(
                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)] border",
                    exam.session === 'F.N.'
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                  )}>
                    <Clock size={10} />
                    {exam.session}
                  </div>
                  {!isPast && (
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">
                      {daysRemaining === 0 ? 'TODAY' : `in ${daysRemaining} days`}
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
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
