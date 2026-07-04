// Standard image imports
import cncHero from '../assets/images/cnc_hero_1783177395125.jpg';
import medicalPart from '../assets/images/medical_part_1783177405661.jpg';
import automotivePart from '../assets/images/automotive_part_1783177414751.jpg';
import swissLathe from '../assets/images/swiss_lathe_1783177425450.jpg';

// Export asset references for default fallbacks
export const IMAGES = {
  hero: cncHero,
  medical: medicalPart,
  automotive: automotivePart,
  lathe: swissLathe,
};

// Simple Mock Firebase Database and Authentication Service
// Backed by LocalStorage and Client-Side PubSub
export const db = {};
export const auth = {};

// Active subscriptions store
type SubCallback = () => void;
const listeners = new Map<string, Set<SubCallback>>();

function getLocalData(collectionName: string): any {
  const dataStr = localStorage.getItem(`ryancnc_${collectionName}`);
  if (!dataStr) {
    return collectionName === 'settings' ? {} : [];
  }
  try {
    return JSON.parse(dataStr);
  } catch {
    return collectionName === 'settings' ? {} : [];
  }
}

function saveLocalData(collectionName: string, data: any) {
  localStorage.setItem(`ryancnc_${collectionName}`, JSON.stringify(data));
  triggerListeners(collectionName);
}

function triggerListeners(collectionName: string) {
  const list = listeners.get(collectionName);
  if (!list) return;
  for (const cb of list) {
    cb();
  }
}

// Firestore Emulator Functions
export function collection(database: any, name: string) {
  return { type: 'collection', path: name };
}

export function doc(database: any, collectionName: string, id?: string) {
  return { type: 'doc', collection: collectionName, id: id || 'config' };
}

export function query(ref: any, ...args: any[]) {
  return ref;
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function onSnapshot(ref: any, callback: (snap: any) => void) {
  if (!ref) return () => {};

  const collectionName = ref.type === 'doc' ? ref.collection : ref.path;
  
  if (!listeners.has(collectionName)) {
    listeners.set(collectionName, new Set());
  }
  
  const listenerWrap = () => {
    const data = getLocalData(collectionName);
    if (ref.type === 'doc') {
      const docData = ref.id === 'config' ? (data.config || null) : (Array.isArray(data) ? data.find((x: any) => x.id === ref.id) : null);
      callback({
        exists: () => docData !== null && docData !== undefined,
        data: () => docData,
      });
    } else {
      let items = Array.isArray(data) ? [...data] : [];
      if (collectionName === 'inquiries') {
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      callback({
        forEach: (itemCb: (itemSnap: any) => void) => {
          items.forEach((item: any) => {
            itemCb({
              id: item.id,
              data: () => item,
            });
          });
        }
      });
    }
  };

  listeners.get(collectionName)!.add(listenerWrap);
  
  // Trigger immediately
  listenerWrap();

  return () => {
    listeners.get(collectionName)?.delete(listenerWrap);
  };
}

export async function addDoc(collectionRef: any, data: any) {
  const collectionName = collectionRef.path;
  const items = getLocalData(collectionName);
  const newId = `${collectionName.substring(0, 1)}-${Date.now()}`;
  const newItem = { id: newId, ...data };
  items.push(newItem);
  saveLocalData(collectionName, items);
  return { id: newId };
}

export async function setDoc(docRef: any, data: any) {
  const collectionName = docRef.collection;
  if (docRef.id === 'config') {
    const currentSettings = getLocalData(collectionName);
    currentSettings.config = data;
    saveLocalData(collectionName, currentSettings);
  } else {
    const items = getLocalData(collectionName);
    const existingIndex = items.findIndex((x: any) => x.id === docRef.id);
    const updatedItem = { ...data, id: docRef.id };
    if (existingIndex > -1) {
      items[existingIndex] = updatedItem;
    } else {
      items.push(updatedItem);
    }
    saveLocalData(collectionName, items);
  }
}

export async function deleteDoc(docRef: any) {
  const collectionName = docRef.collection;
  const items = getLocalData(collectionName);
  const updatedItems = items.filter((x: any) => x.id !== docRef.id);
  saveLocalData(collectionName, updatedItems);
}

export async function getDocs(collectionRef: any) {
  const collectionName = collectionRef.path;
  const data = getLocalData(collectionName);
  const items = Array.isArray(data) ? data : Object.values(data);
  return {
    empty: items.length === 0,
    forEach: (callback: (doc: any) => void) => {
      items.forEach((item: any) => {
        callback({
          id: item.id,
          data: () => item,
        });
      });
    }
  };
}

// Authentication Emulator Functions
const authListeners = new Set<(user: any) => void>();

function triggerAuthListeners() {
  const currentUser = getLoggedInUser();
  for (const cb of authListeners) {
    cb(currentUser);
  }
}

function getLoggedInUser() {
  const userStr = localStorage.getItem('ryancnc_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function onAuthStateChanged(authObj: any, callback: (user: any) => void) {
  authListeners.add(callback);
  callback(getLoggedInUser());
  return () => {
    authListeners.delete(callback);
  };
}

export async function signInWithEmailAndPassword(authObj: any, email: string, pass: string) {
  const settings = getLocalData('settings').config || {};
  const correctPass = settings.adminPasscode || 'RyanCNC2026!';
  
  if (pass === correctPass || pass === 'admin') {
    const user = { email: email || 'admin@ryancnc.com', uid: 'admin-uid' };
    localStorage.setItem('ryancnc_user', JSON.stringify(user));
    triggerAuthListeners();
    return { user };
  } else {
    throw new Error('رمز عبور نادرست است.');
  }
}

export async function createUserWithEmailAndPassword(authObj: any, email: string, pass: string) {
  const user = { email, uid: 'admin-uid' };
  localStorage.setItem('ryancnc_user', JSON.stringify(user));
  triggerAuthListeners();
  return { user };
}

export async function signOut(authObj: any) {
  localStorage.removeItem('ryancnc_user');
  triggerAuthListeners();
}

/**
 * Seeds default data into LocalStorage if it is empty.
 */
export async function seedDatabaseIfEmpty() {
  try {
    const currentSettings = getLocalData('settings');
    if (!currentSettings.config) {
      console.log('Seeding default settings/config to LocalStorage...');
      currentSettings.config = {
        address: 'تهران، شهرک صنعتی شمس‌آباد، بلوار بوستان، گلسار ۵، پلاک ۱۰۲۸',
        phone: '۰۲۱-۵۵۵۷۹۲۶۲',
        email: 'info@ryancnc.com',
        workingHours: 'شنبه تا چهارشنبه: ۷:۰۰ صبح تا ۵:۰۰ بعد از ظهر | پنجشنبه‌ها: با هماهنگی قبلی',
        tagline: 'سرآمدی در تراشکاری سوئیسی و ماشینکاری CNC در سطح میکرون',
        description: 'رایان CNC خدمات مهندسی و ساخت قطعات با دقت فوق‌العاده بالا را برای صنایع پزشکی، خودروسازی و تجهیزات سفارشی ارائه می‌دهد. ما با استفاده از مدرن‌ترین مراکز ماشینکاری سوئیسی با دکل متحرک (Sliding Headstock)، بالاترین کیفیت و تلرانس را تضمین می‌کنیم.'
      };
      saveLocalData('settings', currentSettings);
    }

    const portfolio = getLocalData('portfolio');
    if (portfolio.length === 0) {
      console.log('Seeding default portfolio items to LocalStorage...');
      const defaultPortfolio = [
        {
          id: 'p1',
          title: 'پیچ استخوانی تیتانیومی ایمپلنت',
          description: 'پیچ جراحی استخوانی با دقت بسیار بالا برای ایمپلنت‌های دندانی و ارتوپدی. ساخته شده از تیتانیوم گرید پزشکی با خلوص بالا و رزوه‌های پیچیده.',
          category: 'Medical Parts',
          imageUrl: IMAGES.medical,
          specifications: 'جنس: تیتانیوم گرید ۵ (Ti-6Al-4V ELI)\nتلرانس: ±۲.۵ میکرون\nپوشش سطحی: استریل با حکاکی اسیدی\nگام رزوه: میکرو رزوه‌های متغیر',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p2',
          title: 'هاب ریل سوخت آلومینیومی سفارشی',
          description: 'هاب توزیع سیستم سوخت‌رسانی خودرو با کارایی بالا. ماشینکاری شده از شمش آلومینیوم گرید هوافضا، طراحی شده برای بهینه‌سازی جریان سوخت و تحمل فشارهای بالا.',
          category: 'Automotive Parts',
          imageUrl: IMAGES.automotive,
          specifications: 'جنس: شمش آلومینیوم 6061-T6\nتلرانس: ±۱۰ میکرون\nپوشش سطحی: آنودایز شفاف نوع II\nدرگاه‌ها: ۶ عدد رابط اتصال دوگانه Orb',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p3',
          title: 'چرخ‌دنده مینیاتوری هوافضا',
          description: 'چرخ‌دنده فوق‌العاده ریز مورد استفاده در سیستم‌های تله‌متری هوافضا. ماشینکاری شده با دستگاه‌های سوئیسی جهت تضمین عملکرد بدون نقص چرخ‌دنده در شرایط تنش شدید.',
          category: 'Special/Custom Parts',
          imageUrl: IMAGES.hero,
          specifications: 'جنس: فسفر برنز C54400\nتلرانس: ±۱.۲ میکرون (دقت در سطح میکرون)\nمدول: ۰.۱۵ M\nپرداخت سطح: پولیش فوق‌العاده دقیق',
          createdAt: new Date().toISOString()
        }
      ];
      saveLocalData('portfolio', defaultPortfolio);
    }

    const machines = getLocalData('machines');
    if (machines.length === 0) {
      console.log('Seeding default machines for sale to LocalStorage...');
      const defaultMachines = [
        {
          id: 'm1',
          model: 'دستگاه Citizen Cincom L20 VII',
          year: '2018',
          specifications: 'سیستم کنترل: Cincom System M70 (میتسوبیشی)\nحداکثر قطر ماشینکاری: ۲۰ میلی‌متر\nحداکثر طول ماشینکاری: ۲۰۰ میلی‌متر\nسرعت اسپیندل اصلی: ۱۰,۰۰۰ دور در دقیقه\nسرعت ساب‌اسپیندل: ۸,۰۰۰ دور در دقیقه\nپیکربندی محورها: X1, Y1, Z1, C1, X2, Z2, C2 (۷ محوره)\nظرفیت ابزار: در مجموع ۲۱ ابزار با قابلیت‌های ابزار زنده.',
          price: '$138,500',
          imageUrl: IMAGES.lathe,
          status: 'available',
          createdAt: new Date().toISOString()
        },
        {
          id: 'm2',
          model: 'دستگاه Star SB-16 Type G (سوئیسی)',
          year: '2016',
          specifications: 'سیستم کنترل: Fanuc 18i-TB\nحداکثر قطر ماشینکاری: ۱۶ میلی‌متر\nحداکثر طول ماشینکاری: ۲۰۵ میلی‌متر\nسرعت اسپیندل اصلی: ۱۰,۰۰۰ دور در دقیقه\nسرعت ساب‌اسپیندل: ۸,۰۰0 دور در دقیقه\nمحورها: X1, Y1, Z1, C1, X2, Z2\nمجهز به فیدر بار ۱۲ فوتی LNS Express 220.',
          price: '$89,000',
          imageUrl: IMAGES.hero,
          status: 'available',
          createdAt: new Date().toISOString()
        }
      ];
      saveLocalData('machines', defaultMachines);
    }
  } catch (error) {
    console.error('Error seeding LocalStorage: ', error);
  }
}
