
import { db } from './firebase';
import { ref, get, update, child, remove, onValue, set, push, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
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

/** Lightweight count — uses shared cache so no extra network call */
export const getUserCounts = async (): Promise<{ total: number; active: number; inactive: number }> => {
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

  return { total, active, inactive };
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
  await update(userRef, { isAccepted });
  invalidateUserCache();
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
    await remove(userRef);
    invalidateUserCache();
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
  const orderRef = ref(db, `orders/${uid}/${orderId}`);
  await update(orderRef, { status: newStatus });
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