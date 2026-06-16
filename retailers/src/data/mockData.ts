import type { Medicine, Order } from "../types";

export const medicines: Medicine[] = [
  { id: "1", name: "Amoxicillin 500mg Capsules", genericName: "Amoxicillin", manufacturer: "Cipla", category: "Antibiotics", sku: "AMX-500-100CP", pack: "10 x 10 Capsules", price: 210, mrp: 260, stock: 840, batch: "AMX-B2406", expiry: "Mar 2027", gst: 12, margin: 19, alternatives: ["5", "8"], status: "In Stock" },
  { id: "2", name: "Metformin Hydrochloride 1000mg", genericName: "Metformin", manufacturer: "Sun Pharma", category: "Diabetes Care", sku: "MET-1K-50BT", pack: "50 Tablets", price: 190, mrp: 235, stock: 460, batch: "MET-B7782", expiry: "Jan 2028", gst: 12, margin: 19, alternatives: ["10"], status: "In Stock" },
  { id: "3", name: "Atorvastatin 20mg Tablets", genericName: "Atorvastatin", manufacturer: "Dr. Reddy's", category: "Cardiac", sku: "ATO-20-30PK", pack: "30 Tablets", price: 145, mrp: 185, stock: 92, batch: "ATO-B1841", expiry: "Sep 2026", gst: 12, margin: 22, alternatives: ["9", "13"], status: "Limited" },
  { id: "4", name: "Pantoprazole 40mg Tablets", genericName: "Pantoprazole", manufacturer: "Lupin", category: "Gastro", sku: "PAN-40-15ST", pack: "15 Tablets", price: 116, mrp: 150, stock: 0, batch: "PAN-B9912", expiry: "Jul 2026", gst: 12, margin: 23, alternatives: ["12"], status: "Out" },
  { id: "5", name: "Azithromycin 500mg Tablets", genericName: "Azithromycin", manufacturer: "Cipla", category: "Antibiotics", sku: "AZI-500-3TB", pack: "3 Tablets", price: 128, mrp: 160, stock: 236, batch: "AZI-B5501", expiry: "Dec 2027", gst: 12, margin: 20, alternatives: ["1", "8"], status: "In Stock" },
  { id: "6", name: "Telmisartan 40mg Tablets", genericName: "Telmisartan", manufacturer: "Glenmark", category: "Cardiac", sku: "TEL-40-30PK", pack: "30 Tablets", price: 175, mrp: 220, stock: 64, batch: "TEL-B4502", expiry: "Aug 2026", gst: 12, margin: 20, alternatives: ["9", "13"], status: "Limited" },
  { id: "7", name: "Paracetamol 650mg Tablets", genericName: "Paracetamol", manufacturer: "Micro Labs", category: "Pain Management", sku: "PCM-650-15TB", pack: "15 Tablets", price: 38, mrp: 48, stock: 1280, batch: "PCM-B8804", expiry: "Apr 2028", gst: 12, margin: 21, alternatives: ["14"], status: "In Stock" },
  { id: "8", name: "Cefixime 200mg Tablets", genericName: "Cefixime", manufacturer: "Alkem", category: "Antibiotics", sku: "CEF-200-10TB", pack: "10 Tablets", price: 142, mrp: 176, stock: 320, batch: "CEF-B7281", expiry: "Nov 2027", gst: 12, margin: 19, alternatives: ["1", "5"], status: "In Stock" },
  { id: "9", name: "Amlodipine 5mg Tablets", genericName: "Amlodipine", manufacturer: "Torrent", category: "Cardiac", sku: "AML-5-30PK", pack: "30 Tablets", price: 54, mrp: 72, stock: 760, batch: "AML-B2205", expiry: "Feb 2028", gst: 12, margin: 25, alternatives: ["3", "6", "13"], status: "In Stock" },
  { id: "10", name: "Glimepiride 2mg Tablets", genericName: "Glimepiride", manufacturer: "USV", category: "Diabetes Care", sku: "GLI-2-30PK", pack: "30 Tablets", price: 96, mrp: 126, stock: 118, batch: "GLI-B9034", expiry: "Oct 2027", gst: 12, margin: 24, alternatives: ["2"], status: "Limited" },
  { id: "11", name: "Cetirizine 10mg Tablets", genericName: "Cetirizine", manufacturer: "Mankind", category: "Allergy Care", sku: "CET-10-10TB", pack: "10 Tablets", price: 24, mrp: 32, stock: 980, batch: "CET-B1170", expiry: "May 2028", gst: 12, margin: 25, alternatives: [], status: "In Stock" },
  { id: "12", name: "Omeprazole 20mg Capsules", genericName: "Omeprazole", manufacturer: "Dr. Reddy's", category: "Gastro", sku: "OME-20-15CP", pack: "15 Capsules", price: 72, mrp: 95, stock: 430, batch: "OME-B2928", expiry: "Jun 2028", gst: 12, margin: 24, alternatives: ["4"], status: "In Stock" },
  { id: "13", name: "Losartan 50mg Tablets", genericName: "Losartan", manufacturer: "Cipla", category: "Cardiac", sku: "LOS-50-30PK", pack: "30 Tablets", price: 138, mrp: 174, stock: 210, batch: "LOS-B7651", expiry: "Sep 2027", gst: 12, margin: 21, alternatives: ["3", "6", "9"], status: "In Stock" },
  { id: "14", name: "Dolo Cold Suspension", genericName: "Paracetamol Phenylephrine", manufacturer: "Micro Labs", category: "Pain Management", sku: "DCS-60ML-BT", pack: "60ml Bottle", price: 88, mrp: 110, stock: 54, batch: "DCS-B3390", expiry: "Dec 2026", gst: 12, margin: 20, alternatives: ["7"], status: "Limited" },
];

export const cart = [
  { name: "Amoxicillin 500mg Capsules", sku: "AMX-500-100CP", qty: "20 Packs", amount: 4200, status: "In Stock" },
  { name: "Metformin Hydrochloride 1000mg", sku: "MET-1K-50BT", qty: "15 Bottles", amount: 2850, status: "In Stock" },
  { name: "Atorvastatin 20mg Tablets", sku: "ATO-20-30PK", qty: "8 Packs", amount: 1160, status: "Limited" },
  { name: "Azithromycin 500mg Tablets", sku: "AZI-500-3TB", qty: "12 Strips", amount: 1536, status: "In Stock" },
];

export const orders: Order[] = [
  { id: "SDD-10482", date: "12 Jun 2026", items: 24, value: 9746, status: "Processing" },
  { id: "SDD-10421", date: "09 Jun 2026", items: 18, value: 18420, status: "Dispatched" },
  { id: "SDD-10377", date: "02 Jun 2026", items: 31, value: 27690, status: "Delivered" },
  { id: "SDD-10309", date: "28 May 2026", items: 14, value: 8940, status: "Delivered" },
];

export const categories = ["Antibiotics", "Cardiac", "Diabetes Care", "Gastro", "Pain Management", "Allergy Care"];
export const manufacturers = ["Cipla", "Sun Pharma", "Dr. Reddy's", "Lupin", "Glenmark", "Micro Labs", "Alkem", "Torrent", "USV", "Mankind"];

export const deliveryAddresses = [
  {
    id: "primary",
    label: "Main Shop",
    name: "CarePlus Medicals",
    address: "12th Main Road, Indiranagar, Bengaluru 560038",
  },
  {
    id: "branch",
    label: "Branch Shop",
    name: "CarePlus Medicals - Branch",
    address: "Near City Hospital, Domlur, Bengaluru 560071",
  },
];
