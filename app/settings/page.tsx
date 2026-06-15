'use client';
import { useState } from 'react';
import { Save, RotateCcw, Send, RefreshCw, Eye, EyeOff } from 'lucide-react';

const tabs = ['General', 'Company Profile', 'Financial Settings', 'Notifications', 'Roles & Permissions', 'Security', 'Backup & Restore', 'Integrations', 'System Logs'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [showPass, setShowPass] = useState(false);
  const [settings, setSettings] = useState({
    dateFormat: 'DD MMM YYYY', timeFormat: '12 Hour (hh:mm AM/PM)', currency: 'Indian Rupee (₹)',
    timezone: '(GMT +05:30) Asia / Kolkata', language: 'English',
    dataExport: true, auditLog: true, multiBranch: true,
    dashboardView: 'Operations Dashboard', itemsPerPage: '25', autoLogout: '30 Minutes',
    confirmDelete: true, backupReminder: true, showTips: false,
    invoiceFormat: 'INV- (YYYY)- (00001)', receiptFormat: 'RCT- (YYYY)- (00001)',
    workOrderFormat: 'WO- (YYYY)- (00001)', vehicleFormat: 'TN-XX-0000', driverFormat: 'DRV- (0001)',
    txnRetention: '7 Years', auditRetention: '3 Years', deletedRetention: '30 Days',
    mailProvider: 'SMTP', smtpHost: 'smtp.gmail.com', smtpPort: '587',
    emailAddress: 'noreply@mlstransports.com', emailPassword: '..............', encryption: 'TLS',
    tripNotif: 'Email + In-App', maintenanceNotif: 'Email + In-App', expenseNotif: 'Email',
    dieselNotif: 'Email + In-App', systemNotif: 'In-App',
  });

  const toggle = (key: keyof typeof settings) => setSettings(s => ({...s, [key]: !s[key]}));

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}></span>
    </button>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Dashboard / Settings / {activeTab}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === 'General' && (
          <div className="p-6 grid grid-cols-3 gap-8">
            {/* General Settings */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">General Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Date Format', key: 'dateFormat', options: ['DD MMM YYYY','MM/DD/YYYY','YYYY-MM-DD'] },
                  { label: 'Time Format', key: 'timeFormat', options: ['12 Hour (hh:mm AM/PM)','24 Hour (HH:mm)'] },
                  { label: 'Currency', key: 'currency', options: ['Indian Rupee (₹)','US Dollar ($)','Euro (€)'] },
                  { label: 'Timezone', key: 'timezone', options: ['(GMT +05:30) Asia / Kolkata','(GMT +00:00) UTC'] },
                  { label: 'Language', key: 'language', options: ['English','Tamil','Hindi'] },
                ].map((f,i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                    <select value={settings[f.key as keyof typeof settings] as string}
                      onChange={e => setSettings(s => ({...s, [f.key]: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Enable Data Export', sub: 'Allow users to export data to Excel / PDF.', key: 'dataExport' },
                    { label: 'Enable Audit Log', sub: 'Track important activities across the system.', key: 'auditLog' },
                    { label: 'Enable Multi Branch', sub: 'Manage operations for multiple branches.', key: 'multiBranch' },
                  ].map((t,i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div><p className="text-sm font-medium text-gray-700">{t.label}</p><p className="text-xs text-gray-400">{t.sub}</p></div>
                      <Toggle on={settings[t.key as keyof typeof settings] as boolean} onToggle={() => toggle(t.key as keyof typeof settings)} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Save size={14} /> Save Changes</button>
                  <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RotateCcw size={14} /> Reset</button>
                </div>
              </div>

              {/* Email Settings */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Email Settings</h3>
                <div className="space-y-4">
                  <div><label className="text-xs text-gray-500 block mb-1">Mail Provider</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"><option>SMTP</option></select>
                  </div>
                  {[
                    { label: 'SMTP Host', key: 'smtpHost', type: 'text' },
                    { label: 'SMTP Port', key: 'smtpPort', type: 'text' },
                    { label: 'Email Address', key: 'emailAddress', type: 'email' },
                  ].map((f,i) => (
                    <div key={i}>
                      <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                      <input type={f.type} value={settings[f.key as keyof typeof settings] as string}
                        onChange={e => setSettings(s => ({...s, [f.key]: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={settings.emailPassword}
                        onChange={e => setSettings(s => ({...s, emailPassword: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Encryption</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"><option>TLS</option><option>SSL</option></select>
                  </div>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full justify-center">
                    <Send size={14} /> Send Test Email
                  </button>
                </div>
              </div>
            </div>

            {/* System Preferences */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">System Preferences</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-gray-500 text-xs">📊</span></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Dashboard Default View</p>
                      <p className="text-xs text-gray-400">Select default dashboard for login</p>
                    </div>
                    <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700"><option>Operations Dashboard</option><option>Main Dashboard</option></select>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-xs">📋</span></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Items Per Page</p>
                      <p className="text-xs text-gray-400">Set default number of records per page</p>
                    </div>
                    <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700"><option>25</option><option>50</option><option>100</option></select>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-xs">🔒</span></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Auto Logout</p>
                      <p className="text-xs text-gray-400">Automatically logout inactive users</p>
                    </div>
                    <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700"><option>30 Minutes</option><option>1 Hour</option><option>2 Hours</option></select>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  {[
                    { label: 'Confirm Before Delete', sub: 'Show confirmation before deleting data', key: 'confirmDelete' },
                    { label: 'Enable Data Backup Reminder', sub: 'Show reminder to backup data regularly', key: 'backupReminder' },
                    { label: 'Show Tips on Dashboard', sub: 'Display helpful tips and suggestions', key: 'showTips' },
                  ].map((t,i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          {i === 0 ? '✓' : i === 1 ? '💾' : '💡'}
                        </div>
                        <div><p className="text-sm font-medium text-gray-700">{t.label}</p><p className="text-xs text-gray-400">{t.sub}</p></div>
                      </div>
                      <Toggle on={settings[t.key as keyof typeof settings] as boolean} onToggle={() => toggle(t.key as keyof typeof settings)} />
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full justify-center mt-2">
                  <Save size={14} /> Save Preferences
                </button>
              </div>

              {/* Notification Preferences */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🚚', label: 'Trip Assignments', sub: 'Notify when a trip is assigned', key: 'tripNotif' },
                    { icon: '🔧', label: 'Maintenance Due', sub: 'Notify before maintenance due', key: 'maintenanceNotif' },
                    { icon: '👤', label: 'Expense Approvals', sub: 'Notify for expense approvals', key: 'expenseNotif' },
                    { icon: '⛽', label: 'Diesel Alerts', sub: 'Notify for low stock / unusual usage', key: 'dieselNotif' },
                    { icon: '⚙️', label: 'System Updates', sub: 'Notify for system updates & news', key: 'systemNotif' },
                  ].map((n,i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">{n.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{n.label}</p>
                        <p className="text-xs text-gray-400">{n.sub}</p>
                      </div>
                      <select value={settings[n.key as keyof typeof settings] as string}
                        onChange={e => setSettings(s => ({...s, [n.key]: e.target.value}))}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700">
                        {['Email + In-App','Email','In-App','None'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full justify-center mt-4">
                  <Save size={14} /> Save Notification Settings
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Document & Number Settings */}
              <h3 className="font-semibold text-gray-800 mb-4">Document & Number Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Invoice Number Format', key: 'invoiceFormat', example: 'Example: INV-2026-00001' },
                  { label: 'Receipt Number Format', key: 'receiptFormat', example: 'Example: RCT-2026-00001' },
                  { label: 'Work Order Format', key: 'workOrderFormat', example: 'Example: WO-2026-00001' },
                  { label: 'Vehicle Number Format', key: 'vehicleFormat', example: 'Example: TN-01-AB-1234' },
                  { label: 'Driver ID Format', key: 'driverFormat', example: 'Example: DRV-0001' },
                ].map((f,i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                    <input type="text" value={settings[f.key as keyof typeof settings] as string}
                      onChange={e => setSettings(s => ({...s, [f.key]: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <p className="text-xs text-gray-400 mt-1">{f.example}</p>
                  </div>
                ))}
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full justify-center">
                  <Save size={14} /> Save Formats
                </button>
              </div>

              {/* Data Retention */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Data Retention</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Transaction Data', sub: 'Keep transaction history for', key: 'txnRetention', options: ['1 Year','3 Years','5 Years','7 Years','10 Years'] },
                    { label: 'Audit Logs', sub: 'Keep audit logs for', key: 'auditRetention', options: ['1 Year','2 Years','3 Years','5 Years'] },
                    { label: 'Deleted Records', sub: 'Move deleted records to archive after', key: 'deletedRetention', options: ['7 Days','30 Days','90 Days','1 Year'] },
                  ].map((f,i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div><p className="text-sm font-medium text-gray-700">{f.label}</p><p className="text-xs text-gray-400">{f.sub}</p></div>
                      <select value={settings[f.key as keyof typeof settings] as string}
                        onChange={e => setSettings(s => ({...s, [f.key]: e.target.value}))}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700">
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full justify-center mt-4">
                  <Save size={14} /> Save Retention Settings
                </button>
              </div>

              {/* System Information */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">System Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {[
                    { label: 'Application Version', value: 'v2.5.1' },
                    { label: 'Database Version', value: 'MySQL 8.0.36' },
                    { label: 'Last Backup', value: '06 Jun 2026, 11:30 PM', badge: 'Success' },
                    { label: 'Server Time', value: '07 Jun 2026, 10:24 AM' },
                  ].map((r,i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{r.value}</span>
                        {r.badge && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{r.badge}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm w-full justify-center mt-3 hover:bg-gray-50">
                  <RefreshCw size={14} /> Check for Updates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'General' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{activeTab}</h3>
            <p className="text-gray-400 text-sm">Configure {activeTab.toLowerCase()} settings here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
