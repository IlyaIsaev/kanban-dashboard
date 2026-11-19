// Reatom opens a BroadcastChannel at import time. Node keeps that MessagePort
// open, so Jest would otherwise hang after the suite finishes.
globalThis.BroadcastChannel = undefined;
