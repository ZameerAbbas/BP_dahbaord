
import { db } from './firebase';
import { ref, get, update, remove, onValue, set, push, query, limitToLast, off } from 'firebase/database';
import { subscribeToPath, transformOrders, transformUsers } from './lib/sharedCache';

export interface OrderType {
  id: string;
  uid: string;
  accountNumber: string;
  amount: number;
  isDeposit: boolean;
  createdAt: string;
  notes: string;
  orderNumber: string;
  paymentMethod: string;
  bankName: string;
  status: string;
  type: string;
  screenshot: string;
  screenshotAdmin: string;
  updatedAt: string;
  displayName?: string;
  userName?: string;
  bpId?: string;
  bpPassword?: string;
  email?: string;
}

export interface UserType {
  uid: string;
  email: string;
  displayName: string;
  userName: string;
  isAccepted: boolean;
  isReject: boolean;
  createdAt: string;
  isAdmin: boolean;
  bpPassword: string;
  bpUsername: string
  phoneNumber: any;
  updatedAt: any;
}
export interface withdrawalTimeType {
  uid: string;
  fromtime: string;
  toTime: string;
  WhatappNumber: string;
  url: string;
  activeTime: boolean;

}
export interface bankInfoType {
  uid: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  category: string;
  status: boolean;
  limit: number;

}
export interface supportType {
  uid: string;
  supportNumber: string;
}

export interface aleartNoteType {
  uid: string;
  alertNote: string;
}

export const getAllUsers = async () => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

// In-memory cache with 30-second TTL
const userCache: { data: any; timestamp: number } = { data: null, timestamp: 0 };
const USER_CACHE_TTL = 30_000; // 30 seconds

export const getCachedUsers = async () => {
  const now = Date.now();
  if (userCache.data && now - userCache.timestamp < USER_CACHE_TTL) {
    return userCache.data;
  }
  const data = await getAllUsers();
  userCache.data = data;
  userCache.timestamp = now;
  return data;
};

export const invalidateUserCache = () => {
  userCache.data = null;
  userCache.timestamp = 0;
};

/**
 * Lightweight count — reads a tiny stats node instead of downloading all users.
 * The stats node is maintained by updateUserStatus, deleteUser, and signup.
 */
export const getUserCounts = async (): Promise<{ total: number; active: number; inactive: number }> => {
  const statsRef = ref(db, 'stats/userCounts');
  const snapshot = await get(statsRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  // Fallback: compute from full users list (first time only)
  const usersObj = await getCachedUsers();
  if (!usersObj || Object.keys(usersObj).length === 0) {
    return { total: 0, active: 0, inactive: 0 };
  }
  let total = 0;
  let active = 0;
  let inactive = 0;
  for (const key of Object.keys(usersObj)) {
    total++;
    const u = usersObj[key];
    if (u.isAccepted === true) active++;
    else inactive++;
  }
  // Seed the stats node for next time
  await set(statsRef, { total, active, inactive });
  return { total, active, inactive };
};

/** Recompute and save stats from the full users list (call after bulk changes) */
export const recomputeUserStats = async () => {
  const usersObj = await getAllUsers();
  let total = 0;
  let active = 0;
  let inactive = 0;
  for (const key of Object.keys(usersObj)) {
    total++;
    const u = usersObj[key];
    if (u.isAccepted === true) active++;
    else inactive++;
  }
  await set(ref(db, 'stats/userCounts'), { total, active, inactive });
};



export const getUserByName = async (name: string) => {
  const usersObj = await getCachedUsers();

  if (!usersObj || Object.keys(usersObj).length === 0) return null;

  const userList = Object.entries(usersObj).map(([uid, userData]: [string, any]) => ({
    uid,
    ...userData,
  }));

  const user = userList.find(u => u.displayName?.toLowerCase() === name.toLowerCase() || u.userName?.toLowerCase() === name.toLowerCase());

  return user || null;
};

export const getAllPendingUsers = (callback: (users: UserType[]) => void) => {
  return subscribeToPath<UserType[]>(
    'users',
    (allUsers) => {
      const pending = allUsers.filter(
        (u: UserType) => u.isAccepted === false && u.isAdmin === false
      );
      callback(pending);
    },
    transformUsers
  );
};



export const updateUserStatus = async (uid: string, isAccepted: boolean) => {
  const userRef = ref(db, `users/${uid}`);
  // Read old value before updating
  const oldSnap = await get(ref(db, `users/${uid}/isAccepted`));
  const wasAccepted = oldSnap.val();
  await update(userRef, { isAccepted });
  invalidateUserCache();
  // Update stats atomically
  const statsRef = ref(db, 'stats/userCounts');
  const statsSnap = await get(statsRef);
  if (statsSnap.exists()) {
    const stats = statsSnap.val();
    if (wasAccepted === true && !isAccepted) {
      await set(statsRef, { total: stats.total, active: stats.active - 1, inactive: stats.inactive + 1 });
    } else if ((!wasAccepted || wasAccepted === false) && isAccepted) {
      await set(statsRef, { total: stats.total, active: stats.active + 1, inactive: stats.inactive - 1 });
    }
  }
};

export const updateUser = async (uid: string, updatedUser: Partial<UserType>) => {
  try {
    const userRef = ref(db, `users/${uid}`);

    const { uid: _, ...data } = updatedUser;

    await update(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    invalidateUserCache();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};



export const deleteUser = async (uid: string) => {
  try {
    const userRef = ref(db, `users/${uid}`);
    // Read user data before deleting (for stats)
    const userSnap = await get(userRef);
    const userData = userSnap.val();
    await remove(userRef);
    invalidateUserCache();
    // Update stats
    if (userData) {
      const statsRef = ref(db, 'stats/userCounts');
      const statsSnap = await get(statsRef);
      if (statsSnap.exists()) {
        const stats = statsSnap.val();
        const isActive = userData.isAccepted === true;
        await set(statsRef, {
          total: Math.max(0, stats.total - 1),
          active: isActive ? Math.max(0, stats.active - 1) : stats.active,
          inactive: !isActive ? Math.max(0, stats.inactive - 1) : stats.inactive,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};


//  0rder Section
export const getAllOrders = async () => {
  const ordersRef = ref(db, 'orders');
  const snapshot = await get(ordersRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

export const listenDepositOrders = (callback: (deposits: OrderType[]) => void) => {
  return subscribeToPath<OrderType[]>(
    'orders',
    (allOrders) => {
      const deposits = allOrders.filter(
        (o: OrderType) => o.isDeposit === true && o.status === 'pending'
      );
      callback(deposits);
    },
    transformOrders
  );
};
export const listenDepositOrdersPending = (callback: (deposits: OrderType[]) => void) => {
  const ordersRef = ref(db, 'orders');

  const unsubscribe = onValue(ordersRef, (snapshot) => {
    const ordersObj = snapshot.val() || {};

    const depositsList: OrderType[] = Object.entries(ordersObj)
      .flatMap(([uid, orderData]: [string, any]) =>
        Object.entries(orderData).map(([orderId, order]: [string, any]) => ({
          id: orderId,
          uid,
          ...order,
        }))
      )
      .filter((order: OrderType) => order.isDeposit === true && order.status === "pending");

    callback(depositsList);
  });

  return () => unsubscribe(); // Call this to stop listening
};
export const listenDepositOrdersPendingByUserID = (
  userId: string,
  callback: (deposits: OrderType[]) => void
) => {
  const userOrdersRef = ref(db, `orders/${userId}`); // ✅ direct path

  const unsubscribe = onValue(userOrdersRef, (snapshot) => {
    const ordersObj = snapshot.val() || {};

    const depositsList: OrderType[] = Object.entries(ordersObj)
      .map(([orderId, order]: [string, any]) => ({
        id: orderId,
        uid: userId,
        ...order,
      }))
      .filter(
        (order: OrderType) =>
          order.isDeposit === true && order.status === "pending"
      );

    callback(depositsList);
  });

  return () => unsubscribe();
};

// Get all withdrawal orders
/**
 * Listener — fetches only pending deposits from the deposits/{uid}/{orderId} node.
 */
export const listenDepositOrdersIndex = (callback: (deposits: OrderType[]) => void) => {
  const depositsRef = ref(db, 'deposits');

  const unsubscribe = onValue(depositsRef, (snapshot) => {
    const depositsObj = snapshot.val() || {};
    const list: OrderType[] = Object.entries(depositsObj)
      .flatMap(([uid, orderData]: [string, any]) =>
        Object.entries(orderData).map(([orderId, order]: [string, any]) => ({
          id: orderId,
          uid,
          ...order,
        }))
      )
      .filter((o: OrderType) => o.status === 'pending');
    callback(list);
  });

  return () => unsubscribe();
};

/**
 * Listener — fetches only pending withdrawals from the withdrawals/{uid}/{orderId} node.
 */
export const listenWithdrawalOrdersIndex = (callback: (withdrawals: OrderType[]) => void) => {
  const withdrawalsRef = ref(db, 'withdrawals');

  const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
    const withdrawalsObj = snapshot.val() || {};
    const list: OrderType[] = Object.entries(withdrawalsObj)
      .flatMap(([uid, orderData]: [string, any]) =>
        Object.entries(orderData).map(([orderId, order]: [string, any]) => ({
          id: orderId,
          uid,
          ...order,
        }))
      )
      .filter((o: OrderType) => o.status === 'pending');
    callback(list);
  });

  return () => unsubscribe();
};

// ──────────────────────────────────────────────
// FAST PENDING INDEXES (flat nodes, no iteration)
// ──────────────────────────────────────────────

/**
 * Listener — reads the flat pendingDeposits index instead of scanning all deposits.
 * Each entry: { uid, orderId, amount, userName, accountNumber, bpId, screenshot, createdAt, status }
 */
export const listenPendingDeposits = (callback: (deposits: OrderType[]) => void) => {
  const indexRef = ref(db, 'pendingDeposits');

  const unsubscribe = onValue(indexRef, (snapshot) => {
    const obj = snapshot.val() || {};
    const list: OrderType[] = Object.entries(obj).map(([orderId, entry]: [string, any]) => ({
      id: orderId,
      ...entry,
    }));
    callback(list);
  });

  return () => unsubscribe();
};

/**
 * Listener — reads the flat pendingWithdrawals index instead of scanning all withdrawals.
 */
export const listenPendingWithdrawals = (callback: (withdrawals: OrderType[]) => void) => {
  const indexRef = ref(db, 'pendingWithdrawals');

  const unsubscribe = onValue(indexRef, (snapshot) => {
    const obj = snapshot.val() || {};
    const list: OrderType[] = Object.entries(obj).map(([orderId, entry]: [string, any]) => ({
      id: orderId,
      ...entry,
    }));
    callback(list);
  });

  return () => unsubscribe();
};

/**
 * Add/update an entry in the pendingDeposits index.
 * Only adds if status === 'pending', otherwise removes it.
 */
export const updatePendingDepositIndex = async (uid: string, orderId: string, data: Partial<OrderType>) => {
  const indexRef = ref(db, `pendingDeposits/${orderId}`);
  if (data.status === 'pending') {
    await set(indexRef, {
      uid,
      orderId,
      amount: data.amount || 0,
      userName: data.userName || '',
      accountNumber: data.accountNumber || '',
      bpId: data.bpId || '',
      screenshot: data.screenshot || '',
      createdAt: data.createdAt || new Date().toISOString(),
      status: 'pending',
    });
  } else {
    await remove(indexRef);
  }
};

/**
 * Add/update an entry in the pendingWithdrawals index.
 * Only adds if status === 'pending', otherwise removes it.
 */
export const updatePendingWithdrawalIndex = async (uid: string, orderId: string, data: Partial<OrderType>) => {
  const indexRef = ref(db, `pendingWithdrawals/${orderId}`);
  if (data.status === 'pending') {
    await set(indexRef, {
      uid,
      orderId,
      amount: data.amount || 0,
      userName: data.userName || '',
      accountNumber: data.accountNumber || '',
      bpId: data.bpId || '',
      screenshot: data.screenshot || '',
      createdAt: data.createdAt || new Date().toISOString(),
      status: 'pending',
    });
  } else {
    await remove(indexRef);
  }
};

export const listenWithdrawalOrders = (callback: (withdrawals: OrderType[]) => void) => {
  return subscribeToPath<OrderType[]>(
    'orders',
    (allOrders) => {
      const withdrawals = allOrders.filter(
        (o: OrderType) => o.isDeposit === false && o.status === 'pending'
      );
      callback(withdrawals);
    },
    transformOrders
  );
};
export const listenWithdrawalOrdersPending = (callback: (withdrawals: OrderType[]) => void) => {
  const ordersRef = ref(db, 'orders');

  const unsubscribe = onValue(ordersRef, (snapshot) => {
    const ordersObj = snapshot.val() || {};

    const withdrawalsList: OrderType[] = Object.entries(ordersObj)
      .flatMap(([uid, orderData]: [string, any]) =>
        Object.entries(orderData).map(([orderId, order]: [string, any]) => ({
          id: orderId,
          uid,
          ...order,
        }))
      )
      .filter((order: OrderType) => order.isDeposit === false && order.status === "pending");

    callback(withdrawalsList);
  });

  return () => unsubscribe(); // Call this to stop listening
};

export const listenWithdrawalOrdersPendingByUserID = (
  userId: string,
  callback: (withdrawals: OrderType[]) => void
) => {
  const userOrdersRef = ref(db, `orders/${userId}`); // ✅ direct path

  const unsubscribe = onValue(userOrdersRef, (snapshot) => {
    const ordersObj = snapshot.val() || {};

    const withdrawalsList: OrderType[] = Object.entries(ordersObj)
      .map(([orderId, order]: [string, any]) => ({
        id: orderId,
        uid: userId,
        ...order,
      }))
      .filter(
        (order: OrderType) =>
          order.isDeposit === false && order.status === "pending"
      );

    callback(withdrawalsList);
  });

  return () => unsubscribe();
};

export const updateOrderStatus = async (uid: string, orderId: string, newStatus: string) => {
  const orderRef = ref(db, `deposits/${uid}/${orderId}`);
  await update(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });

  // Also update the deposits/withdrawals node if it exists
  const depositRef = ref(db, `deposits/${uid}/${orderId}`);
  const withdrawalRef = ref(db, `withdrawals/${uid}/${orderId}`);
  try {
    await update(depositRef, { status: newStatus, updatedAt: new Date().toISOString() });
  } catch (_) { /* deposits node may not exist for this order */ }
  try {
    await update(withdrawalRef, { status: newStatus, updatedAt: new Date().toISOString() });
  } catch (_) { /* withdrawals node may not exist for this order */ }

  // Maintain pending indexes
  const orderData = { status: newStatus };
  await updatePendingDepositIndex(uid, orderId, orderData);
  await updatePendingWithdrawalIndex(uid, orderId, orderData);

  console.log(`Order ${orderId} of user ${uid} updated with status=${newStatus}`);
};



export const getOrderById = async (uid: string, orderId: string) => {
  try {
    const snapshot = await get(ref(db, `orders/${uid}/${orderId}`));

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};
export const updateOrder = async (uid: string, orderId: string, data: OrderType) => {
  try {

    const orderRef = ref(db, `orders/${uid}/${orderId}`);
    const { id, ...payload } = data;
    payload.updatedAt = new Date().toISOString()

    await update(orderRef, data);

    // Maintain pending indexes
    const isDeposit = data.isDeposit === true;
    if (isDeposit) {
      await updatePendingDepositIndex(uid, orderId, data);
    } else {
      await updatePendingWithdrawalIndex(uid, orderId, data);
    }

    console.log("Order updated successfully");
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};
export const createWithdrawalTime = async (data: withdrawalTimeType) => {
  try {
    const withdrawalRef = ref(db, "withdrawalTimes");
    const newRef = push(withdrawalRef);

    const payload = {
      ...data,
      uid: newRef.key,
    };

    await set(newRef, payload);

    return payload;
  } catch (error) {
    console.error("Error creating withdrawal time:", error);
    throw error;
  }
};

export const getAllWithdrawalTimes = async (): Promise<Record<string, withdrawalTimeType>> => {
  try {
    const withdrawalRef = ref(db, "withdrawalTimes");
    const snapshot = await get(withdrawalRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  } catch (error) {
    console.error("Error fetching withdrawal times:", error);
    throw error;
  }
};


export const updateWithdrawalTime = async (uid: string, data: any) => {
  const refPath = ref(db, `withdrawalTimes/${uid}`);
  await update(refPath, data);
};

export const createSupport = async (data: supportType) => {
  try {
    const supportRef = ref(db, "support");
    const newRef = push(supportRef);

    const payload = {
      ...data,
      uid: newRef.key,
    };

    await set(newRef, payload);

    return payload;
  } catch (error) {
    console.error("Error creating support ticket:", error);
    throw error;
  }
};

export const getAllSupport = async (): Promise<Record<string, supportType>> => {
  try {
    const supportRef = ref(db, "support");
    const snapshot = await get(supportRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  } catch (error) {
    console.error("Error fetching withdrawal times:", error);
    throw error;
  }
};


export const updateSupport = async (uid: string, data: any) => {
  const refPath = ref(db, `support/${uid}`);
  await update(refPath, data);
};




export const listenBanks = (callback: (data: any[]) => void) => {
  const banksRef = ref(db, "banks");

  const unsubscribe = onValue(
    banksRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(Object.values(data));
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("Error listening to banks:", error);
      callback([]);
    }
  );

  return () => unsubscribe();
};

export const updateBankStatus = async (uid: string, status: boolean) => {
  await update(ref(db, `banks/${uid}`), { status });
};

export const deleteBank = async (uid: string) => {
  await remove(ref(db, `banks/${uid}`));
};

export const createBank = async (data: any) => {
  const newRef = push(ref(db, "banks"));

  await set(newRef, {
    ...data,
    uid: newRef.key
  });
};

export const updateBank = async (uid: string, data: any) => {
  await update(ref(db, `banks/${uid}`), data);
};


export const getBankById = async (uid: string) => {
  const snapshot = await get(ref(db, `banks/${uid}`));

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return null;
};





export const createAleartNote = async (data: aleartNoteType) => {
  try {
    const aleartNoteRef = ref(db, "aleartNotes");
    const newRef = push(aleartNoteRef);

    const payload = {
      ...data,
      uid: newRef.key,
    };

    await set(newRef, payload);

    return payload;
  } catch (error) {
    console.error("Error creating aleart note:", error);
    throw error;
  }
};

export const getAllAleartNotes = async (): Promise<
  Record<string, aleartNoteType>
> => {
  try {
    const aleartNoteRef = ref(db, "aleartNotes");
    const snapshot = await get(aleartNoteRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  } catch (error) {
    console.error("Error fetching aleart notes:", error);
    throw error;
  }
};

export const updateAleartNote = async (uid: string, data: any) => {
  const refPath = ref(db, `aleartNotes/${uid}`);
  await update(refPath, data);
};