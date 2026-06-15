'use client';
import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Wrench, FileText, Truck, X, Check } from 'lucide-react';

const notifications = [
  { id: 1, type: 'alert', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', title: 'Low Diesel Stock Alert', message: 'Diesel stock is running low. Current stock: 8,650 Ltr. Will last approximately 2.3 days.', time: '07 Jun 2026, 10:15 AM', unread: true, category: 'Diesel' },
  { id: 2, type: 'warning', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', title: 'Permit Expiring Soon', message: '3 vehicles have permits expiring within the next 30 days. Please renew them to avoid penalties.', time: '07 Jun 2026, 09:30 AM', unread: true, category: 'Fleet' },
  { id: 3, type: 'info', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Trip TRP1256 Started', message: 'Trip TRP1256 from Coimbatore to Chennai has started. Driver: Arun Kumar. Vehicle: TN 01 AB 1234.', time: '07 Jun 2026, 06:05 AM', unread: true, category: 'Trips' },
  { id: 4, type: 'success', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', title: 'Payment Received', message: 'Payment of ₹ 1,25,000 received from ABC Steels Pvt Ltd against Invoice INV/2026/068.', time: '07 Jun 2026, 05:45 AM', unread: false, category: 'Accounts' },
  { id: 5, type: 'warning', icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-50', title: 'Maintenance Due', message: 'Vehicle TN 01 AB 1234 is due for Preventive Service on 10 Jun 2026 (KM: 12,500).', time: '06 Jun 2026, 11:00 PM', unread: false, category: 'Maintenance' },
  { id: 6, type: 'info', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', title: 'Expense Pending Approval', message: '8 expenses worth ₹ 1,25,600 are pending your approval. Please review and approve.', time: '06 Jun 2026, 08:30 PM', unread: false, category: 'Expenses' },
  { id: 7, type: 'alert', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', title: 'Insurance Expiry Alert', message: '2 vehicles have insurance expiring on 12 Jun 2026. Please renew immediately.', time: '06 Jun 2026, 06:00 PM', unread: false, category: 'Fleet' },
  { id: 8, type: 'success', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', title: 'Diesel Received', message: '5,000 Ltrs of diesel received from Indian Oil - Peelamedu. Reference: REC/2026/0445.', time: '06 Jun 2026, 02:00 PM', unread: false, category: 'Diesel' },
];

const categories = ['All', 'Trips', 'Fleet', 'Diesel', 'Accounts', 'Maintenance', 'Expenses'];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('All');
  const [notifs, setNotifs] = useState(notifications);

  const filtered = filter === 'All' ? notifs : notifs.filter(n => n.category === filter);
  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(n => n.map(x => ({...x, unread: false})));
  const dismiss = (id: number) => setNotifs(n => n.filter(x => x.id !== id));
  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? {...x, unread: false} : x));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500">Dashboard / Notifications</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">{unreadCount} unread</span>}
          <button onClick={markAllRead} className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-white">
            <Check size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <Bell size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications in this category.</p>
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id} className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${n.unread ? 'border-blue-200 border-l-4 border-l-blue-500' : 'border-gray-100'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                <n.icon size={18} className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${n.unread ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h4>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{n.time}</span>
                </div>
                <p className="text-sm text-gray-500">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    n.type === 'alert' ? 'bg-red-100 text-red-600' :
                    n.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                    n.type === 'success' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'}`}>{n.category}</span>
                  {n.unread && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 hover:underline">Mark as read</button>
                  )}
                </div>
              </div>
              <button onClick={() => dismiss(n.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
