import { BookOpen, CheckSquare, ArrowLeft, ClipboardList, Upload } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';

/**
 * LMS hub — routes into real APIS modules.
 * No fabricated course counts or progress percentages.
 */
const LMS = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Assignments',
      description: 'Track deadlines, priorities, and submission status from your academic records.',
      path: '/assignments',
      icon: CheckSquare,
    },
    {
      title: 'Upload Center',
      description: 'Import marks, attendance, and assignment data so APIS can work from your real records.',
      path: '/upload',
      icon: Upload,
    },
    {
      title: 'Dashboard',
      description: 'See your academic snapshot once data has been uploaded.',
      path: '/dashboard',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="space-y-10">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <PageHeader
        eyebrow="Workspace"
        title="Learning Management"
        description="A hub for course-related work already available in APIS. Full LMS features such as lecture libraries and class discussions are not connected yet."
      />

      <EmptyState
        icon={BookOpen}
        title="LMS modules are not live yet"
        description="Course workspaces, schedules, and discussion threads are planned. Until then, use the tools below — they already read from your uploaded academic data."
        hint="Nothing here invents course counts or completion rates."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/assignments')} className="gap-2">
              <CheckSquare className="w-4 h-4" /> Open Assignments
            </Button>
            <Button variant="outline" onClick={() => navigate('/upload')} className="gap-2">
              <Upload className="w-4 h-4" /> Upload records
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.path} to={module.path} className="group block">
              <Card className="h-full p-6 rounded-3xl transition-colors group-hover:border-primary/30">
                <CardHeader className="mb-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-2">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <span className="text-xs font-semibold text-primary">Open →</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default LMS;
