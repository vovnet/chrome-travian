import { ReportData } from "./utils";

const DB_NAME = "travianReportsDB";
const DB_VERSION = 2;
const STORE_NAME = "reports";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      } else {
        const store = request.transaction!.objectStore(STORE_NAME);
        if (!store.indexNames.contains("timestamp")) {
          store.createIndex("timestamp", "timestamp");
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveReports(reports: ReportData[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const report of reports) {
    store.put(report); // put перезапишет существующий id
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllReports(): Promise<ReportData[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as ReportData[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getLastReport(): Promise<ReportData | undefined> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.openCursor(null, "prev"); // от больших к меньшим id
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        resolve(cursor.value as ReportData);
      } else {
        resolve(undefined);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getReportsByTimestamp(minTimestamp: number): Promise<ReportData[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index("timestamp");

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.lowerBound(minTimestamp));
    request.onsuccess = () => resolve(request.result as ReportData[]);
    request.onerror = () => reject(request.error);
  });
}

// Удобные функции для графиков
export function getReportsLastHour(): Promise<ReportData[]> {
  return getReportsByTimestamp(Date.now() - 3600 * 1000);
}

export function getReportsLastDay(): Promise<ReportData[]> {
  return getReportsByTimestamp(Date.now() - 24 * 3600 * 1000);
}

export function getReportsLastWeek(): Promise<ReportData[]> {
  return getReportsByTimestamp(Date.now() - 7 * 24 * 3600 * 1000);
}
