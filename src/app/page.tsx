'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useRouterStore } from '@/lib/store'
import { authApi, jobsApi, proposalsApi, notificationsApi, dashboardApi, usersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Briefcase, Users, FileText, Bell, Search, Plus, ArrowRight,
  CheckCircle, Clock, DollarSign, MapPin, Star, TrendingUp,
  LayoutDashboard, User, LogOut, ChevronRight, Eye, ThumbsUp,
  XCircle, AlertCircle, Loader2, Building2, Handshake, Target,
  Zap, Globe, Shield, Menu, X, Send, Calendar, Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ============================================
// SHARED COMPONENTS
// ============================================

function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { navigate, currentPage } = useRouterStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchNotifs = async () => {
        try {
          const token = useAuthStore.getState().token!
          const res = await notificationsApi.list(token, true)
          setNotifCount(res.unreadCount)
        } catch {}
      }
      fetchNotifs()
      const interval = setInterval(fetchNotifs, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    navigate('home')
    toast.success('Logged out successfully')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('home')} className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TenderHub</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate('browse-jobs')}>Browse Jobs</Button>
                <Button variant="ghost" onClick={() => navigate('login')}>Sign In</Button>
                <Button onClick={() => navigate('register')} className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
              </>
            ) : user?.role === 'WORKER' ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('browse-jobs')}>
                  <Search className="w-4 h-4 mr-1" /> Find Jobs
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('worker-dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('worker-proposals')}>
                  <FileText className="w-4 h-4 mr-1" /> My Proposals
                </Button>
                <Button variant="ghost" size="sm" className="relative" onClick={() => navigate('worker-notifications')}>
                  <Bell className="w-4 h-4" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifCount}</span>
                  )}
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => navigate('worker-profile')}>
                  <Avatar className="w-6 h-6 mr-1"><AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">{user?.name?.charAt(0)}</AvatarFallback></Avatar>
                  {user?.name}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('provider-dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('provider-create-job')} className="text-emerald-600">
                  <Plus className="w-4 h-4 mr-1" /> Post Job
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('provider-jobs')}>
                  <Briefcase className="w-4 h-4 mr-1" /> My Jobs
                </Button>
                <Button variant="ghost" size="sm" className="relative" onClick={() => navigate('provider-notifications')}>
                  <Bell className="w-4 h-4" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifCount}</span>
                  )}
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 border-t"
            >
              <div className="flex flex-col gap-2 pt-3">
                {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('browse-jobs'); setMobileMenuOpen(false) }}>Browse Jobs</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('login'); setMobileMenuOpen(false) }}>Sign In</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 justify-start" onClick={() => { navigate('register'); setMobileMenuOpen(false) }}>Get Started</Button>
                  </>
                ) : user?.role === 'WORKER' ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('browse-jobs'); setMobileMenuOpen(false) }}><Search className="w-4 h-4 mr-2" /> Find Jobs</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('worker-dashboard'); setMobileMenuOpen(false) }}><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('worker-proposals'); setMobileMenuOpen(false) }}><FileText className="w-4 h-4 mr-2" /> My Proposals</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('worker-profile'); setMobileMenuOpen(false) }}><User className="w-4 h-4 mr-2" /> Profile</Button>
                    <Button variant="ghost" className="justify-start" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('provider-dashboard'); setMobileMenuOpen(false) }}><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</Button>
                    <Button variant="ghost" className="justify-start text-emerald-600" onClick={() => { navigate('provider-create-job'); setMobileMenuOpen(false) }}><Plus className="w-4 h-4 mr-2" /> Post Job</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate('provider-jobs'); setMobileMenuOpen(false) }}><Briefcase className="w-4 h-4 mr-2" /> My Jobs</Button>
                    <Button variant="ghost" className="justify-start" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

function Footer() {
  const { navigate } = useRouterStore()
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TenderHub</span>
            </div>
            <p className="text-sm">The freelance marketplace where quality proposals win, not bidding wars.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">For Workers</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('browse-jobs')} className="hover:text-emerald-400 transition">Browse Jobs</button></li>
              <li><button onClick={() => navigate('register')} className="hover:text-emerald-400 transition">Create Account</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">For Job Providers</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('provider-create-job')} className="hover:text-emerald-400 transition">Post a Job</button></li>
              <li><button onClick={() => navigate('register')} className="hover:text-emerald-400 transition">Get Started</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-emerald-400 transition cursor-pointer">How It Works</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">Safety & Trust</span></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2025 TenderHub. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-emerald-400 transition cursor-pointer">Privacy</span>
            <span className="hover:text-emerald-400 transition cursor-pointer">Terms</span>
            <span className="hover:text-emerald-400 transition cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any }> = {
    OPEN: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    PROPOSALS_RECEIVED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
    WORKER_SELECTED: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: User },
    IN_PROGRESS: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
    COMPLETED: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
    CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    SUBMITTED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send },
    SHORTLISTED: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Star },
    ACCEPTED: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    WITHDRAWN: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle },
  }
  const c = config[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle }
  const Icon = c.icon
  return (
    <Badge variant="outline" className={`${c.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

function JobCard({ job, onClick }: { job: any; onClick: () => void }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border hover:border-emerald-200" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg group-hover:text-emerald-600 transition line-clamp-1">{job.title}</CardTitle>
          <StatusBadge status={job.status} />
        </div>
        {job.category && <Badge variant="secondary" className="w-fit text-xs">{job.category}</Badge>}
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" />${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(job.deadline).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{job._count?.proposals || 0} proposals</span>
        </div>
        {job.skills && (
          <div className="flex flex-wrap gap-1 mt-3">
            {job.skills.split(',').map((s: string) => (
              <Badge key={s} variant="secondary" className="text-xs">{s.trim()}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="w-6 h-6"><AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">{job.createdBy?.name?.charAt(0)}</AvatarFallback></Avatar>
          <span>{job.createdBy?.name}</span>
          {job.createdBy?.location && <><MapPin className="w-3 h-3" />{job.createdBy.location}</>}
        </div>
      </CardFooter>
    </Card>
  )
}

function StatCard({ label, value, icon: Icon, color = 'emerald' }: { label: string; value: number | string; icon: any; color?: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PAGE COMPONENTS
// ============================================

function HomePage() {
  const { navigate } = useRouterStore()
  const { isAuthenticated, user } = useAuthStore()
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsApi.list({ limit: '6' }).then(res => {
      setFeaturedJobs(res.jobs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">🎯 Proposal-Based Marketplace</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Quality Proposals Win.<br />Not Bidding Wars.
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              TenderHub connects skilled workers with job providers through a fair, proposal-based system. Focus on solution quality, not the lowest bid.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-lg px-8 h-12" onClick={() => navigate('register')}>
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold text-lg px-8 h-12" onClick={() => navigate('browse-jobs')}>
                    Browse Jobs
                  </Button>
                </>
              ) : user?.role === 'WORKER' ? (
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-lg px-8 h-12" onClick={() => navigate('browse-jobs')}>
                  Find Your Next Job <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-lg px-8 h-12" onClick={() => navigate('provider-create-job')}>
                  Post a Job <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How TenderHub Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A simple, fair process that values quality over competition</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, title: '1. Post a Job', desc: 'Job providers create detailed job postings with budget ranges and deadlines.', color: 'emerald' },
              { icon: FileText, title: '2. Submit Proposals', desc: 'Workers submit thoughtful proposals with their approach, budget, and timeline.', color: 'blue' },
              { icon: Handshake, title: '3. Select & Work', desc: 'Job providers review proposals and select the best worker. Simple and fair.', color: 'amber' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${step.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : step.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Jobs', value: '500+', icon: Briefcase },
              { label: 'Skilled Workers', value: '2,000+', icon: Users },
              { label: 'Proposals Sent', value: '10,000+', icon: FileText },
              { label: 'Jobs Completed', value: '3,500+', icon: CheckCircle },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Latest Jobs</h2>
              <p className="text-muted-foreground mt-1">Find your next opportunity</p>
            </div>
            <Button variant="outline" onClick={() => navigate('browse-jobs')} className="gap-1">View All <ChevronRight className="w-4 h-4" /></Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job: any) => (
                <JobCard key={job.id} job={job} onClick={() => navigate('job-detail', { id: job.id })} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8">Join thousands of workers and job providers on TenderHub</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-lg px-8 h-12" onClick={() => navigate('register')}>
                  Join as Worker
                </Button>
                <Button size="lg" variant="outline" className="font-semibold text-lg px-8 h-12" onClick={() => navigate('register')}>
                  Join as Job Provider
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}

// ============================================
// BROWSE JOBS PAGE
// ============================================

function BrowseJobsPage() {
  const { navigate } = useRouterStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    const params: Record<string, string> = { page: page.toString(), limit: '9' }
    if (search) params.search = search
    if (category) params.category = category
    if (status) params.status = status
    jobsApi.list(params).then(res => {
      if (!cancelled) {
        setJobs(res.jobs)
        setTotalPages(res.totalPages)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        toast.error('Failed to load jobs')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [page, search, category, status])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
        <p className="text-muted-foreground">Find opportunities that match your skills</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Web Development">Web Development</SelectItem>
            <SelectItem value="Mobile Development">Mobile Development</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Backend Development">Backend Development</SelectItem>
            <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="PROPOSALS_RECEIVED">Proposals Received</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any) => (
              <JobCard key={job.id} job={job} onClick={() => navigate('job-detail', { id: job.id })} />
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================
// JOB DETAIL PAGE
// ============================================

function JobDetailPage() {
  const { params, navigate } = useRouterStore()
  const { user, isAuthenticated, token } = useAuthStore()
  const [job, setJob] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [proposalForm, setProposalForm] = useState({ proposalText: '', expectedBudget: '', estimatedDuration: '' })

  useEffect(() => {
    if (!params.id) return
    const fetchJob = async () => {
      try {
        const res = await jobsApi.get(params.id, token || undefined)
        setJob(res.job)
        setProposals(res.proposals || [])
      } catch (error) {
        toast.error('Failed to load job')
      }
      setLoading(false)
    }
    fetchJob()
  }, [params.id, token])

  const handleSubmitProposal = async () => {
    if (!token) { navigate('login'); return }
    setSubmitting(true)
    try {
      await proposalsApi.create({
        jobId: params.id,
        ...proposalForm,
        expectedBudget: parseFloat(proposalForm.expectedBudget),
      }, token)
      toast.success('Proposal submitted successfully!')
      setShowProposalForm(false)
      setProposalForm({ proposalText: '', expectedBudget: '', estimatedDuration: '' })
      // Refresh job
      const res = await jobsApi.get(params.id, token)
      setJob(res.job)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit proposal')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><Skeleton className="h-96" /></div>
  if (!job) return <div className="max-w-4xl mx-auto px-4 py-8 text-center"><p>Job not found</p></div>

  const isOwner = user?.id === job.createdById
  const hasProposed = proposals.some((p: any) => p.workerId === user?.id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => navigate('browse-jobs')} className="mb-4">
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <StatusBadge status={job.status} />
                  {job.category && <Badge variant="secondary">{job.category}</Badge>}
                </div>
              </div>
              {isAuthenticated && user?.role === 'WORKER' && (job.status === 'OPEN' || job.status === 'PROPOSALS_RECEIVED') && !hasProposed && (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowProposalForm(true)}>
                  <Send className="w-4 h-4 mr-2" /> Submit Proposal
                </Button>
              )}
              {hasProposed && (
                <Badge className="bg-blue-100 text-blue-700">Proposal Submitted</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-sm text-emerald-600">Budget Min</p>
                <p className="text-xl font-bold">${job.budgetMin?.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-sm text-emerald-600">Budget Max</p>
                <p className="text-xl font-bold">${job.budgetMax?.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">Deadline</p>
                <p className="text-lg font-bold">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600">Proposals</p>
                <p className="text-xl font-bold">{job._count?.proposals || 0}</p>
              </div>
            </div>

            {job.skills && (
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-sm">{s.trim()}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12"><AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">{job.createdBy?.name?.charAt(0)}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{job.createdBy?.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{job.createdBy?.location || 'Remote'}</p>
              </div>
            </div>

            {job.selectedWorker && (
              <>
                <Separator />
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-emerald-600 font-medium mb-2">Selected Worker</p>
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-emerald-200 text-emerald-800">{job.selectedWorker.name?.charAt(0)}</AvatarFallback></Avatar>
                    <span className="font-semibold">{job.selectedWorker.name}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Proposals for Job Provider */}
        {isOwner && proposals.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Proposals ({proposals.length})</h2>
            <div className="space-y-4">
              {proposals.map((p: any) => (
                <ProposalCard key={p.id} proposal={p} isOwner={isOwner} jobId={job.id} onRefresh={() => {
                  jobsApi.get(params.id, token!).then(res => { setJob(res.job); setProposals(res.proposals || []) })
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Proposal Form Dialog */}
        <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit Proposal for "{job.title}"</DialogTitle>
              <DialogDescription>Describe your approach, budget, and timeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Your Proposal</Label>
                <Textarea
                  placeholder="Describe your approach, relevant experience, and why you're the best fit..."
                  value={proposalForm.proposalText}
                  onChange={(e) => setProposalForm(p => ({ ...p, proposalText: e.target.value }))}
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expected Budget ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={proposalForm.expectedBudget}
                    onChange={(e) => setProposalForm(p => ({ ...p, expectedBudget: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Estimated Duration</Label>
                  <Input
                    placeholder="e.g., 4 weeks"
                    value={proposalForm.estimatedDuration}
                    onChange={(e) => setProposalForm(p => ({ ...p, estimatedDuration: e.target.value }))}
                  />
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitProposal} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Proposal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}

function ProposalCard({ proposal, isOwner, jobId, onRefresh }: { proposal: any; isOwner: boolean; jobId: string; onRefresh: () => void }) {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (status: string) => {
    if (!token) return
    setLoading(true)
    try {
      await proposalsApi.updateStatus(proposal.id, status, token)
      toast.success(`Proposal ${status.toLowerCase()}`)
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update proposal')
    }
    setLoading(false)
  }

  const handleSelectWorker = async () => {
    if (!token) return
    setLoading(true)
    try {
      await jobsApi.selectWorker(jobId, proposal.workerId, token)
      toast.success('Worker selected!')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to select worker')
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Avatar className="w-12 h-12"><AvatarFallback className="bg-emerald-100 text-emerald-700">{proposal.worker?.name?.charAt(0) || '?'}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold">{proposal.worker?.name}</span>
              <StatusBadge status={proposal.status} />
              {proposal.worker?.location && <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{proposal.worker.location}</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{proposal.proposalText}</p>
            <div className="flex flex-wrap gap-4 text-sm mb-3">
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" />{proposal.expectedBudget?.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{proposal.estimatedDuration}</span>
            </div>
            {proposal.worker?.skills && (
              <div className="flex flex-wrap gap-1 mb-3">
                {proposal.worker.skills.split(',').map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s.trim()}</Badge>
                ))}
              </div>
            )}
            {isOwner && (proposal.status === 'SUBMITTED' || proposal.status === 'SHORTLISTED') && (
              <div className="flex flex-wrap gap-2">
                {proposal.status === 'SUBMITTED' && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange('SHORTLISTED')} disabled={loading}>
                    <Star className="w-3 h-3 mr-1" /> Shortlist
                  </Button>
                )}
                {proposal.status === 'SHORTLISTED' && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSelectWorker} disabled={loading}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Select Worker
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange('REJECTED')} disabled={loading}>
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// LOGIN PAGE
// ============================================

function LoginPage() {
  const { navigate } = useRouterStore()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res.user, res.token)
      toast.success('Welcome back!')
      navigate(res.user.role === 'WORKER' ? 'worker-dashboard' : 'provider-dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Handshake className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your TenderHub account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button onClick={() => navigate('register')} className="text-emerald-600 hover:underline font-medium">Sign up</button>
            </div>
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-medium mb-1">Demo Accounts:</p>
              <p>Worker: alice@example.com / password123</p>
              <p>Provider: david@example.com / password123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ============================================
// REGISTER PAGE
// ============================================

function RegisterPage() {
  const { navigate } = useRouterStore()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'WORKER' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.register(form)
      login(res.user, res.token)
      toast.success('Account created! Welcome to TenderHub!')
      navigate(res.user.role === 'WORKER' ? 'worker-dashboard' : 'provider-dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Handshake className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join TenderHub today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div>
                <Label>I want to...</Label>
                <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKER">🔍 Find work as a Worker</SelectItem>
                    <SelectItem value="JOB_PROVIDER">💼 Post jobs as a Job Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => navigate('login')} className="text-emerald-600 hover:underline font-medium">Sign in</button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ============================================
// WORKER DASHBOARD
// ============================================

function WorkerDashboardPage() {
  const { navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    dashboardApi.worker(token).then(setData).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false))
  }, [token])

  if (!user || user.role !== 'WORKER') { navigate('login'); return null }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user.name}! 👋</h1>
        <p className="text-muted-foreground">Here&apos;s your worker dashboard overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Proposals" value={data?.stats?.totalProposals || 0} icon={FileText} color="blue" />
        <StatCard label="Shortlisted" value={data?.stats?.shortlistedProposals || 0} icon={Star} color="amber" />
        <StatCard label="Active Jobs" value={data?.stats?.activeJobs || 0} icon={Briefcase} color="emerald" />
        <StatCard label="Completed" value={data?.stats?.completedJobs || 0} icon={CheckCircle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Proposals</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('worker-proposals')}>View All</Button>
          </div>
          {data?.recentProposals?.length > 0 ? (
            <div className="space-y-3">
              {data.recentProposals.map((p: any) => (
                <Card key={p.id} className="cursor-pointer hover:shadow-md transition" onClick={() => navigate('job-detail', { id: p.jobId })}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{p.job?.title}</p>
                        <p className="text-sm text-muted-foreground">${p.expectedBudget?.toLocaleString()} · {p.estimatedDuration}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No proposals yet. Start browsing jobs!</p>
                <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('browse-jobs')}>Find Jobs</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Active Jobs</h2>
          {data?.activeJobs?.length > 0 ? (
            <div className="space-y-3">
              {data.activeJobs.map((a: any) => (
                <Card key={a.id} className="cursor-pointer hover:shadow-md transition" onClick={() => navigate('job-detail', { id: a.jobId })}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{a.job?.title}</p>
                        <p className="text-sm text-muted-foreground">Assigned {new Date(a.assignedAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={a.job?.status || 'IN_PROGRESS'} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No active jobs yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// WORKER PROPOSALS PAGE
// ============================================

function WorkerProposalsPage() {
  const { navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!token) return
    proposalsApi.getMyProposals(token, statusFilter || undefined).then(res => setProposals(res.proposals)).catch(() => toast.error('Failed to load proposals')).finally(() => setLoading(false))
  }, [token, statusFilter])

  if (!user || user.role !== 'WORKER') { navigate('login'); return null }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Proposals</h1>
          <p className="text-muted-foreground">Track all your submitted proposals</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : proposals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
            <p className="text-muted-foreground mb-4">Start submitting proposals to jobs</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('browse-jobs')}>Browse Jobs</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate('job-detail', { id: p.jobId })}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{p.job?.title}</h3>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.proposalText}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{p.expectedBudget?.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{p.estimatedDuration}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.job?.createdBy && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="w-6 h-6"><AvatarFallback className="text-xs">{p.job.createdBy.name?.charAt(0)}</AvatarFallback></Avatar>
                        {p.job.createdBy.name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// WORKER JOBS PAGE (assigned jobs)
// ============================================

function WorkerJobsPage() {
  const { navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    dashboardApi.worker(token).then(setData).finally(() => setLoading(false))
  }, [token])

  if (!user || user.role !== 'WORKER') { navigate('login'); return null }

  const activeJobs = data?.activeJobs || []
  const completedCount = data?.stats?.completedJobs || 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Jobs</h1>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {loading ? <Skeleton className="h-32" /> : activeJobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active jobs</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((a: any) => (
                <Card key={a.id} className="cursor-pointer hover:shadow-md transition" onClick={() => navigate('job-detail', { id: a.jobId })}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{a.job?.title}</h3>
                        <p className="text-sm text-muted-foreground">Assigned {new Date(a.assignedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={a.job?.status || 'IN_PROGRESS'} />
                        {a.job?.status === 'IN_PROGRESS' && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              await jobsApi.complete(a.jobId, token!)
                              toast.success('Job marked as completed!')
                              dashboardApi.worker(token!).then(setData)
                            } catch (err: any) { toast.error(err.message) }
                          }}>Mark Complete</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-muted-foreground">Completed jobs</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// WORKER PROFILE PAGE
// ============================================

function WorkerProfilePage() {
  const { user, token, updateUser } = useAuthStore()
  const { navigate } = useRouterStore()
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', skills: user?.skills || '', location: user?.location || '' })
  const [loading, setLoading] = useState(false)

  if (!user) { navigate('login'); return null }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await usersApi.updateProfile(form, token!)
      updateUser(res.user)
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20"><AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">{user.name?.charAt(0)}</AvatarFallback></Avatar>
            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <Badge variant="secondary">{user.role === 'WORKER' ? '🔍 Worker' : '💼 Job Provider'}</Badge>
            </div>
          </div>
          <Separator />
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} placeholder="Tell us about yourself..." />
          </div>
          <div>
            <Label>Skills (comma-separated)</Label>
            <Input value={form.skills} onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, Node.js, Python..." />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// PROVIDER DASHBOARD
// ============================================

function ProviderDashboardPage() {
  const { navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    dashboardApi.provider(token).then(setData).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false))
  }, [token])

  if (!user || user.role !== 'JOB_PROVIDER') { navigate('login'); return null }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name}! 👋</h1>
          <p className="text-muted-foreground">Manage your jobs and proposals</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('provider-create-job')}>
          <Plus className="w-4 h-4 mr-2" /> Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Jobs" value={data?.stats?.totalJobs || 0} icon={Briefcase} color="emerald" />
        <StatCard label="Open Jobs" value={data?.stats?.openJobs || 0} icon={FileText} color="blue" />
        <StatCard label="In Progress" value={data?.stats?.inProgressJobs || 0} icon={Clock} color="purple" />
        <StatCard label="Completed" value={data?.stats?.completedJobs || 0} icon={CheckCircle} color="amber" />
        <StatCard label="Proposals" value={data?.stats?.totalProposalsReceived || 0} icon={Users} color="red" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Jobs</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('provider-jobs')}>View All</Button>
        </div>
        {data?.recentJobs?.length > 0 ? (
          <div className="space-y-4">
            {data.recentJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => navigate('job-detail', { id: job.id })}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>${job.budgetMin?.toLocaleString()} - ${job.budgetMax?.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{job._count?.proposals || 0} proposals</span>
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                      {job.selectedWorker && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Avatar className="w-5 h-5"><AvatarFallback className="text-xs">{job.selectedWorker.name?.charAt(0)}</AvatarFallback></Avatar>
                          <span className="text-emerald-600">Worker: {job.selectedWorker.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(job.status === 'OPEN' || job.status === 'PROPOSALS_RECEIVED') && job._count?.proposals > 0 && (
                        <Button size="sm" variant="outline" onClick={() => navigate('provider-job-proposals', { id: job.id })}>
                          <Eye className="w-3 h-3 mr-1" /> Review Proposals
                        </Button>
                      )}
                      {job.status === 'WORKER_SELECTED' && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
                          try {
                            await jobsApi.start(job.id, token!)
                            toast.success('Job started!')
                            dashboardApi.provider(token!).then(setData)
                          } catch (err: any) { toast.error(err.message) }
                        }}>Start Job</Button>
                      )}
                      {job.status === 'IN_PROGRESS' && (
                        <Button size="sm" variant="outline" className="text-emerald-600" onClick={async () => {
                          try {
                            await jobsApi.complete(job.id, token!)
                            toast.success('Job completed!')
                            dashboardApi.provider(token!).then(setData)
                          } catch (err: any) { toast.error(err.message) }
                        }}>Mark Complete</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Post your first job to start receiving proposals</p>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('provider-create-job')}>Post a Job</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ============================================
// PROVIDER CREATE JOB PAGE
// ============================================

function ProviderCreateJobPage() {
  const { navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [form, setForm] = useState({
    title: '', description: '', budgetMin: '', budgetMax: '',
    deadline: '', skills: '', category: '',
  })
  const [loading, setLoading] = useState(false)

  if (!user || user.role !== 'JOB_PROVIDER') { navigate('login'); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await jobsApi.create({
        ...form,
        budgetMin: parseFloat(form.budgetMin),
        budgetMax: parseFloat(form.budgetMax),
      }, token!)
      toast.success('Job posted successfully!')
      navigate('job-detail', { id: res.job.id })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
      <p className="text-muted-foreground mb-8">Create a detailed job posting to attract the best workers</p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Job Title *</Label>
              <Input placeholder="e.g., Build a React E-commerce Platform" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea placeholder="Describe the job in detail, including requirements and deliverables..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={6} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget Min ($) *</Label>
                <Input type="number" placeholder="e.g., 5000" value={form.budgetMin} onChange={(e) => setForm(f => ({ ...f, budgetMin: e.target.value }))} required />
              </div>
              <div>
                <Label>Budget Max ($) *</Label>
                <Input type="number" placeholder="e.g., 15000" value={form.budgetMax} onChange={(e) => setForm(f => ({ ...f, budgetMax: e.target.value }))} required />
              </div>
            </div>
            <div>
              <Label>Deadline *</Label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} required />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Backend Development">Backend Development</SelectItem>
                  <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Required Skills (comma-separated)</Label>
              <Input placeholder="e.g., React, Node.js, TypeScript" value={form.skills} onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Post Job
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// PROVIDER JOBS PAGE
// ============================================

function ProviderJobsPage() {
  const { navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    dashboardApi.provider(token).then(setData).finally(() => setLoading(false))
  }, [token])

  if (!user || user.role !== 'JOB_PROVIDER') { navigate('login'); return null }

  const jobs = data?.recentJobs || []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('provider-create-job')}>
          <Plus className="w-4 h-4 mr-2" /> Post Job
        </Button>
      </div>

      {loading ? <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div> : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
            <Button className="bg-emerald-600 hover:bg-emerald-700 mt-2" onClick={() => navigate('provider-create-job')}>Post Your First Job</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-md transition">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate('job-detail', { id: job.id })}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>${job.budgetMin?.toLocaleString()} - ${job.budgetMax?.toLocaleString()}</span>
                      <span><FileText className="w-3.5 h-3.5 inline mr-1" />{job._count?.proposals || 0} proposals</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(job.status === 'OPEN' || job.status === 'PROPOSALS_RECEIVED') && (
                      <Button size="sm" variant="outline" onClick={() => navigate('provider-job-proposals', { id: job.id })}>
                        <Eye className="w-3 h-3 mr-1" /> Proposals
                      </Button>
                    )}
                    {job.status === 'WORKER_SELECTED' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
                        try { await jobsApi.start(job.id, token!); toast.success('Job started!'); dashboardApi.provider(token!).then(setData) } catch (e: any) { toast.error(e.message) }
                      }}>Start</Button>
                    )}
                    {job.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="outline" className="text-emerald-600" onClick={async () => {
                        try { await jobsApi.complete(job.id, token!); toast.success('Job completed!'); dashboardApi.provider(token!).then(setData) } catch (e: any) { toast.error(e.message) }
                      }}>Complete</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// PROVIDER JOB PROPOSALS PAGE
// ============================================

function ProviderJobProposalsPage() {
  const { params, navigate } = useRouterStore()
  const { token, user } = useAuthStore()
  const [proposals, setProposals] = useState<any[]>([])
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !params.id) return
    let cancelled = false
    Promise.all([
      jobsApi.get(params.id, token),
      jobsApi.getProposals(params.id, token),
    ]).then(([jobRes, propRes]) => {
      if (!cancelled) {
        setJob(jobRes.job)
        setProposals(propRes.proposals)
        setLoading(false)
      }
    }).catch((error: any) => {
      if (!cancelled) {
        toast.error(error.message || 'Failed to load')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [token, params.id])

  const fetchData = async () => {
    if (!token || !params.id) return
    try {
      const [jobRes, propRes] = await Promise.all([
        jobsApi.get(params.id, token),
        jobsApi.getProposals(params.id, token),
      ])
      setJob(jobRes.job)
      setProposals(propRes.proposals)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load')
    }
  }

  if (!user || user.role !== 'JOB_PROVIDER') { navigate('login'); return null }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8"><Skeleton className="h-64" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate('provider-jobs')} className="mb-4">
        <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to My Jobs
      </Button>

      {job && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Proposals for &quot;{job.title}&quot;</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            <span className="text-muted-foreground">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received</span>
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
            <p className="text-muted-foreground">Workers will start submitting proposals soon</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((p: any) => (
            <ProposalCard key={p.id} proposal={p} isOwner={true} jobId={params.id} onRefresh={fetchData} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// NOTIFICATIONS PAGE
// ============================================

function NotificationsPage() {
  const { token, user } = useAuthStore()
  const { navigate } = useRouterStore()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!token) return
    notificationsApi.list(token).then(res => {
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
    }).finally(() => setLoading(false))
  }, [token])

  if (!user) { navigate('login'); return null }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id, token!)
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, isRead: true } : notif))
      setUnreadCount(c => c - 1)
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead(token!)
      setNotifications(n => n.map(notif => ({ ...notif, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {}
  }

  const typeIcons: Record<string, any> = {
    PROPOSAL_RECEIVED: FileText,
    PROPOSAL_STATUS_CHANGED: Star,
    WORKER_SELECTED: CheckCircle,
    JOB_STATUS_CHANGED: Briefcase,
    JOB_COMPLETED: Award,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Mark All Read</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="text-muted-foreground">You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = typeIcons[n.type] || Bell
            return (
              <Card key={n.id} className={`cursor-pointer transition hover:shadow-sm ${!n.isRead ? 'border-emerald-200 bg-emerald-50/50' : ''}`} onClick={() => !n.isRead && handleMarkRead(n.id)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN APP
// ============================================

export default function Home() {
  const { currentPage, params, navigate } = useRouterStore()
  const { isAuthenticated, user, token } = useAuthStore()

  // Validate auth for protected pages
  useEffect(() => {
    const protectedPages: Record<string, string> = {
      'worker-dashboard': 'WORKER',
      'worker-proposals': 'WORKER',
      'worker-jobs': 'WORKER',
      'worker-profile': 'WORKER',
      'worker-notifications': 'WORKER',
      'provider-dashboard': 'JOB_PROVIDER',
      'provider-create-job': 'JOB_PROVIDER',
      'provider-jobs': 'JOB_PROVIDER',
      'provider-job-proposals': 'JOB_PROVIDER',
      'provider-notifications': 'JOB_PROVIDER',
    }
    const requiredRole = protectedPages[currentPage]
    if (requiredRole && (!isAuthenticated || user?.role !== requiredRole)) {
      navigate('login')
    }
  }, [currentPage, isAuthenticated, user, navigate])

  // Verify token on mount
  useEffect(() => {
    if (token && isAuthenticated) {
      authApi.me(token).catch(() => {
        useAuthStore.getState().logout()
      })
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />
      case 'browse-jobs': return <BrowseJobsPage />
      case 'job-detail': return <JobDetailPage />
      case 'login': return <LoginPage />
      case 'register': return <RegisterPage />
      case 'worker-dashboard': return <WorkerDashboardPage />
      case 'worker-proposals': return <WorkerProposalsPage />
      case 'worker-jobs': return <WorkerJobsPage />
      case 'worker-profile': return <WorkerProfilePage />
      case 'worker-notifications': return <NotificationsPage />
      case 'provider-dashboard': return <ProviderDashboardPage />
      case 'provider-create-job': return <ProviderCreateJobPage />
      case 'provider-jobs': return <ProviderJobsPage />
      case 'provider-job-proposals': return <ProviderJobProposalsPage />
      case 'provider-notifications': return <NotificationsPage />
      default: return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
