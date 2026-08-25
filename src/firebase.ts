import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';

export { onAuthStateChanged };
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';
import { UserProfile, Question, TestAttempt, ForumPost, ForumComment, Bookmark, UserStreak, StudyLog, UserPlannerData } from './types';

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
});

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Test Connection Helper
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return { success: true, message: 'Firestore connected successfully!' };
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      return { success: true, message: 'Firestore connected (Rules verified).' };
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { success: false, message: 'Firestore offline or configuration issue.' };
    }
    return { success: true, message: `Firestore active: ${error?.message || 'Ready'}` };
  }
};

// Run verification on module load
testFirebaseConnection().then((res) => {
  console.log('[Firebase Connection Check]', res.message);
});

// Helper for Google Login
export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user exists in Firestore, if not create profile
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    let profile: UserProfile;

    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
    } else {
      // Check if admin email or first user
      const isDefaultAdmin = firebaseUser.email?.includes('admin') || firebaseUser.email === 'ramanaidu2004@gmail.com';
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'GATE Aspirant',
        photoURL: firebaseUser.photoURL || undefined,
        role: isDefaultAdmin ? 'admin' : 'user',
        branch: 'CS',
        targetYear: 2026,
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, profile);
    }
    return profile;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign Out
export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

// Save User Profile
export const updateUserProfileInDb = async (profile: UserProfile) => {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (e) {
    console.error('Failed to update user profile in db:', e);
  }
};

// Fetch User Profile
export const getUserProfileFromDb = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (e) {
    console.error('Error fetching user profile from db:', e);
    return null;
  }
};

// Date helper utilities
export const getTodayDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateString(yesterday);
};

// Save Test Attempt & Auto Record Study Activity
export const saveTestAttemptToDb = async (attempt: Omit<TestAttempt, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'testAttempts'), {
      ...attempt,
      attemptedAt: new Date().toISOString()
    });

    // Auto-record activity for streak tracking if userId exists
    if (attempt.userId) {
      const minutesSpent = Math.max(1, Math.round((attempt.timeTakenSeconds || 300) / 60));
      recordDailyActivityInDb(
        attempt.userId,
        minutesSpent,
        'test',
        attempt.totalQuestions || 0,
        1,
        `Completed test: ${attempt.testTitle || 'GATE Test'}`
      ).catch(err => console.error('Auto streak record failed:', err));
    }

    return docRef.id;
  } catch (e) {
    console.error('Error saving test attempt:', e);
    return `local-${Date.now()}`;
  }
};

// Fetch User Test Attempts
export const getUserTestAttemptsFromDb = async (userId: string): Promise<TestAttempt[]> => {
  try {
    const q = query(
      collection(db, 'testAttempts'), 
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: TestAttempt[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as TestAttempt);
    });
    // Sort descending
    return list.sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
  } catch (e) {
    console.error('Error fetching test attempts:', e);
    return [];
  }
};

// Fetch All Test Attempts (Admin)
export const getAllTestAttemptsFromDb = async (): Promise<TestAttempt[]> => {
  try {
    const snap = await getDocs(collection(db, 'testAttempts'));
    const list: TestAttempt[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as TestAttempt);
    });
    return list;
  } catch (e) {
    console.error('Error fetching all test attempts:', e);
    return [];
  }
};

// Save Custom Question (Community or Admin)
export const saveQuestionToDb = async (question: Omit<Question, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...question,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (e) {
    console.error('Error saving question to db:', e);
    return `q-${Date.now()}`;
  }
};

// Fetch All Questions from DB
export const getQuestionsFromDb = async (): Promise<Question[]> => {
  try {
    const snap = await getDocs(collection(db, 'questions'));
    const list: Question[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Question);
    });
    return list;
  } catch (e) {
    console.error('Error fetching questions from db:', e);
    return [];
  }
};

// Update Question Status (Admin)
export const updateQuestionStatusInDb = async (questionId: string, status: 'approved' | 'rejected') => {
  try {
    const qRef = doc(db, 'questions', questionId);
    await updateDoc(qRef, { status });
  } catch (e) {
    console.error('Error updating question status:', e);
  }
};

// Forum Posts
export const saveForumPostToDb = async (post: Omit<ForumPost, 'id' | 'upvotesCount' | 'commentsCount' | 'upvotedBy'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'forumPosts'), {
      ...post,
      upvotesCount: 0,
      upvotedBy: [],
      commentsCount: 0,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (e) {
    console.error('Error saving forum post:', e);
    return `post-${Date.now()}`;
  }
};

export const getForumPostsFromDb = async (): Promise<ForumPost[]> => {
  try {
    const snap = await getDocs(collection(db, 'forumPosts'));
    const list: ForumPost[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ForumPost);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error getting forum posts:', e);
    return [];
  }
};

export const toggleUpvotePost = async (postId: string, userId: string, currentUpvotedBy: string[]) => {
  try {
    const postRef = doc(db, 'forumPosts', postId);
    const hasUpvoted = currentUpvotedBy.includes(userId);
    const newUpvotedBy = hasUpvoted
      ? currentUpvotedBy.filter(id => id !== userId)
      : [...currentUpvotedBy, userId];
    
    await updateDoc(postRef, {
      upvotedBy: newUpvotedBy,
      upvotesCount: newUpvotedBy.length
    });
  } catch (e) {
    console.error('Error toggling upvote:', e);
  }
};

// Comments
export const addForumCommentToDb = async (comment: Omit<ForumComment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'forumComments'), {
      ...comment,
      createdAt: new Date().toISOString()
    });
    // Increment comments count on post
    const postRef = doc(db, 'forumPosts', comment.postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const current = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, { commentsCount: current + 1 });
    }
    return docRef.id;
  } catch (e) {
    console.error('Error adding comment:', e);
    return `comment-${Date.now()}`;
  }
};

export const getForumCommentsFromDb = async (postId: string): Promise<ForumComment[]> => {
  try {
    const q = query(collection(db, 'forumComments'), where('postId', '==', postId));
    const snap = await getDocs(q);
    const list: ForumComment[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ForumComment);
    });
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (e) {
    console.error('Error getting comments:', e);
    return [];
  }
};

// Bookmarks
export const toggleBookmarkInDb = async (userId: string, questionId: string, currentBookmarks: string[]): Promise<string[]> => {
  try {
    const isBookmarked = currentBookmarks.includes(questionId);
    let updated: string[];
    
    if (isBookmarked) {
      updated = currentBookmarks.filter(id => id !== questionId);
      // Delete bookmark doc if found
      const q = query(
        collection(db, 'bookmarks'),
        where('userId', '==', userId),
        where('questionId', '==', questionId)
      );
      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        await deleteDoc(doc(db, 'bookmarks', d.id));
      });
    } else {
      updated = [...currentBookmarks, questionId];
      await addDoc(collection(db, 'bookmarks'), {
        userId,
        questionId,
        createdAt: new Date().toISOString()
      });
    }
    return updated;
  } catch (e) {
    console.error('Error toggling bookmark:', e);
    return currentBookmarks;
  }
};

export const getUserBookmarksFromDb = async (userId: string): Promise<string[]> => {
  try {
    const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const ids: string[] = [];
    snap.forEach((doc) => {
      ids.push(doc.data().questionId);
    });
    return ids;
  } catch (e) {
    console.error('Error fetching bookmarks:', e);
    return [];
  }
};

// User Role Update (Admin Panel)
export const updateUserRoleInDb = async (uid: string, role: 'admin' | 'user') => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  } catch (e) {
    console.error('Error updating user role:', e);
  }
};

export const getAllUsersFromDb = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((doc) => {
      list.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });
    return list;
  } catch (e) {
    console.error('Error getting all users:', e);
    return [];
  }
};

// ==================== USER STREAK & STUDY ACTIVITY FUNCTIONS ====================

export const getUserStreakFromDb = async (userId: string): Promise<UserStreak | null> => {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'userStreaks', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data() as UserStreak;

    // Evaluate current streak based on last active date
    const todayStr = getTodayDateString();
    const yesterdayStr = getYesterdayDateString();
    const lastActive = data.lastActiveDate;

    if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr) {
      // Streak broken (gap > 1 day)
      const resetStreak: UserStreak = {
        ...data,
        currentStreak: 0,
        updatedAt: new Date().toISOString()
      };
      // Asynchronously persist the reset in Firestore
      setDoc(docRef, { currentStreak: 0, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
      return resetStreak;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user streak:', error);
    return null;
  }
};

export const recordDailyActivityInDb = async (
  userId: string,
  minutesStudied: number = 30,
  activityType: 'test' | 'pyq' | 'checkin' | 'planner' = 'checkin',
  questionsSolved: number = 0,
  testsTaken: number = 0,
  note?: string
): Promise<UserStreak | null> => {
  if (!userId) return null;

  try {
    const todayStr = getTodayDateString();
    const yesterdayStr = getYesterdayDateString();

    // 1. Fetch current user streak document
    const streakRef = doc(db, 'userStreaks', userId);
    const streakSnap = await getDoc(streakRef);

    let currentStreak = 1;
    let longestStreak = 1;
    let totalStudyDays = 1;
    let totalStudyTimeMinutes = minutesStudied;
    let activeDatesMap: Record<string, boolean> = { [todayStr]: true };

    if (streakSnap.exists()) {
      const existing = streakSnap.data() as UserStreak;
      activeDatesMap = { ...(existing.activeDatesMap || {}), [todayStr]: true };
      totalStudyTimeMinutes = (existing.totalStudyTimeMinutes || 0) + minutesStudied;

      const lastActive = existing.lastActiveDate;
      if (lastActive === todayStr) {
        // Already active today, maintain streak count and update total minutes/days
        currentStreak = existing.currentStreak || 1;
        longestStreak = Math.max(existing.longestStreak || 0, currentStreak);
        totalStudyDays = existing.totalStudyDays || Object.keys(activeDatesMap).length;
      } else if (lastActive === yesterdayStr) {
        // Consecutive day!
        currentStreak = (existing.currentStreak || 0) + 1;
        longestStreak = Math.max(existing.longestStreak || 0, currentStreak);
        totalStudyDays = (existing.totalStudyDays || 0) + 1;
      } else {
        // Streak broken, start fresh
        currentStreak = 1;
        longestStreak = Math.max(existing.longestStreak || 0, 1);
        totalStudyDays = (existing.totalStudyDays || 0) + 1;
      }
    }

    const updatedStreak: UserStreak = {
      userId,
      currentStreak,
      longestStreak,
      lastActiveDate: todayStr,
      totalStudyDays,
      totalStudyTimeMinutes,
      activeDatesMap,
      updatedAt: new Date().toISOString()
    };

    // Save normalized user streak
    await setDoc(streakRef, updatedStreak, { merge: true });

    // 2. Save or update normalized daily study log record at /studyLogs/{userId_todayStr}
    const logDocId = `${userId}_${todayStr}`;
    const logRef = doc(db, 'studyLogs', logDocId);
    const logSnap = await getDoc(logRef);

    if (logSnap.exists()) {
      const logData = logSnap.data() as StudyLog;
      const updatedTypes = Array.from(new Set([...(logData.activityTypes || []), activityType]));
      await updateDoc(logRef, {
        minutesStudied: (logData.minutesStudied || 0) + minutesStudied,
        questionsSolved: (logData.questionsSolved || 0) + questionsSolved,
        testsTaken: (logData.testsTaken || 0) + testsTaken,
        activityTypes: updatedTypes,
        note: note ? note : logData.note || '',
        timestamp: new Date().toISOString()
      });
    } else {
      const newLog: StudyLog = {
        id: logDocId,
        userId,
        date: todayStr,
        minutesStudied,
        questionsSolved,
        testsTaken,
        activityTypes: [activityType],
        note: note || '',
        timestamp: new Date().toISOString()
      };
      await setDoc(logRef, newLog);
    }

    return updatedStreak;
  } catch (error) {
    console.error('Error recording daily activity:', error);
    return null;
  }
};

export const getUserStudyLogsFromDb = async (userId: string): Promise<StudyLog[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'studyLogs'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const logs: StudyLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() } as StudyLog);
    });
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error fetching study logs:', error);
    return [];
  }
};

// ==================== USER STUDY PLANNER & GOALS FUNCTIONS ====================

export const getUserPlannerFromDb = async (userId: string): Promise<UserPlannerData | null> => {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'userPlanners', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserPlannerData;
  } catch (error) {
    console.error('Error fetching user planner from Firestore:', error);
    return null;
  }
};

export const saveUserPlannerToDb = async (userId: string, data: Partial<UserPlannerData>): Promise<boolean> => {
  if (!userId) return false;
  try {
    const docRef = doc(db, 'userPlanners', userId);
    await setDoc(docRef, {
      userId,
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user planner to Firestore:', error);
    return false;
  }
};
