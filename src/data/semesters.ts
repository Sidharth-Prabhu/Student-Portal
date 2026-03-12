export interface Course {
  code: string;
  name: string;
  credits: number;
}

export const semData: Record<string, Course[]> = {
  "1": [
    { code: "IP231111", name: "Induction Programme", credits: 0 },
    { code: "HS231111", name: "Communicative English", credits: 3 },
    { code: "MA231111", name: "Matrices and Calculus", credits: 4 },
    { code: "PH231111", name: "Physics for Information Science", credits: 3 },
    { code: "GE231111", name: "Problem Solving and C Programming", credits: 3 },
    { code: "GE231113", name: "Basic Electrical and Electronics Engineering", credits: 3 },
    { code: "GE231112", name: "தமிழர் மரபு / Heritage of Tamils", credits: 0 },
    { code: "PH231121", name: "Physics Laboratory", credits: 1 },
    { code: "GE231121", name: "Problem Solving and C Programming Laboratory", credits: 1 },
    { code: "GE231122", name: "Engineering Practices Laboratory", credits: 1 }
  ],
  "2": [
    { code: "HS232211", name: "Professional English", credits: 2 },
    { code: "CY232211", name: "Engineering Chemistry", credits: 3 },
    { code: "MA232211", name: "Statistics and Numerical Methods", credits: 4 },
    { code: "AD232211", name: "Python for Data Science", credits: 3 },
    { code: "GE232213", name: "தமிழரும் தொழில்நுட்பமும் / Tamils and Technology", credits: 0 },
    { code: "GE232231", name: "Engineering Graphics", credits: 4 },
    { code: "AD232231", name: "Data Structures Design", credits: 4 },
    { code: "CY232221", name: "Chemistry Laboratory", credits: 1 },
    { code: "AD232221", name: "Python for Data Science Laboratory", credits: 1 },
    { code: "GE232221", name: "Communication Laboratory / Foreign Language", credits: 1 }
  ],
  "3": [
    { code: "MA233111", name: "Discrete Mathematics", credits: 4 },
    { code: "AL233111", name: "Artificial Intelligence", credits: 3 },
    { code: "CS233312", name: "Object Oriented Programming", credits: 3 },
    { code: "CS234111", name: "Database Management Systems", credits: 3 },
    { code: "EC233331", name: "Digital Principles and Computer Organization", credits: 4 },
    { code: "AL233321", name: "Artificial Intelligence Laboratory", credits: 1 },
    { code: "CS234221", name: "Database Management Systems Laboratory", credits: 1 },
    { code: "CS233322", name: "Object Oriented Programming Laboratory", credits: 1 },
    { code: "AD2331C1", name: "Data Wrangling", credits: 1 }
  ],
  "4": [
    { code: "GE234111", name: "Environmental Science and Sustainability", credits: 2 },
    { code: "MA234111", name: "Probability and Statistics", credits: 4 },
    { code: "AD234111", name: "Data Analytics", credits: 3 },
    { code: "AL234111", name: "Machine Learning", credits: 3 },
    { code: "CS234412", name: "Operating Systems", credits: 3 },
    { code: "CS234331", name: "Design and Analysis of Algorithms", credits: 4 },
    { code: "AD234221", name: "Data Analytics Laboratory", credits: 1 },
    { code: "AL234221", name: "Machine Learning Laboratory", credits: 1 },
    { code: "CS234422", name: "Operating Systems Laboratory", credits: 1 },
    { code: "AD231C1", name: "Introduction to AZURE Machine Learning", credits: 1 }
  ],
  "5": [
    { code: "AD235111", name: "Deep Learning", credits: 3 },
    { code: "CS235111", name: "Computer Networks", credits: 3 },
    { code: "Professional Elective I", name: "Professional Elective I", credits: 3 },
    { code: "Professional Elective II", name: "Professional Elective II", credits: 3 },
    { code: "Mandatory Course - I", name: "Mandatory Course - I (Non-credit)", credits: 0 },
    { code: "AD235331", name: "Big Data Analytics", credits: 4 },
    { code: "AD235332", name: "Data Exploration and Visualization", credits: 4 },
    { code: "AD235221", name: "Deep Learning Laboratory", credits: 1 },
    { code: "CS235221", name: "Computer Networks Lab", credits: 1 },
    { code: "Industry Oriented Course - III", name: "Industry Oriented Course - III", credits: 1 }
  ],
  "6": [
    { code: "Professional Elective III", name: "Professional Elective III", credits: 3 },
    { code: "Professional Elective IV", name: "Professional Elective IV", credits: 3 },
    { code: "Open Elective - I", name: "Open Elective - I", credits: 3 },
    { code: "Open Elective - II", name: "Open Elective - II", credits: 3 },
    { code: "Mandatory Course - II", name: "Mandatory Course - II (Non-credit)", credits: 0 },
    { code: "EC236331", name: "Embedded Systems and IoT", credits: 4 },
    { code: "CS236331", name: "Object Oriented Software Engineering", credits: 4 },
    { code: "AD236221", name: "Mini Project", credits: 2 }
  ],
  "7": [
    { code: "GE237111", name: "Human Values and Ethics", credits: 2 },
    { code: "Elective - Management", name: "Elective - Management", credits: 3 },
    { code: "CB235111", name: "Data and Information Security", credits: 3 },
    { code: "Professional Elective V", name: "Professional Elective V", credits: 3 },
    { code: "Professional Elective VI", name: "Professional Elective VI", credits: 3 },
    { code: "AD237221", name: "Internship / Certification Course", credits: 2 }
  ],
  "8": [
    { code: "Open Elective - III", name: "Open Elective - III", credits: 3 },
    { code: "AD238221", name: "Project Work", credits: 10 }
  ]
};

export const gradePoints: Record<string, number> = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "RA": 0,
  "": 0
};
