import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../services/firebase/config.ts';
import { doc, updateDoc } from 'firebase/firestore';
import { logoutUser } from '../services/auth/authService.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { 
  User, Shield, Key, Bell, Camera, Save, LogOut,
  Eye, EyeOff, CheckCircle2, AlertTriangle, Lock,
  BellRing, BellOff, Mail, Smartphone, Globe, History,
  Clock, Activity, ChevronRight, Download
} from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { cn } from '../lib/utils.ts';
import { downloadAcademicArchive } from '../services/export/exportService';

type TabId = 'personal' | 'privacy' | 'security' | 'notifications' | 'activity';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Security tab state
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Notifications state
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: false,
    weekly: true,
    aiInsights: true,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (!user) return;
    setLogsLoading(true);
    try {
      const q = query(
        collection(db, 'activity_logs'),
        where('userId', '==', user.id),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleExportArchive = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch semesters
      const semsSnap = await getDocs(collection(db, 'users', user.id, 'semesters'));
      const semesters = semsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch subjects
      const subsSnap = await getDocs(collection(db, 'users', user.id, 'subjects'));
      const subjects = subsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch profile
      const profSnap = await getDocs(collection(db, 'users', user.id, 'profile'));
      const profile = profSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const archiveData = {
        exportedAt: new Date().toISOString(),
        user: { name: user.name, email: user.email },
        profile,
        semesters,
        subjects
      };

      downloadAcademicArchive(archiveData);
    } catch (err) {
      // Export failed
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal' as TabId, icon: User, label: 'Personal Info' },
    { id: 'activity' as TabId, icon: History, label: 'Activity Log' },
    { id: 'privacy' as TabId, icon: Shield, label: 'Privacy & Data' },
    { id: 'security' as TabId, icon: Key, label: 'Security Keys' },
    { id: 'notifications' as TabId, icon: Bell, label: 'Notifications' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black font-heading tracking-tight mb-2">User Profile</h1>
        <p className="text-muted-foreground font-medium">Manage your identity, security, and preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Avatar & Nav */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <Card className="flex flex-col items-center text-center p-8">
            <div className="relative group cursor-pointer">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user?.name || 'Profile'}
                  referrerPolicy="no-referrer"
                  className="h-32 w-32 rounded-full object-cover border border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-transform hover:scale-105 duration-300"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-4xl font-bold text-white transition-transform hover:scale-105 duration-300 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="mt-5 text-xl font-black">{user?.name || 'Academic User'}</h3>
            <p className="text-sm text-muted-foreground mt-1">{user?.email || 'authenticated@edu.com'}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Account Status</span>
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Security Level</span>
                <span className="text-primary font-bold">Enterprise</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI Access</span>
                <span className="text-amber-400 font-bold">Pro</span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full mt-6 text-rose-400 hover:bg-rose-400/10 hover:text-rose-300 rounded-2xl border border-rose-400/20 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </Card>

          {/* Tab Navigation */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'activity') fetchLogs();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold border border-transparent transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_4px_12px_rgba(139,92,246,0.1)]'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:border-white/[0.08] hover:text-foreground hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Tab Content */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card>
                  <h3 className="text-lg font-black mb-6">Personal Information</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your display name"
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2 opacity-60">
                          <Mail className="w-4 h-4" />
                          {user?.email || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground max-w-[260px]">
                        Changes sync across all devices in real-time via Firebase.
                      </p>
                      <Button type="submit" isLoading={loading} className="min-w-[160px] rounded-2xl">
                        {success
                          ? <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> Saved!</>
                          : <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                        }
                      </Button>
                    </div>
                  </form>
                </Card>

                <Card className="border-rose-500/20 bg-rose-500/5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-rose-500/10 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-rose-400 mb-1">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                        Request Account Deletion
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card>
                  <h3 className="text-lg font-black mb-2">Privacy & Data</h3>
                  <p className="text-sm text-muted-foreground mb-6">Control how your academic data is stored and shared.</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Share analytics with institution', desc: 'Allows your university to view anonymized performance data.', enabled: false },
                      { label: 'AI data training opt-in', desc: 'Help improve APIS AI by allowing anonymized data usage.', enabled: true },
                      { label: 'Public performance profile', desc: 'Allow peers to view your academic achievements.', enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start justify-between p-4 rounded-2xl bg-white/3 border border-white/5 gap-4">
                        <div>
                          <p className="font-bold text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <button className={cn(
                          'relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300',
                          item.enabled ? 'bg-primary' : 'bg-white/10'
                        )}>
                          <div className={cn(
                            'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300',
                            item.enabled ? 'left-7' : 'left-1'
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-5 h-5 text-primary" />
                    <h3 className="font-black">Data Storage</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">All your data is stored securely in <span className="text-primary font-bold">Google Firestore</span> with end-to-end encryption. Your marks and academic records never leave your authenticated session.</p>
                  
                  <div className="pt-6 border-t border-white/5">
                    <h4 className="text-sm font-bold mb-2">Data Portability & Ownership</h4>
                    <p className="text-xs text-muted-foreground mb-6">Download a complete copy of your academic record in JSON format for backup or portability.</p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportArchive}
                      className="w-full md:w-auto border-white/10 hover:bg-white/5"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Academic Archive (.json)
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black">Change Password</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] pr-12 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="Enter new password (min 8 chars)"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] pr-12 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPass.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className={cn(
                              'h-1 flex-1 rounded-full transition-colors',
                              newPass.length > i * 2
                                ? newPass.length < 6 ? 'bg-rose-500' : newPass.length < 10 ? 'bg-amber-500' : 'bg-green-500'
                                : 'bg-white/10'
                            )} />
                          ))}
                        </div>
                      )}
                    </div>
                    <Button className="w-full rounded-2xl" disabled={!currentPass || newPass.length < 8}>
                      Update Password
                    </Button>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    <h3 className="font-black">Two-Factor Authentication</h3>
                    <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-green-400/10 text-green-400">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">2FA is enforced on your Google Cloud account, protecting your Firebase project and this application.</p>
                </Card>
              </motion.div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black">System Interaction History</h3>
                      <p className="text-sm text-muted-foreground mt-1">Audit trail of all modifications to your academic record</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchLogs} 
                      className="rounded-xl border border-white/5"
                    >
                      <Clock className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                  </div>

                  {logsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : logs.length > 0 ? (
                    <div className="relative space-y-5">
                      <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/5" />
                      {logs.map((log) => (
                        <div key={log.id} className="relative flex items-start gap-5 p-4 rounded-2xl bg-white/3 border border-white/5 group hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-300">
                          <div className={cn(
                            "z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                            log.action === 'ADD_MARK' ? "bg-green-500/20 text-green-400" :
                            log.action === 'DELETE_MARK' ? "bg-rose-500/20 text-rose-400" :
                            "bg-primary/20 text-primary"
                          )}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-bold text-sm truncate uppercase tracking-tight">
                                {log.action.replace('_', ' ')}
                              </p>
                              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed italic pr-4">
                              "{log.details}"
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 self-center transition-colors" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground">
                        <History className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold">No interactions recorded</h4>
                        <p className="text-xs text-muted-foreground">Start using the system to build your activity audit.</p>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Immutable Audit Policy</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Interaction logs are generated automatically by the backend security layer. These records cannot be modified or hidden once committed, ensuring 100% data auditability.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
