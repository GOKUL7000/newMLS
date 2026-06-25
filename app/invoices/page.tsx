'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Search, X, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, FileText, CreditCard,
  ArrowRight, Clock, CheckCheck, Wallet, Download, ExternalLink,
} from 'lucide-react';

const supabase = createClientComponentClient();
const BUCKET   = 'Trips';
const PAGE_SIZE = 10;
const inputCls  = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Invoice {
  id: string;
  invoice_no: string;
  invoice_date: string;
  amount: number;
  cgst_pct?: number;
  sgst_pct?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  total_amount?: number;
  status: 'Pending' | 'PaymentReceived' | 'PaidOut';
  payment_received_at: string | null;
  payment_received_amount: number | null;
  paid_out_at: string | null;
  paid_out_amount: number | null;
  notes: string | null;
  summary_pdf?: string | null;
  invoice_pdf?: string | null;
  customer_name?: string;
  customer_id?: string | null;
  ownership?: string;
  supplier_name?: string;
  driver_name?: string;
  estimated_profit?: number | null;
  supplier_amount?: number | null;
  tds_amount?: number | null;
}

interface SettledTrip {
  id: string;
  trip_no: string;
  trip_date: string;
  customer_id: string | null;
  customer_name?: string;
  vehicle_no?: string;
  origin: string | null;
  destination: string | null;
  freight_amount: number | null;
  total_tonnage: number | null;
  rate: number | null;
  ownership: string;
  driver_name?: string;
  supplier_name?: string;
  material: string | null;
  estimated_profit: number | null;
  do_no: string | null;
  shipment_no: string | null;
}

type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Pending:         { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700' },
  PaymentReceived: { label: 'Payment Received', color: 'bg-blue-100 text-blue-700'    },
  PaidOut:         { label: 'Paid Out',         color: 'bg-green-100 text-green-700'  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inr(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toWords(n: number): string {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
    'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function conv(x: number): string {
    if (x === 0)       return '';
    if (x < 20)        return ones[x];
    if (x < 100)       return tens[Math.floor(x/10)] + (x%10 ? ' '+ones[x%10] : '');
    if (x < 1000)      return ones[Math.floor(x/100)]+' Hundred'+(x%100?' '+conv(x%100):'');
    if (x < 100000)    return conv(Math.floor(x/1000))+' Thousand'+(x%1000?' '+conv(x%1000):'');
    if (x < 10000000)  return conv(Math.floor(x/100000))+' Lakh'+(x%100000?' '+conv(x%100000):'');
    return conv(Math.floor(x/10000000))+' Crore'+(x%10000000?' '+conv(x%10000000):'');
  }
  const ip = Math.floor(n);
  const ps = Math.round((n - ip) * 100);
  return conv(ip) + (ps > 0 ? ' And '+conv(ps)+' Paise' : '') + ' Only';
}

function fmtSlash(s: string | null): string {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
function fmtDot(s: string | null): string {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY PDF (Annexure — landscape)
// ─────────────────────────────────────────────────────────────────────────────
function generateSummaryPdf(data: Record<string, any>): Blob {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();
  const mar = 10;
  let   y   = mar;

  const col1 = (pw - 2*mar) * 0.33;
  const col2 = (pw - 2*mar) * 0.33;
  const col3 = (pw - 2*mar) * 0.34;

  // FROM/TO header
  doc.setFillColor(26,26,26);
  doc.rect(mar, y, pw-2*mar, 7, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(7); doc.setFont('helvetica','bold');
  doc.text('FROM', mar+col1/2, y+4.5, { align:'center' });
  doc.text('TO',   mar+col1+col2/2, y+4.5, { align:'center' });
  y += 7;

  const contentH = 32;
  doc.setDrawColor(150,150,150);
  doc.rect(mar,           y, col1, contentH);
  doc.rect(mar+col1,      y, col2, contentH);
  doc.rect(mar+col1+col2, y, col3, contentH);

  doc.setTextColor(26,26,26);
  doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
  doc.text('MLS ENTERPRISES', mar+2, y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(6);
  ['FLAT NO.15/301, MD 644 NEARBY','SENDURAI BUS STOP, SENDURAI PO.,',
   'NATHAM MAIN ROAD, DINDIGUL, TAMIL NADU - 624403',
   `PAN NO:- ${data.pan}`,`GSTIN:- ${data.gst}`]
    .forEach((l, i) => doc.text(l, mar+2, y+10+i*4.5));

  doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
  doc.text(data.to_company_short, mar+col1+2, y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(6);
  doc.text('TAMILNADU', mar+col1+2, y+10);

  [`Bill Sequence: ${data.bill_seq||''}`,`Bill No: ${data.bill_no}`,
   `Bill Date: ${data.bill_date}`,`For Dist. Channel: ${data.dist_channel||'TRADE'}`,'WO Number:']
    .forEach((l, i) => doc.text(l, mar+col1+col2+2, y+5+i*4.5));
  y += contentH + 4;

  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(26,26,26);
  doc.text(
    `BEING TRANSPORTATION CHARGES OF CEMENT FROM ${data.to_company_short} TO DIFFERENT DESTINATIONS`,
    pw/2, y, { align:'center' }
  );
  y += 6;

  const trips  = (data.trips || []) as any[];
  let tQty = 0, tAmt = 0;
  const tableRows = trips.map((t: any, i: number) => {
    const qty = parseFloat(t.qty) || 0;
    const amt = parseFloat(t.amount) || 0;
    tQty += qty; tAmt += amt;
    return [String(i+1), t.bill_date||'', t.do_no||'', t.shipment_no||'',
            t.ship_to||'', t.destination||'', t.truck_no||'',
            qty.toFixed(2), inr(t.rate||0), inr(amt), String(t.shortage||0), ''];
  });
  tableRows.push(['','','','','TOTAL VALUE:','','', tQty.toFixed(2),'',inr(tAmt),'0','']);

  autoTable(doc, {
    startY: y,
    head: [['SLNO','BILL DATE','DO NO','SHIPMENT NO','SHIP TO PARTY','DESTINATION','TRUCK NO','QTY','RATE','AMOUNT','SHORTAGE(KG)','REMARKS']],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 5.5, cellPadding: 1.5, textColor: [26,26,26] },
    headStyles: { fillColor:[26,26,26], textColor:[255,255,255], fontStyle:'bold', fontSize:6 },
    columnStyles: {
      0:{halign:'center',cellWidth:8}, 1:{halign:'center',cellWidth:18},
      2:{halign:'center',cellWidth:22}, 3:{halign:'center',cellWidth:22},
      4:{halign:'left',cellWidth:35}, 5:{halign:'center',cellWidth:25},
      6:{halign:'center',cellWidth:20}, 7:{halign:'center',cellWidth:14},
      8:{halign:'right',cellWidth:18}, 9:{halign:'right',cellWidth:20},
      10:{halign:'center',cellWidth:18}, 11:{halign:'center',cellWidth:15},
    },
    didParseCell: (h) => {
      if (h.row.index === tableRows.length-1) {
        h.cell.styles.fillColor = [240,240,240];
        h.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left:mar, right:mar },
  });

  const fy = (doc as any).lastAutoTable.finalY + 5;
  doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(26,26,26);
  doc.text(`No. Of Challans : ${trips.length}`, mar, fy);
  doc.text(`Rupees in Word: ${data.annexure_words}`, mar, fy+5);

  const ffy = fy+12;
  const fw  = [60,80,50];
  doc.setDrawColor(150,150,150);
  fw.reduce((cx, w, i) => {
    doc.rect(cx, ffy, w, 12);
    return cx + w;
  }, mar);
  doc.setFont('helvetica','normal'); doc.setFontSize(6);
  doc.text(`GST will be paid by ${data.to_company_short}`, mar+2, ffy+4);
  doc.text(`GSTIN : ${data.to_gst}`, mar+2, ffy+8);
  doc.text('Whether Tax payment on Reverse Charge Basis Yes', mar+fw[0]+2, ffy+6);
  doc.setFont('helvetica','bold');
  doc.text('FOR MLS ENTERPRISES', mar+fw[0]+fw[1]+2, ffy+6);

  return doc.output('blob');
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE PDF (Tax Invoice — portrait)
// ─────────────────────────────────────────────────────────────────────────────
function generateInvoicePdf(data: Record<string, any>): Blob {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const pw  = doc.internal.pageSize.getWidth();
  const mar = 10;
  let   y   = mar;

  doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(26,26,26);
  doc.text('MLS ENTERPRISES', pw/2, y+6, { align:'center' });
  y += 10;
  doc.setFont('helvetica','normal'); doc.setFontSize(7);
  doc.text('MAIN ROAD, DALMIAPURAM, TIRUCHIRAPPALLI, TAMIL NADU, 621651.', pw/2, y+3, { align:'center' });
  y += 6;
  doc.text('H/O:15/301, MD 644, NATHAM MAIN ROAD, SENDURAI, DINDIGUL-624403.', pw/2, y+3, { align:'center' });
  y += 7;

  doc.setDrawColor(26,26,26); doc.setLineWidth(0.5);
  doc.line(mar, y, pw-mar, y); y += 3;
  doc.setFont('helvetica','bold'); doc.setFontSize(11);
  doc.text('TAX INVOICE', pw/2, y+4, { align:'center' });
  y += 7;
  doc.line(mar, y, pw-mar, y); y += 3;

  // Meta
  autoTable(doc, {
    startY: y,
    body: [
      ['PAN No.',data.pan,'Phone/Cell No :',data.phone],
      ['GST No.',data.gst,'Email :',data.email],
      ['PF Code','NIL','Bill No :',data.bill_no],
      ['ESI Code','NIL','Bill Date :',data.bill_date],
      ['Vendor Code',data.vendor_code||'','Running/Final :',''],
    ],
    theme:'grid',
    styles:{fontSize:7,cellPadding:1.5,textColor:[26,26,26]},
    columnStyles:{0:{fontStyle:'bold',cellWidth:28},1:{cellWidth:47},2:{fontStyle:'bold',cellWidth:28},3:{cellWidth:47}},
    margin:{left:mar,right:mar},
  });
  y = (doc as any).lastAutoTable.finalY;

  // Address
  autoTable(doc, {
    startY: y,
    body: [
      ['To:',`The Authorised Officer, ${data.to_company}, ${data.to_address}`,'PO/WO No. & Date :',''],
      ['From :',data.from_period,'Cost Centre/Asset Code :',''],
      ['To:',data.to_period,'Entry Sheet No & Date',''],
      [`GST No: ${data.to_gst}`,'','',''],
    ],
    theme:'grid',
    styles:{fontSize:7,cellPadding:1.5,textColor:[26,26,26]},
    columnStyles:{0:{fontStyle:'bold',cellWidth:14},1:{cellWidth:75},2:{fontStyle:'bold',cellWidth:45},3:{cellWidth:16}},
    margin:{left:mar,right:mar},
  });
  y = (doc as any).lastAutoTable.finalY;

  // Nature of work
  autoTable(doc, {
    startY: y,
    body: [
      ['NATURE OF WORK:',data.nature_of_work,''],
      [`HSN/SAC Code : ${data.hsn}`,'Service Description: Good Transport Agency Service For Road Transport',''],
    ],
    theme:'grid',
    styles:{fontSize:7,cellPadding:1.5,textColor:[26,26,26]},
    columnStyles:{0:{fontStyle:'bold',cellWidth:45},1:{cellWidth:95},2:{cellWidth:10}},
    margin:{left:mar,right:mar},
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Letter
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(26,26,26);
  doc.text('Dear Sir(s),', mar, y); y += 5;
  doc.text('Kindly process this invoice raised by our establishment, namely MLS ENTERPRISES for the service rendered to your organisation as required under the terms of WO/Agreement and settle the bill amount.',
    mar, y, { maxWidth: pw-2*mar }); y += 10;
  doc.text(`I/We have taken registration under the CGST Act, 2017 and have exercised the option to pay tax on services on GTA in relation to transport of goods supplied by us during the Financial Year ${data.fy||'2025-26'} under forward charge. Yes`,
    mar, y, { maxWidth: pw-2*mar }); y += 10;

  // Line items
  const ic = [TW*0.07, TW*0.30, TW*0.13, TW*0.13, TW*0.17, TW*0.20];
  const itemRows: any[] = (data.items as any[]).map((item: any, i: number) => [
    String(i+1), item.description||'TRADE', item.unit||'TON', String(item.qty||''), '', inr(item.amount||0),
  ]);
  itemRows.push(['','Add:',`CGST@${data.cgst_pct}%`,'','',inr(data.cgst)]);
  itemRows.push(['','',`SGST@${data.sgst_pct}%`,'','',inr(data.sgst)]);
  itemRows.push(['','TOTAL VALUE OF INVOICE','','','',inr(data.total)]);

  autoTable(doc, {
    startY: y,
    head: [['Sl No','DESCRIPTION','UNIT','QTY','RATE','AMOUNT']],
    body: itemRows,
    theme:'grid',
    styles:{fontSize:7,cellPadding:2,textColor:[26,26,26],halign:'center'},
    headStyles:{fillColor:[26,26,26],textColor:[255,255,255],fontStyle:'bold'},
    columnStyles:{
      0:{cellWidth:14},1:{cellWidth:57,halign:'center'},2:{cellWidth:25},
      3:{cellWidth:25},4:{cellWidth:32},5:{cellWidth:37,halign:'right'},
    },
    didParseCell: (h) => {
      if (h.row.index === itemRows.length-1) {
        h.cell.styles.fillColor = [240,240,240];
        h.cell.styles.fontStyle = 'bold';
      }
    },
    margin:{left:mar,right:mar},
  });
  y = (doc as any).lastAutoTable.finalY;

  // Rupees
  autoTable(doc, {
    startY: y,
    body: [['RUPEES:',data.amount_in_words]],
    theme:'grid',
    styles:{fontSize:7,cellPadding:1.5,textColor:[26,26,26]},
    columnStyles:{0:{fontStyle:'bold',cellWidth:22},1:{}},
    margin:{left:mar,right:mar},
  });
  y = (doc as any).lastAutoTable.finalY + 3;

  // Bank
  const bank = data.bank;
  const bw1=75, bw2=47, bw3=65, brh=7;
  const bankRows = [
    ['BANK DETAILS :-','PLACE','For MLS ENTERPRISES'],
    [`BANK NAME : ${bank.name}`,'',''],
    [`BRANCH : ${bank.branch}`,'',''],
    [`ACCOUNT NAME : ${bank.acct_name}`,'',''],
    [`ACCOUNT NO : ${bank.acct_no}`,'',''],
    [`IFSC CODE : ${bank.ifsc}`,'','Authorised Signatory'],
  ];
  doc.setFillColor(240,240,240);
  doc.rect(mar, y, bw1+bw2+bw3, brh, 'F');
  bankRows.forEach((row, ri) => {
    doc.setDrawColor(150,150,150);
    doc.rect(mar,         y+ri*brh, bw1, brh);
    doc.rect(mar+bw1,     y+ri*brh, bw2, brh);
    doc.rect(mar+bw1+bw2, y+ri*brh, bw3, brh);
    doc.setFont('helvetica', ri===0 ? 'bold' : 'normal');
    doc.setFontSize(6.5); doc.setTextColor(26,26,26);
    doc.text(row[0], mar+2, y+ri*brh+4.5, { maxWidth:bw1-4 });
    if (ri===0) {
      doc.text(row[1], mar+bw1+bw2/2, y+ri*brh+4.5, { align:'center' });
      doc.setFont('helvetica','bold');
      doc.text(row[2], mar+bw1+bw2+bw3/2, y+ri*brh+4.5, { align:'center' });
    } else if (ri===5) {
      doc.setFont('helvetica','bold');
      doc.text('Authorised Signatory', mar+bw1+bw2+bw3/2, y+ri*brh+4.5, { align:'center' });
    }
  });
  doc.setFont('helvetica','normal'); doc.setFontSize(7);
  doc.text(data.place||'', mar+bw1+bw2/2, y+3*brh+4.5, { align:'center' });

  return doc.output('blob');
}

// used in invoice pdf table widths
const TW = 190 - 20; // A4 portrait usable width approx

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-[12px] font-medium text-white pointer-events-auto
          ${t.type==='success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {t.type==='success' ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={12}/></button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices]         = useState<Invoice[]>([]);
  const [settledTrips, setSettledTrips] = useState<SettledTrip[]>([]);
  const [loading, setLoading]           = useState(true);
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [activeTab, setActiveTab]       = useState(0);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage]                 = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedTrips, setSelectedTrips]     = useState<Set<string>>(new Set());

  // Generate invoice modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genInvoiceNo, setGenInvoiceNo] = useState('');
  const [genCgst, setGenCgst]           = useState('9');
  const [genSgst, setGenSgst]           = useState('9');
  const [genLoading, setGenLoading]     = useState(false);

  // Drawer PDF state
  const [pdfUrls, setPdfUrls] = useState<{
    summaryUrl: string | null;
    invoiceUrl: string | null;
    summaryBlob: Blob | null;
    invoiceBlob: Blob | null;
  } | null>(null);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch settled trips ────────────────────────────────────────────────────
  const fetchSettledTrips = useCallback(async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*, customers(name), vehicles(vehicle_no), drivers(name), suppliers(name)')
      .eq('status', 'Settled')
      .eq('deleted', false)
      .is('invoice_id', null) // only trips not yet invoiced
      .order('trip_date', { ascending: false });
    if (error) { toast('error', 'Failed to load trips: ' + error.message); return; }
    setSettledTrips((data || []).map((t: any) => ({
      ...t,
      customer_name: t.customers?.name      || '—',
      vehicle_no:    t.vehicles?.vehicle_no  || '—',
      driver_name:   t.drivers?.name         || '—',
      supplier_name: t.suppliers?.name       || '—',
    })));
  }, [toast]);

  // ── Fetch invoices ─────────────────────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(name)')
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) { toast('error', 'Failed: ' + error.message); setLoading(false); return; }
    setInvoices((data || []).map((inv: any) => ({
      ...inv,
      customer_name: inv.customers?.name || '—',
    })));
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchSettledTrips(); fetchInvoices(); }, [fetchSettledTrips, fetchInvoices]);

  // ── Auto invoice number ────────────────────────────────────────────────────
  const getNextInvoiceNo = async (): Promise<string> => {
    const { data } = await supabase.from('invoices').select('invoice_no');
    if (!data || data.length === 0) return 'INV001';
    const max = data.reduce((acc, r) => {
      const n = parseInt((r.invoice_no || 'INV000').replace(/\D/g,''), 10);
      return n > acc ? n : acc;
    }, 0);
    return `INV${String(max+1).padStart(3,'0')}`;
  };

  // ── Open generate modal ────────────────────────────────────────────────────
  const openGenModal = async () => {
    if (selectedTrips.size === 0) { toast('error', 'Select at least one trip'); return; }
    const nextNo = await getNextInvoiceNo();
    setGenInvoiceNo(nextNo);
    setGenCgst('9'); setGenSgst('9');
    setShowGenModal(true);
  };

  // ── Generate invoice + PDFs ────────────────────────────────────────────────
  const generateInvoiceAndPdfs = async () => {
    if (!genInvoiceNo.trim()) { toast('error', 'Invoice number required'); return; }
    setGenLoading(true);
    try {
      const tripsToInvoice = settledTrips.filter(t => selectedTrips.has(t.id));
      const totalFreight   = tripsToInvoice.reduce((s, t) => s + (t.freight_amount || 0), 0);
      const cgstAmt        = parseFloat(((totalFreight * parseFloat(genCgst)) / 100).toFixed(2));
      const sgstAmt        = parseFloat(((totalFreight * parseFloat(genSgst)) / 100).toFixed(2));
      const totalAmt       = parseFloat((totalFreight + cgstAmt + sgstAmt).toFixed(2));
      const customerId     = tripsToInvoice[0]?.customer_id || null;

      // 1. Create invoice
      const { data: inv, error: invErr } = await supabase
        .from('invoices')
        .insert({
          invoice_no:   genInvoiceNo.trim(),
          customer_id:  customerId,
          invoice_date: new Date().toISOString().split('T')[0],
          amount:       totalFreight,
          cgst_pct:     parseFloat(genCgst),
          sgst_pct:     parseFloat(genSgst),
          cgst_amount:  cgstAmt,
          sgst_amount:  sgstAmt,
          total_amount: totalAmt,
          status:       'Pending',
        })
        .select().single();
      if (invErr) throw new Error('Invoice creation failed: ' + invErr.message);

      // 2. Link trips via invoice_trips + save to invoice_ledger
      for (const trip of tripsToInvoice) {
        // Link via invoice_trips
        await supabase.from('invoice_trips').insert({ invoice_id: inv.id, trip_id: trip.id });

        // Save to invoice_ledger
        await supabase.from('invoice_ledger').insert({
          invoice_id:     inv.id,
          trip_id:        trip.id,
          trip_no:        trip.trip_no,
          trip_date:      trip.trip_date,
          do_no:          trip.do_no,
          shipment_no:    trip.shipment_no,
          destination:    trip.destination,
          truck_no:       trip.vehicle_no,
          total_tonnage:  trip.total_tonnage,
          rate:           trip.rate,
          freight_amount: trip.freight_amount,
        });

        // Mark trip as invoiced
        await supabase.from('trips')
          .update({ invoice_id: inv.id })
          .eq('id', trip.id);
      }

      // 3. Build PDF data
      const dates      = tripsToInvoice.map(t => t.trip_date).filter(Boolean).sort();
      const fromPeriod = dates.length > 0 ? fmtDot(dates[0])               : fmtDot(new Date().toISOString());
      const toPeriod   = dates.length > 0 ? fmtDot(dates[dates.length-1])  : fmtDot(new Date().toISOString());
      const totalQty   = tripsToInvoice.reduce((s, t) => s + (t.total_tonnage || 0), 0);

      const shared = {
        pan:          process.env.NEXT_PUBLIC_MLS_PAN          || 'BOMPG9617Q',
        gst:          process.env.NEXT_PUBLIC_MLS_GST          || '33BOMPG9617Q1Z8',
        phone:        process.env.NEXT_PUBLIC_MLS_PHONE        || '+91-9600647417',
        email:        process.env.NEXT_PUBLIC_MLS_EMAIL        || 'mlsgroup.enterprises@gmail.com',
        vendor_code:  process.env.NEXT_PUBLIC_MLS_VENDOR_CODE  || '1190787819',
        fy:           '2025-26',
        bill_no:      genInvoiceNo.trim(),
        bill_date:    fmtDot(new Date().toISOString()),
        bill_seq:     `I000-${genInvoiceNo.trim()}`,
        to_company:       process.env.NEXT_PUBLIC_CLIENT_COMPANY       || 'Dalmia Cement (Bharat)Ltd,',
        to_address:       process.env.NEXT_PUBLIC_CLIENT_ADDRESS        || 'Dalmiapuram-621651',
        to_gst:           process.env.NEXT_PUBLIC_CLIENT_GST            || '33AADCA9414C1Z6',
        to_company_short: process.env.NEXT_PUBLIC_CLIENT_COMPANY_SHORT  || 'DCBL FACTORY-DALMIAPURAM',
        from_period:  fromPeriod,
        to_period:    toPeriod,
        nature_of_work: 'CEMENT TRANSPORT TO VARIOUS DISTRICT FROM DCBL',
        hsn:          '996791',
        dist_channel: 'TRADE',
        cgst_pct:     parseFloat(genCgst),
        sgst_pct:     parseFloat(genSgst),
        cgst:         cgstAmt,
        sgst:         sgstAmt,
        total:        totalAmt,
        amount_in_words: toWords(totalAmt),
        annexure_words:  toWords(totalFreight),
        place: process.env.NEXT_PUBLIC_BANK_PLACE      || 'DALMIA PURAM',
        bank: {
          name:      process.env.NEXT_PUBLIC_BANK_NAME       || 'CANARA BANK',
          branch:    process.env.NEXT_PUBLIC_BANK_BRANCH     || 'SENDURAI',
          acct_name: process.env.NEXT_PUBLIC_BANK_ACCT_NAME  || 'MLS ENTERPRISES',
          acct_no:   process.env.NEXT_PUBLIC_BANK_ACCT_NO    || '125008926845',
          ifsc:      process.env.NEXT_PUBLIC_BANK_IFSC       || 'CNRB0001318',
        },
        items: [{ description:'TRADE', unit:'TON', qty:totalQty.toFixed(2), amount:totalFreight }],
        trips: tripsToInvoice.map(t => ({
          bill_date:   fmtSlash(t.trip_date),
          do_no:       t.do_no        || '',
          shipment_no: t.shipment_no  || '',
          ship_to:     t.destination  || '',
          destination: t.destination  || '',
          truck_no:    t.vehicle_no   || '',
          qty:         t.total_tonnage || 0,
          rate:        t.rate         || 0,
          amount:      t.freight_amount || 0,
          shortage:    0, remarks: '',
        })),
      };

      // 4. Generate PDFs
      const summaryBlob = generateSummaryPdf(shared);
      const invoiceBlob = generateInvoicePdf(shared);

      // 5. Upload to Supabase Storage
      const summaryPath = `invoices/${genInvoiceNo.trim()}_summary.pdf`;
      const invoicePath = `invoices/${genInvoiceNo.trim()}_invoice.pdf`;

      const toAB = (blob: Blob): Promise<ArrayBuffer> =>
        new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as ArrayBuffer); r.onerror = rej; r.readAsArrayBuffer(blob); });

      const [sAB, iAB] = await Promise.all([toAB(summaryBlob), toAB(invoiceBlob)]);
      const [sUp, iUp] = await Promise.all([
        supabase.storage.from(BUCKET).upload(summaryPath, sAB, { contentType:'application/pdf', upsert:true }),
        supabase.storage.from(BUCKET).upload(invoicePath, iAB, { contentType:'application/pdf', upsert:true }),
      ]);
      if (sUp.error) throw new Error('Summary upload failed: ' + sUp.error.message);
      if (iUp.error) throw new Error('Invoice upload failed: ' + iUp.error.message);

      // 6. Get signed URLs
      const [{ data: sumSigned }, { data: invSigned }] = await Promise.all([
        supabase.storage.from(BUCKET).createSignedUrl(summaryPath, 3600),
        supabase.storage.from(BUCKET).createSignedUrl(invoicePath, 3600),
      ]);

      // 7. Save PDF paths to invoice
      await supabase.from('invoices').update({
        summary_pdf: summaryPath,
        invoice_pdf: invoicePath,
      }).eq('id', inv.id);

      toast('success', `Invoice ${genInvoiceNo} created & PDFs generated!`);
      setSelectedTrips(new Set());
      setShowGenModal(false);
      await fetchSettledTrips();
      await fetchInvoices();
      setActiveTab(1);

    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setGenLoading(false);
    }
  };

  // ── Load PDF signed URLs for drawer ───────────────────────────────────────
  const loadPdfUrls = async (inv: Invoice) => {
    if (!inv.summary_pdf && !inv.invoice_pdf) { setPdfUrls(null); return; }
    setPdfLoading(true);
    try {
      const [{ data: s }, { data: i }] = await Promise.all([
        inv.summary_pdf ? supabase.storage.from(BUCKET).createSignedUrl(inv.summary_pdf, 3600) : Promise.resolve({ data: null }),
        inv.invoice_pdf ? supabase.storage.from(BUCKET).createSignedUrl(inv.invoice_pdf, 3600) : Promise.resolve({ data: null }),
      ]);
      setPdfUrls({
        summaryUrl:  s?.signedUrl || null,
        invoiceUrl:  i?.signedUrl || null,
        summaryBlob: null,
        invoiceBlob: null,
      });
    } catch (e) { setPdfUrls(null); }
    finally { setPdfLoading(false); }
  };

  // ── Payment actions ────────────────────────────────────────────────────────
  const markPaymentReceived = async (inv: Invoice) => {
    setActionLoading(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from('invoices')
      .update({ status:'PaymentReceived', payment_received_at:now, payment_received_amount:inv.amount })
      .eq('id', inv.id);
    if (error) toast('error', 'Failed: ' + error.message);
    else {
      toast('success', 'Payment marked as received');
      const updated = { ...inv, status:'PaymentReceived' as const, payment_received_at:now };
      setSelectedInvoice(updated);
      setInvoices(prev => prev.map(i => i.id===inv.id ? updated : i));
    }
    setActionLoading(false);
  };

  const markPaidOut = async (inv: Invoice) => {
    setActionLoading(true);
    const now     = new Date().toISOString();
    const paidAmt = inv.ownership==='Marker Truck' ? (inv.supplier_amount||0) : (inv.amount||0);
    const { error } = await supabase.from('invoices')
      .update({ status:'PaidOut', paid_out_at:now, paid_out_amount:paidAmt })
      .eq('id', inv.id);
    if (error) toast('error', 'Failed: ' + error.message);
    else {
      toast('success', 'Payment done!');
      const updated = { ...inv, status:'PaidOut' as const, paid_out_at:now, paid_out_amount:paidAmt };
      setSelectedInvoice(updated);
      setInvoices(prev => prev.map(i => i.id===inv.id ? updated : i));
    }
    setActionLoading(false);
  };

  // ── Filter & paginate ──────────────────────────────────────────────────────
  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (inv.invoice_no    ||'').toLowerCase().includes(q) ||
      (inv.customer_name ||'').toLowerCase().includes(q);
    return matchSearch && (statusFilter==='All' || inv.status===statusFilter);
  });
  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  const paginated  = filteredInvoices.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const stats = {
    total:       invoices.length,
    pending:     invoices.filter(i => i.status==='Pending').length,
    received:    invoices.filter(i => i.status==='PaymentReceived').length,
    paidOut:     invoices.filter(i => i.status==='PaidOut').length,
    totalAmount: invoices.reduce((s,i) => s+(i.amount||0), 0),
    outstanding: invoices.filter(i => i.status==='Pending').reduce((s,i) => s+(i.amount||0), 0),
  };
  const pieData = [
    { name:'Pending',          value:stats.pending,  color:'#f59e0b' },
    { name:'Payment Received', value:stats.received, color:'#3b82f6' },
    { name:'Paid Out',         value:stats.paidOut,  color:'#22c55e' },
  ].filter(d => d.value > 0);

  const fmtDate  = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const fmtMoney = (n: number | null | undefined) =>
    n != null ? `₹ ${Number(n).toLocaleString('en-IN')}` : '₹ 0';

  const toggleTrip = (id: string) =>
    setSelectedTrips(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelectedTrips(selectedTrips.size===settledTrips.length && settledTrips.length>0
      ? new Set() : new Set(settledTrips.map(t => t.id)));

  // computed totals for modal preview
  const selectedTripsList   = settledTrips.filter(t => selectedTrips.has(t.id));
  const selectedTotalFreight= selectedTripsList.reduce((s,t) => s+(t.freight_amount||0), 0);
  const previewCgst         = (selectedTotalFreight * (parseFloat(genCgst)||0)) / 100;
  const previewSgst         = (selectedTotalFreight * (parseFloat(genSgst)||0)) / 100;
  const previewTotal        = selectedTotalFreight + previewCgst + previewSgst;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast}/>
      <Topbar title="Invoices" breadcrumbs={[{ label:'Invoices' }]}/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label:'Total Invoices',   value:stats.total,                                     color:'text-blue-600',   sub:'All Time' },
            { label:'Pending',          value:stats.pending,                                    color:'text-yellow-600', sub:'Awaiting Payment' },
            { label:'Payment Received', value:stats.received,                                   color:'text-blue-600',   sub:'Customer Paid' },
            { label:'Paid Out',         value:stats.paidOut,                                    color:'text-green-600',  sub:'Fully Settled' },
            { label:'Total Billed',     value:`₹ ${(stats.totalAmount/100000).toFixed(1)}L`,   color:'text-blue-600',   sub:'Invoice Amount' },
            { label:'Outstanding',      value:`₹ ${(stats.outstanding/100000).toFixed(1)}L`,   color:'text-red-500',    sub:'Pending Payment' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[18px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm">

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4">
              {[
                { label:'Ready to Invoice', icon:<Clock size={12}/>,    badge:settledTrips.length },
                { label:'All Invoices',     icon:<FileText size={12}/>, badge:null },
              ].map((t, i) => (
                <button key={t.label}
                  onClick={() => { setActiveTab(i); setPage(1); setSearch(''); setStatusFilter('All'); }}
                  className={`py-3 px-4 text-[12px] font-medium border-b-2 transition-colors flex items-center gap-1.5
                    ${activeTab===i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t.icon}{t.label}
                  {t.badge!=null && t.badge>0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{t.badge}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">

              {/* Tab 0: Ready to Invoice */}
              {activeTab===0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] text-gray-400">
                      Select <span className="font-medium text-gray-600">Settled</span> trips — then click Generate Invoice
                    </p>
                    <button onClick={openGenModal}
                      disabled={selectedTrips.size===0}
                      className="flex items-center gap-1.5 bg-[#1a56db] text-white px-4 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40">
                      <FileText size={12}/>
                      Generate Invoice {selectedTrips.size>0 && `(${selectedTrips.size} trips)`}
                    </button>
                  </div>

                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                        <th className="px-2 py-2 w-8">
                          <input type="checkbox"
                            checked={selectedTrips.size===settledTrips.length && settledTrips.length>0}
                            onChange={toggleAll} className="rounded accent-blue-600"/>
                        </th>
                        {['Trip No','Date','Customer','Vehicle','Route','Freight','Tonnage','Est. Profit'].map(h => (
                          <th key={h} className="text-left px-2 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {settledTrips.length===0 ? (
                        <tr><td colSpan={9} className="text-center py-14 text-gray-300 text-[12px]">No settled trips ready for invoicing</td></tr>
                      ) : settledTrips.map(t => (
                        <tr key={t.id} onClick={() => toggleTrip(t.id)}
                          className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedTrips.has(t.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedTrips.has(t.id)} onChange={() => toggleTrip(t.id)} className="rounded accent-blue-600"/>
                          </td>
                          <td className="px-2 py-2.5 text-blue-600 font-medium">{t.trip_no}</td>
                          <td className="px-2 py-2.5 text-gray-500">{fmtDate(t.trip_date)}</td>
                          <td className="px-2 py-2.5 font-medium text-gray-700 max-w-[100px] truncate">{t.customer_name}</td>
                          <td className="px-2 py-2.5 text-gray-500">{t.vehicle_no}</td>
                          <td className="px-2 py-2.5 text-gray-500 max-w-[110px] truncate">{t.origin} → {t.destination}</td>
                          <td className="px-2 py-2.5 font-medium text-gray-700">{fmtMoney(t.freight_amount)}</td>
                          <td className="px-2 py-2.5 text-gray-500">{t.total_tonnage||0} T</td>
                          <td className={`px-2 py-2.5 font-medium ${(t.estimated_profit||0)>=0 ? 'text-green-600' : 'text-red-500'}`}>
                            {fmtMoney(t.estimated_profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Selected total preview */}
                  {selectedTrips.size > 0 && (
                    <div className="mt-3 bg-blue-50 rounded-lg px-4 py-2.5 flex items-center justify-between text-[12px]">
                      <span className="text-blue-600 font-medium">{selectedTrips.size} trip{selectedTrips.size>1?'s':''} selected</span>
                      <span className="text-blue-700 font-bold">Total Freight: {fmtMoney(selectedTotalFreight)}</span>
                    </div>
                  )}
                </>
              )}

              {/* Tab 1: All Invoices */}
              {activeTab===1 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search invoice, customer…"
                        className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-64 focus:outline-none focus:border-blue-400"/>
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none">
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="PaymentReceived">Payment Received</option>
                      <option value="PaidOut">Paid Out</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                      <Loader2 size={16} className="animate-spin"/> Loading invoices…
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                            {['Invoice No','Date','Customer','Base Amount','CGST','SGST','Total','Status'].map(h => (
                              <th key={h} className="text-left px-2 py-2 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.length===0 ? (
                            <tr><td colSpan={8} className="text-center py-14 text-gray-300 text-[12px]">No invoices found</td></tr>
                          ) : paginated.map(inv => (
                            <tr key={inv.id}
                              onClick={() => {
                                setSelectedInvoice(selectedInvoice?.id===inv.id ? null : inv);
                                setPdfUrls(null);
                                if (selectedInvoice?.id !== inv.id) loadPdfUrls(inv);
                              }}
                              className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedInvoice?.id===inv.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                              <td className="px-2 py-2.5 text-blue-600 font-medium">{inv.invoice_no}</td>
                              <td className="px-2 py-2.5 text-gray-500">{fmtDate(inv.invoice_date)}</td>
                              <td className="px-2 py-2.5 font-medium text-gray-700 max-w-[100px] truncate">{inv.customer_name}</td>
                              <td className="px-2 py-2.5 text-gray-700">{fmtMoney(inv.amount)}</td>
                              <td className="px-2 py-2.5 text-blue-600">{fmtMoney(inv.cgst_amount)}</td>
                              <td className="px-2 py-2.5 text-blue-600">{fmtMoney(inv.sgst_amount)}</td>
                              <td className="px-2 py-2.5 font-bold text-green-700">{fmtMoney(inv.total_amount)}</td>
                              <td className="px-2 py-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_CONFIG[inv.status]?.color||'bg-gray-100 text-gray-500'}`}>
                                  {STATUS_CONFIG[inv.status]?.label||inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {filteredInvoices.length>PAGE_SIZE && (
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-[11px] text-gray-400">
                            Showing {(page-1)*PAGE_SIZE+1} – {Math.min(page*PAGE_SIZE, filteredInvoices.length)} of {filteredInvoices.length}
                          </p>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                              <ChevronLeft size={12}/>
                            </button>
                            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                              <button key={p} onClick={() => setPage(p)}
                                className={`w-6 h-6 text-[10px] rounded ${p===page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {p}
                              </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                              <ChevronRight size={12}/>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Invoice Status</h3>
              {pieData.length>0 ? (
                <>
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value">
                        {pieData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/>
                        <span className="flex-1 text-gray-500">{d.name}</span>
                        <span className="font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-gray-300 text-center py-6">No invoices yet</p>
              )}
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Quick Filters</h3>
              <div className="space-y-1">
                {[
                  { key:'All',             label:'All Invoices',     count:invoices.length },
                  { key:'Pending',         label:'Pending',          count:stats.pending   },
                  { key:'PaymentReceived', label:'Payment Received', count:stats.received  },
                  { key:'PaidOut',         label:'Paid Out',         count:stats.paidOut   },
                ].map(s => (
                  <button key={s.key}
                    onClick={() => { setStatusFilter(s.key); setActiveTab(1); setPage(1); }}
                    className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors
                      ${statusFilter===s.key && activeTab===1 ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {s.label}
                    <span className="float-right text-[10px] text-gray-400">{s.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-96 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[14px] font-bold text-gray-800">Generate Invoice</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{selectedTrips.size} trip{selectedTrips.size>1?'s':''} selected</p>
              </div>
              <button onClick={() => setShowGenModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Invoice Number</label>
                <input value={genInvoiceNo} onChange={e => setGenInvoiceNo(e.target.value)}
                  className={inputCls} placeholder="e.g. DPM/MLS/26/56"/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">CGST %</label>
                  <input type="number" min="0" max="28" step="0.5" value={genCgst}
                    onChange={e => setGenCgst(e.target.value)} className={inputCls} placeholder="9"/>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">SGST %</label>
                  <input type="number" min="0" max="28" step="0.5" value={genSgst}
                    onChange={e => setGenSgst(e.target.value)} className={inputCls} placeholder="9"/>
                </div>
              </div>

              {/* Live preview */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-gray-500">
                  <span>Total Freight ({selectedTrips.size} trips)</span>
                  <span className="font-medium text-gray-700">₹ {selectedTotalFreight.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>CGST ({genCgst||0}%)</span>
                  <span className="font-medium text-blue-600">₹ {previewCgst.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>SGST ({genSgst||0}%)</span>
                  <span className="font-medium text-blue-600">₹ {previewSgst.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5">
                  <span className="font-semibold text-gray-700">Total Invoice Value</span>
                  <span className="font-bold text-green-700">₹ {previewTotal.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={generateInvoiceAndPdfs}
                disabled={genLoading || !genInvoiceNo.trim()}
                className="flex-1 bg-[#1a56db] text-white py-2.5 rounded-lg text-[12px] font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
                {genLoading
                  ? <><Loader2 size={13} className="animate-spin"/> Creating Invoice & PDFs…</>
                  : <><FileText size={13}/> Generate Invoice & PDFs</>
                }
              </button>
              <button onClick={() => setShowGenModal(false)} disabled={genLoading}
                className="px-4 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px] hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[380px] bg-white shadow-2xl border-l border-gray-100 z-40
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${selectedInvoice ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedInvoice && (
          <InvoiceDetailDrawer
            invoice={selectedInvoice}
            onClose={() => { setSelectedInvoice(null); setPdfUrls(null); }}
            onMarkReceived={markPaymentReceived}
            onMarkPaidOut={markPaidOut}
            actionLoading={actionLoading}
            pdfLoading={pdfLoading}
            pdfUrls={pdfUrls}
            fmtDate={fmtDate}
            fmtMoney={fmtMoney}
          />
        )}
      </div>
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/20 z-30" onClick={() => { setSelectedInvoice(null); setPdfUrls(null); }}/>
      )}
    </div>
  );
}

// ─── Invoice Detail Drawer ────────────────────────────────────────────────────
function InvoiceDetailDrawer({
  invoice, onClose, onMarkReceived, onMarkPaidOut,
  actionLoading, pdfLoading, pdfUrls, fmtDate, fmtMoney,
}: {
  invoice: Invoice;
  onClose: () => void;
  onMarkReceived: (inv: Invoice) => void;
  onMarkPaidOut: (inv: Invoice) => void;
  actionLoading: boolean;
  pdfLoading: boolean;
  pdfUrls: { summaryUrl: string|null; invoiceUrl: string|null; summaryBlob: Blob|null; invoiceBlob: Blob|null } | null;
  fmtDate: (s: string | null | undefined) => string;
  fmtMoney: (n: number | null | undefined) => string;
}) {
  const stepIdx = invoice.status==='Pending' ? 0 : invoice.status==='PaymentReceived' ? 1 : 2;
  const steps   = [
    { label:'Invoice Sent',     desc:'Waiting for customer payment' },
    { label:'Payment Received', desc:`Customer paid ${fmtMoney(invoice.amount)}` },
    { label:'Paid Out',         desc:'Supplier/Driver paid' },
  ];

  const openUrl = (url: string) => window.open(url, '_blank');
  const dlUrl   = (url: string, name: string) => {
    const a = document.createElement('a'); a.href=url; a.download=name; a.click();
  };

  const hasPdfs = !!(invoice.summary_pdf || invoice.invoice_pdf);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#1a56db] text-white flex-shrink-0">
        <div>
          <p className="text-[15px] font-bold">{invoice.invoice_no}</p>
          <p className="text-[11px] opacity-80 mt-0.5">{invoice.customer_name}</p>
        </div>
        <button onClick={onClose} className="opacity-80 hover:opacity-100"><X size={16}/></button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Stepper */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => {
              const done=i<stepIdx, active=i===stepIdx, pending=i>stepIdx;
              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${done?'bg-green-500':active?'bg-blue-600':'bg-gray-200'}`}>
                    {done ? <CheckCheck size={11} className="text-white"/> : <span className="text-[10px] font-bold text-white">{i+1}</span>}
                  </div>
                  <div className={pending?'opacity-40':''}>
                    <p className={`text-[12px] font-semibold ${active?'text-blue-700':done?'text-green-700':'text-gray-500'}`}>{step.label}</p>
                    <p className="text-[11px] text-gray-400">{step.desc}</p>
                    {done && i===0 && invoice.payment_received_at && (
                      <p className="text-[10px] text-green-600 mt-0.5">on {fmtDate(invoice.payment_received_at)}</p>
                    )}
                    {done && i===1 && invoice.paid_out_at && (
                      <p className="text-[10px] text-green-600 mt-0.5">{fmtMoney(invoice.paid_out_amount)} on {fmtDate(invoice.paid_out_at)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financials */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Invoice Summary</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Freight</span>
              <span className="font-semibold text-gray-700">{fmtMoney(invoice.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">CGST ({invoice.cgst_pct||0}%)</span>
              <span className="font-semibold text-blue-600">{fmtMoney(invoice.cgst_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">SGST ({invoice.sgst_pct||0}%)</span>
              <span className="font-semibold text-blue-600">{fmtMoney(invoice.sgst_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-bold text-gray-700">Total Invoice Value</span>
              <span className="font-bold text-green-700">{fmtMoney(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* PDF Buttons */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Documents</p>
          {pdfLoading ? (
            <div className="flex items-center justify-center py-4 gap-2 text-gray-400">
              <Loader2 size={14} className="animate-spin"/> Loading PDF links…
            </div>
          ) : hasPdfs && pdfUrls ? (
            <div className="space-y-2">
              {/* Summary PDF */}
              <div className="border border-gray-100 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <FileText size={12} className="text-purple-500"/> Summary PDF (Annexure)
                </p>
                <div className="flex gap-2">
                  <button onClick={() => pdfUrls.summaryUrl && openUrl(pdfUrls.summaryUrl)}
                    disabled={!pdfUrls.summaryUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-purple-200 text-purple-600 py-1.5 rounded-lg text-[11px] font-medium hover:bg-purple-50 disabled:opacity-40">
                    <ExternalLink size={11}/> View
                  </button>
                  <button onClick={() => pdfUrls.summaryUrl && dlUrl(pdfUrls.summaryUrl, `${invoice.invoice_no}_summary.pdf`)}
                    disabled={!pdfUrls.summaryUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 text-white py-1.5 rounded-lg text-[11px] font-medium hover:bg-purple-700 disabled:opacity-40">
                    <Download size={11}/> Download
                  </button>
                </div>
              </div>

              {/* Invoice PDF */}
              <div className="border border-gray-100 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <FileText size={12} className="text-blue-500"/> Invoice PDF (Tax Invoice)
                </p>
                <div className="flex gap-2">
                  <button onClick={() => pdfUrls.invoiceUrl && openUrl(pdfUrls.invoiceUrl)}
                    disabled={!pdfUrls.invoiceUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-blue-200 text-blue-600 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-50 disabled:opacity-40">
                    <ExternalLink size={11}/> View
                  </button>
                  <button onClick={() => pdfUrls.invoiceUrl && dlUrl(pdfUrls.invoiceUrl, `${invoice.invoice_no}_invoice.pdf`)}
                    disabled={!pdfUrls.invoiceUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700 disabled:opacity-40">
                    <Download size={11}/> Download
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 text-center py-3">No PDFs generated yet</p>
          )}
        </div>
      </div>

      {/* Footer — payment actions */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
        {invoice.status==='Pending' && (
          <button onClick={() => onMarkReceived(invoice)} disabled={actionLoading}
            className="w-full py-2.5 bg-[#1a56db] text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {actionLoading ? <Loader2 size={14} className="animate-spin"/> : <CreditCard size={14}/>}
            Mark Payment Received
          </button>
        )}
        {invoice.status==='PaymentReceived' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 size={13}/>
              Payment received on {fmtDate(invoice.payment_received_at)}
            </div>
            <button onClick={() => onMarkPaidOut(invoice)} disabled={actionLoading}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg text-[13px] font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {actionLoading ? <Loader2 size={14} className="animate-spin"/> : <Wallet size={14}/>}
              Tap to Pay
            </button>
          </div>
        )}
        {invoice.status==='PaidOut' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 size={13}/>
              Payment received on {fmtDate(invoice.payment_received_at)}
            </div>
            <div className="w-full py-2.5 bg-green-100 text-green-800 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2">
              <CheckCheck size={15}/> Payment Done · {fmtMoney(invoice.paid_out_amount)}
            </div>
            {invoice.paid_out_at && (
              <p className="text-[10px] text-gray-400 text-center">on {fmtDate(invoice.paid_out_at)}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}