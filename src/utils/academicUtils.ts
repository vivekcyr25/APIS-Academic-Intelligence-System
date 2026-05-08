export const calculateGPA = (marks: any[]) => {
  if (marks.length === 0) return 0;
  const gradePoints: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B': 7, 'C': 6, 'E': 4, 'F': 0 };
  const totalPoints = marks.reduce((acc, m) => acc + (gradePoints[m.grade] || 0), 0);
  return Number((totalPoints / marks.length).toFixed(2));
};

export const getGradeFromTotal = (total: number) => {
  if (total >= 90) return 'O';
  if (total >= 80) return 'A+';
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'E';
  return 'F';
};
export const formatRelativeTime = (timestamp: any) => {
  if (!timestamp) return 'Never';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};
