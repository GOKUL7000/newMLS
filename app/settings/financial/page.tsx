'use client';
import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
export default function Page() {
  const titles: Record<string,string> = { company:'Company Profile', financial:'Financial Settings', notifications:'Notification Settings', roles:'Roles & Permissions', security:'Security Settings', backup:'Backup & Restore', integrations:'Integrations', logs:'System Logs' };
  const title = titles['financial'] || 'financial';
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="text-sm text-gray-500">Dashboard / Settings / {title}</p></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-6 py-4"><h2 className="font-semibold text-gray-800">{title}</h2></div>
        <div className="p-6">
          <SettingsContent section={'financial'}/>
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ section }: { section: string }) {
  const [form, setForm] = useState<Record<string,string>>({});
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));

  const fields: Record<string,{label:string,type:string,placeholder?:string,options?:string[]}[]> = {
    company: [
      {label:'Company Name',type:'text',placeholder:'MLS Transports'},
      {label:'Registration No.',type:'text',placeholder:'TN-CBE-12345'},
      {label:'GSTIN',type:'text',placeholder:'33AAML1234D1Z5'},
      {label:'PAN No.',type:'text',placeholder:'AAML12345D'},
      {label:'Address Line 1',type:'text',placeholder:'No. 45, Transport Nagar'},
      {label:'Address Line 2',type:'text',placeholder:'Coimbatore - 641012'},
      {label:'City',type:'text',placeholder:'Coimbatore'},
      {label:'State',type:'select',options:['Tamil Nadu','Karnataka','Maharashtra','Andhra Pradesh']},
      {label:'Pincode',type:'text',placeholder:'641012'},
      {label:'Phone',type:'text',placeholder:'+91 98451 00001'},
      {label:'Email',type:'email',placeholder:'info@mlstransports.com'},
      {label:'Website',type:'text',placeholder:'www.mlstransports.com'},
    ],
    financial: [
      {label:'Base Currency',type:'select',options:['Indian Rupee (₹ INR)','US Dollar ($ USD)','Euro (€ EUR)']},
      {label:'Financial Year Start',type:'select',options:['April 1 (India)','January 1','July 1']},
      {label:'GST Rate (Default %)',type:'number',placeholder:'18'},
      {label:'TDS Rate (%)',type:'number',placeholder:'2'},
      {label:'Credit Period (Days)',type:'number',placeholder:'30'},
      {label:'Invoice Prefix',type:'text',placeholder:'INV/2026/'},
      {label:'Receipt Prefix',type:'text',placeholder:'RCT/2026/'},
      {label:'Payment Prefix',type:'text',placeholder:'PAY/2026/'},
      {label:'Purchase Prefix',type:'text',placeholder:'PUR/2026/'},
      {label:'Late Payment Interest (%)',type:'number',placeholder:'12'},
    ],
    notifications: [
      {label:'Trip Assignment Notifications',type:'select',options:['Email + In-App','Email Only','In-App Only','Disabled']},
      {label:'Maintenance Due Alerts',type:'select',options:['Email + In-App','Email Only','In-App Only','Disabled']},
      {label:'Document Expiry Alerts',type:'select',options:['Email + In-App','Email Only','In-App Only','Disabled']},
      {label:'Expense Approval Alerts',type:'select',options:['Email + In-App','Email Only','In-App Only','Disabled']},
      {label:'Diesel Stock Alerts',type:'select',options:['Email + In-App','Email Only','In-App Only','Disabled']},
      {label:'Payment Received Alerts',type:'select',options:['Email + In-App','Email Only','In-App Only','Disabled']},
      {label:'Alert Email Recipients',type:'email',placeholder:'admin@mlstransports.com'},
      {label:'Alert Frequency',type:'select',options:['Real-time','Hourly Digest','Daily Digest']},
    ],
    security: [
      {label:'Password Min Length',type:'select',options:['6 Characters','8 Characters','10 Characters','12 Characters']},
      {label:'Password Expiry',type:'select',options:['Never','30 Days','60 Days','90 Days','180 Days']},
      {label:'Session Timeout',type:'select',options:['15 Minutes','30 Minutes','1 Hour','2 Hours','4 Hours']},
      {label:'Max Login Attempts',type:'select',options:['3 Attempts','5 Attempts','10 Attempts']},
      {label:'2FA Authentication',type:'select',options:['Disabled','Optional','Required for Admins','Required for All']},
      {label:'IP Whitelist',type:'text',placeholder:'e.g. 192.168.1.0/24'},
      {label:'Audit Log Retention',type:'select',options:['1 Year','2 Years','3 Years','5 Years']},
    ],
    backup: [
      {label:'Auto Backup Frequency',type:'select',options:['Daily','Weekly','Monthly','Manual Only']},
      {label:'Backup Time',type:'time'},
      {label:'Backup Storage',type:'select',options:['Local Server','Google Drive','AWS S3','Dropbox']},
      {label:'Keep Last N Backups',type:'select',options:['5 Backups','10 Backups','20 Backups','All Backups']},
      {label:'Backup Email Notification',type:'email',placeholder:'admin@mlstransports.com'},
    ],
    integrations: [
      {label:'GPS Tracking Provider',type:'select',options:['None','TrackoBit','GPSTrack','Rosmerta']},
      {label:'GPS API Key',type:'text',placeholder:'Enter API key'},
      {label:'Tally Integration',type:'select',options:['Disabled','Enabled (Tally Prime)','Enabled (Tally ERP 9)']},
      {label:'WhatsApp Business API',type:'text',placeholder:'Enter WhatsApp API token'},
      {label:'SMS Gateway',type:'select',options:['None','MSG91','Fast2SMS','Twilio']},
      {label:'SMS API Key',type:'text',placeholder:'Enter SMS API key'},
      {label:'Email Service',type:'select',options:['SMTP','SendGrid','Mailgun','AWS SES']},
    ],
    logs: [],
  };

  if (section === 'roles') {
    return <div className="text-center py-12 text-gray-400"><p className="text-sm">Roles & Permissions are managed in the Users section.</p><a href="/users/roles" className="text-blue-600 text-sm hover:underline mt-2 block">Go to Roles & Permissions →</a></div>;
  }

  if (section === 'logs') {
    const logs = [
      {time:'07 Jun 2026, 10:30 AM',level:'INFO',msg:'User Gokul logged in successfully',src:'Auth'},
      {time:'07 Jun 2026, 10:15 AM',level:'INFO',msg:'Trip TRP1256 created by Karthik S',src:'Trips'},
      {time:'07 Jun 2026, 09:55 AM',level:'INFO',msg:'Vehicle TN 01 AB 1234 updated',src:'Fleet'},
      {time:'07 Jun 2026, 09:30 AM',level:'INFO',msg:'Expense EXP2026/2158 approved',src:'Expenses'},
      {time:'07 Jun 2026, 09:00 AM',level:'INFO',msg:'Work order WO/2026/2178 created',src:'Maintenance'},
      {time:'06 Jun 2026, 11:30 PM',level:'INFO',msg:'Auto backup completed successfully',src:'System'},
      {time:'06 Jun 2026, 07:30 PM',level:'WARN',msg:'User Selvam T - failed login attempt (2/3)',src:'Auth'},
      {time:'05 Jun 2026, 05:35 PM',level:'ERROR',msg:'User Selvam T account locked after 3 failed attempts',src:'Auth'},
    ];
    return (
      <div className="space-y-3">
        {logs.map((l,i)=>(
          <div key={i} className={`flex items-center gap-3 text-xs font-mono p-2 rounded ${l.level==='ERROR'?'bg-red-50':l.level==='WARN'?'bg-yellow-50':'bg-gray-50'}`}>
            <span className="text-gray-400 flex-shrink-0">{l.time}</span>
            <span className={`flex items-center gap-3 text-xs font-mono p-2 rounded ${l.level==='ERROR'?'bg-red-50':l.level==='WARN'?'bg-yellow-50':'bg-gray-50'}`}>{l.level}</span>
            <span className="text-gray-400 flex-shrink-0">[{l.src}]</span>
            <span className="text-gray-700">{l.msg}</span>
          </div>
        ))}
      </div>
    );
  }

  const sectionFields = fields[section] || [];
  return (
    <div>
      <div className="grid grid-cols-2 gap-6">
        {sectionFields.map((f,i)=>(
          <div key={i}>
            <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
            {f.type==='select'?
              <select value={form[f.label]||''} onChange={e=>set(f.label,e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                {(f.options||[]).map(o=><option key={o}>{o}</option>)}
              </select>
              :f.type==='time'?
              <input type="time" value={form[f.label]||'23:00'} onChange={e=>set(f.label,e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
              :
              <input type={f.type} value={form[f.label]||''} onChange={e=>set(f.label,e.target.value)} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
            }
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-8">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Save size={14}/> Save Changes</button>
        <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"><RotateCcw size={14}/> Reset</button>
      </div>
    </div>
  );
}
