import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const examSchedule = [
  { date: "2025-03-12", subject: "Tamils and Technology", displayDate: "12 March 2025" },
  { date: "2025-03-13", subject: "Engineering Chemistry", displayDate: "13 March 2025" },
  { date: "2025-03-14", subject: "Professional English", displayDate: "14 March 2025" },
  { date: "2025-03-17", subject: "Python for Data Science", displayDate: "17 March 2025" },
  { date: "2025-03-18", subject: "Statistics and Numerical Methods", displayDate: "18 March 2025" },
  { date: "2025-03-19", subject: "Engineering Graphics", displayDate: "19 March 2025" },
  { date: "2025-03-20", subject: "Data Structures Design", displayDate: "20 March 2025" }
];

const ExamTimetable: React.FC = () => {
  const [currentDate] = useState(new Date('2025-03-10')); // Using the same mock date from original

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-bg-card border border-border-color rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent-purple/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-accent-purple/10 rounded-2xl flex items-center justify-center text-accent-purple mx-auto mb-6">
            <Calendar size={40} />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Exam Timetable</h1>
          <p className="text-text-secondary mt-2">AI & DS - Section E • Upcoming Assessments</p>
        </div>
      </section>

      <div className="bg-bg-card border border-border-color rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg-secondary/50 text-left">
                <th className="py-5 px-8 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-color">Status</th>
                <th className="py-5 px-8 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-color">Date</th>
                <th className="py-5 px-8 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-color">Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {examSchedule.map((exam, idx) => {
                const isCompleted = new Date(exam.date) < currentDate;
                const isToday = new Date(exam.date).toDateString() === currentDate.toDateString();
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={exam.date} 
                    className={clsx(
                      "group transition-colors",
                      isCompleted ? "opacity-40 grayscale" : "hover:bg-accent-purple/5",
                      isToday && "bg-accent-purple/10"
                    )}
                  >
                    <td className="py-6 px-8">
                      {isCompleted ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : isToday ? (
                        <div className="flex items-center gap-2 text-accent-purple">
                          <Clock size={20} className="animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-tighter">Today</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border-color"></div>
                      )}
                    </td>
                    <td className="py-6 px-8">
                      <span className={clsx("font-semibold block", isCompleted && "line-through")}>
                        {exam.displayDate}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <span className={clsx("font-bold text-lg", isCompleted && "line-through", !isCompleted && "text-text-primary")}>
                        {exam.subject}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-bg-secondary/50 border border-border-color rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="text-accent-purple shrink-0 mt-1" size={20} />
        <p className="text-xs text-text-secondary leading-relaxed">
          Please arrive at the examination hall at least 30 minutes before the scheduled time. 
          Bring your hall ticket and required stationery. Good luck with your exams!
        </p>
      </div>
    </div>
  );
};

export default ExamTimetable;
