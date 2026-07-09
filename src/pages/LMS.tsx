import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, CheckSquare, Layers3, MessageSquareText, ArrowLeft, Bell, Gauge, FolderKanban } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatsCard } from '../components/ui/Card.tsx';

const LMS = () => {
  const navigate = useNavigate();

  const modules = [
    {
      icon: FolderKanban,
      title: 'Course Workspace',
      description: 'Keep lectures, files, and class resources organized in the same visual system used across APIS AI.',
    },
    {
      icon: CheckSquare,
      title: 'Assignments',
      description: 'Track submissions, deadlines, and completion status without leaving the project language or layout.',
    },
    {
      icon: CalendarDays,
      title: 'Schedule',
      description: 'Use a consistent calendar view for class sessions, reminders, and planned study blocks.',
    },
    {
      icon: MessageSquareText,
      title: 'Discussion',
      description: 'Keep announcements and class communication in a focused place that matches the app theme.',
    },
  ];

  const stats = [
    { label: 'Active Courses', value: '08', icon: Layers3, color: 'primary' as const },
    { label: 'Tasks Pending', value: '14', icon: Bell, color: 'warning' as const },
    { label: 'On Track', value: '92%', icon: Gauge, color: 'success' as const },
  ];

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-10"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-2 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <header className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Learning Management System</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              The LMS section follows the same design system as the rest of APIS AI, so the navigation, spacing, glass surfaces, and typography stay consistent.
            </p>
          </div>

          <Card className="p-6 md:p-8">
            <CardHeader className="mb-4">
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Core academic actions, surfaced in the same style language used elsewhere in the app.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/dashboard" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition-colors">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Dashboard</p>
                <p className="text-sm text-muted-foreground mt-1">Review academic overview</p>
              </Link>
              <Link to="/upload" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition-colors">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Upload</p>
                <p className="text-sm text-muted-foreground mt-1">Add files and resources</p>
              </Link>
              <Link to="/assignments" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition-colors">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Assignments</p>
                <p className="text-sm text-muted-foreground mt-1">Track due work</p>
              </Link>
              <Link to="/academic-intelligence" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition-colors">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Insights</p>
                <p className="text-sm text-muted-foreground mt-1">Review analysis output</p>
              </Link>
            </CardContent>
          </Card>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </section>

        <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-center gap-4 mb-6">
            <Layers3 className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">LMS Workspace</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            This page is intentionally built with the same project components and visual treatment already present in APIS AI, so it behaves like a native part of the product rather than a separate UI.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/assignments')} className="gap-2">
              <CheckSquare className="w-4 h-4" /> View Assignments
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2 border-white/10">
              <BookOpen className="w-4 h-4" /> Return to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LMS;
