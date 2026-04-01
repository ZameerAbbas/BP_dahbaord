
import { db } from './firebase';
import { ref, get, update, child,remove,onValue, set, push   } from 'firebase/database';

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

export const getAllUsers = async () => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};



export const getUserByName = async (name: string) => {
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) return null;

  const usersObj = snapshot.val();

  const userList = Object.entries(usersObj).map(([uid, userData]: [string, any]) => ({
    uid,
    ...userData,
  }));


  const user = userList.find(u => u.displayName?.toLowerCase() === name.toLowerCase() || u.userName?.toLowerCase() === name.toLowerCase());

  return user || null;
};

export const getAllPendingUsers = (callback: (users: UserType[]) => void) => {
  const userRef = ref(db, 'users');

  const unsubscribe = onValue(userRef, (snapshot) => {
    const userObj = snapshot.val() || {};

    // Convert object to array and filter pending users
    const pendingUsers: UserType[] = Object.entries(userObj)
      .map(([uid, userData]: [string, any]) => ({
        uid,
        ...userData,
      }))
      .filter((user) => user.isAccepted === false && user.isAdmin === false);

    callback(pendingUsers);
  });

  return () => unsubscribe();
};



export const updateUserStatus = async (uid: string, isAccepted: boolean) => {
  const userRef = ref(db, `users/${uid}`);
  await update(userRef, { isAccepted });
  await console.log("update done")
};

export const updateUser = async (uid: string, updatedUser: Partial<UserType>) => {
  try {
    const userRef = ref(db, `users/${uid}`);

    const { uid: _, ...data } = updatedUser;

    await update(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    console.log("update done");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (uid: string) => {
  try {
    const userRef = ref(db, `users/${uid}`);
    await remove(userRef);
    console.log("User deleted successfully");
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
      .filter((order: OrderType) => order.isDeposit === true && order.status === "pending" );

    callback(depositsList);
  });

  return () => unsubscribe(); // Call this to stop listening
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
      .filter((order: OrderType) => order.isDeposit === false && order.status === "pending" );

    callback(withdrawalsList);
  });

  return () => unsubscribe(); // Call this to stop listening
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
      .filter((order: OrderType) => order.isDeposit === false && order.status === "pending" );

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
      uid: newRef.key, // generate UID
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

  const unsubscribe = onValue(banksRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });

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


