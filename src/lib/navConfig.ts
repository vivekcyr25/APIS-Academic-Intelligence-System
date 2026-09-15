import {
  LayoutDashboard,
  Upload,
  BarChart3,
  User,
  Table,
  ClipboardList,
  MessageSquare,
  BrainCircuit,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  /** Shorter label for mobile bottom nav */
  shortLabel?: string;
}

/** Primary destinations shown in desktop nav and mobile bottom bar */
export const primaryNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Dash', path: '/dashboard' },
  { icon: Upload, label: 'Upload', shortLabel: 'Upload', path: '/upload' },
  { icon: BarChart3, label: 'Intelligence', shortLabel: 'Intel', path: '/academic-intelligence' },
  { icon: User, label: 'Profile', shortLabel: 'Profile', path: '/profile' },
];

/** Secondary destinations in desktop More menu and mobile drawer */
export const secondaryNav: NavItem[] = [
  { icon: Table, label: 'Semester Vault', path: '/semester-vault' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
  { icon: MessageSquare, label: 'LMS', path: '/lms' },
  { icon: BrainCircuit, label: 'Roadmap', path: '/recommendations' },
];

/** Mobile bottom bar order (Upload centered between Intel and Profile) */
export const mobilePrimaryNav: NavItem[] = [
  primaryNav[0], // Dashboard
  primaryNav[2], // Intelligence
  primaryNav[1], // Upload
  primaryNav[3], // Profile
];
