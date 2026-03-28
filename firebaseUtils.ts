
import { db } from './firebase';
import { ref, get, update, child,remove,onValue   } from 'firebase/database';

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
    updatedAt: string;
    displayName?: string;
    email?: string;
}

export interface UserType {
    uid: string;
    email: string;
    displayName: string;
    isAccepted: boolean;
    createdAt: string;
    isAdmin: boolean;
    bpPassword: string;
    bpUsername: string
    phoneNumber: any;
    updatedAt: any;
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


  const user = userList.find(u => u.displayName?.toLowerCase() === name.toLowerCase());

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
      .filter((user) => user.isAccepted === false);

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
      .filter((order: OrderType) => order.isDeposit === true);

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
      .filter((order: OrderType) => order.isDeposit === false);

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

export const updateOrderStatus = async (uid: string, orderId: string, newStatus: string) => {
    const orderRef = ref(db, `orders/${uid}/${orderId}`);
    await update(orderRef, { status: newStatus });
    console.log(`Order ${orderId} of user ${uid} updated with status=${newStatus}`);
};
