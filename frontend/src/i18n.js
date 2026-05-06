import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard', inward: 'Inward', outward: 'Outward', stock: 'Stock',
      reports: 'Reports', settings: 'Settings', login: 'Login', logout: 'Logout',
      totalStock: 'Total Stock', availableCapacity: 'Available Capacity',
      todayInward: 'Today Inward', todayOutward: 'Today Outward', totalRevenue: 'Total Revenue',
      farmerName: 'Farmer Name', phone: 'Phone Number', productType: 'Product Type',
      quantity: 'Quantity (kg)', storageType: 'Storage Type', date: 'Date',
      expectedDuration: 'Expected Duration (days)', submit: 'Submit', cancel: 'Cancel',
      cold: 'Cold', frozen: 'Frozen', active: 'Active', completed: 'Completed',
      remainingDays: 'Remaining Days', actions: 'Actions', generateInvoice: 'Generate Invoice',
      removeStock: 'Remove Stock', qtyToRemove: 'Quantity to Remove',
      alerts: 'Alerts', noAlerts: 'No alerts', capacity: 'Capacity',
      ratePerKgDay: 'Rate (₹/kg/day)', save: 'Save', addUser: 'Add User',
      name: 'Name', email: 'Email', password: 'Password', role: 'Role',
      admin: 'Admin', staff: 'Staff', filter: 'Filter', search: 'Search',
      exportPdf: 'Export PDF', exportExcel: 'Export Excel', monthlyRevenue: 'Monthly Revenue',
      mostStored: 'Most Stored Product', storageUsage: 'Storage Usage',
      productWiseStock: 'Product-wise Stock', dailyInOut: 'Daily Inward vs Outward',
      welcome: 'Welcome', temperatureMonitor: 'Temperature Monitor', iotPlaceholder: 'IoT data will appear here',
      image: 'Image (optional)', qrCode: 'QR Code', viewQR: 'View QR',
      stockNearExpiry: 'Stock nearing expiry', storageDurationExceeded: 'Storage duration exceeded',
      invoice: 'Invoice', billing: 'Billing', cost: 'Cost', days: 'Days',
      all: 'All', noData: 'No data available'
    }
  },
  te: {
    translation: {
      dashboard: 'డాష్‌బోర్డ్', inward: 'లోపలికి', outward: 'బయటకు', stock: 'స్టాక్',
      reports: 'నివేదికలు', settings: 'సెట్టింగ్‌లు', login: 'లాగిన్', logout: 'లాగ్ అవుట్',
      totalStock: 'మొత్తం స్టాక్', availableCapacity: 'అందుబాటులో ఉన్న సామర్థ్యం',
      todayInward: 'ఈరోజు లోపలికి', todayOutward: 'ఈరోజు బయటకు', totalRevenue: 'మొత్తం ఆదాయం',
      farmerName: 'రైతు పేరు', phone: 'ఫోన్ నంబర్', productType: 'ఉత్పత్తి రకం',
      quantity: 'పరిమాణం (కేజీ)', storageType: 'నిల్వ రకం', date: 'తేదీ',
      expectedDuration: 'ఆశించిన వ్యవధి (రోజులు)', submit: 'సమర్పించు', cancel: 'రద్దు',
      cold: 'చల్లని', frozen: 'ఘనీభవించిన', active: 'యాక్టివ్', completed: 'పూర్తయింది',
      remainingDays: 'మిగిలిన రోజులు', actions: 'చర్యలు', generateInvoice: 'ఇన్‌వాయిస్ రూపొందించు',
      removeStock: 'స్టాక్ తీయండి', qtyToRemove: 'తీయవలసిన పరిమాణం',
      alerts: 'హెచ్చరికలు', noAlerts: 'హెచ్చరికలు లేవు', capacity: 'సామర్థ్యం',
      ratePerKgDay: 'రేటు (₹/కేజీ/రోజు)', save: 'సేవ్', addUser: 'వినియోగదారుని జోడించు',
      name: 'పేరు', email: 'ఈమెయిల్', password: 'పాస్‌వర్డ్', role: 'పాత్ర',
      admin: 'అడ్మిన్', staff: 'సిబ్బంది', filter: 'ఫిల్టర్', search: 'వెతుకు',
      exportPdf: 'PDF ఎగుమతి', exportExcel: 'Excel ఎగుమతి', monthlyRevenue: 'నెలవారీ ఆదాయం',
      mostStored: 'అత్యధికంగా నిల్వ చేసిన', storageUsage: 'నిల్వ వినియోగం',
      productWiseStock: 'ఉత్పత్తి వారీ స్టాక్', dailyInOut: 'రోజువారీ లోపలికి vs బయటకు',
      welcome: 'స్వాగతం', temperatureMonitor: 'ఉష్ణోగ్రత మానిటర్', iotPlaceholder: 'IoT డేటా ఇక్కడ కనిపిస్తుంది',
      image: 'చిత్రం (ఐచ్ఛికం)', qrCode: 'QR కోడ్', viewQR: 'QR చూడండి',
      stockNearExpiry: 'స్టాక్ గడువు ముగుస్తోంది', storageDurationExceeded: 'నిల్వ వ్యవధి దాటింది',
      invoice: 'ఇన్‌వాయిస్', billing: 'బిల్లింగ్', cost: 'ఖర్చు', days: 'రోజులు',
      all: 'అన్నీ', noData: 'డేటా అందుబాటులో లేదు'
    }
  }
}

i18n.use(initReactI18next).init({
  resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false }
})

export default i18n
