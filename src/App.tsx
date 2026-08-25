/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PracticePYQs } from './components/PracticePYQs';
import { TestCenter } from './components/TestCenter';
import { ExamEngine } from './components/ExamEngine';
import { CommunityForum } from './components/CommunityForum';
import { StudyPlanner } from './components/StudyPlanner';
import { AdminPanel } from './components/AdminPanel';
import { ProfilePage } from './components/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { SolutionReviewModal } from './components/SolutionReviewModal';
import { 
  UserProfile, 
  Question, 
  TestAttempt, 
  ForumPost, 
  ForumComment, 
  TestConfig, 
  BranchType 
} from './types';
import { INITIAL_QUESTIONS } from './data/mockQuestions';
import { 
  auth, 
  onAuthStateChanged, 
  logoutUser, 
  getQuestionsFromDb, 
  saveQuestionToDb, 
  updateQuestionStatusInDb, 
  getUserTestAttemptsFromDb, 
  saveTestAttemptToDb, 
  getForumPostsFromDb, 
  saveForumPostToDb, 
  getForumCommentsFromDb, 
  addForumCommentToDb, 
  toggleUpvotePost, 
  getUserBookmarksFromDb, 
  toggleBookmarkInDb, 
  getAllUsersFromDb, 
  updateUserRoleInDb,
  updateUserProfileInDb,
  getUserProfileFromDb
} from './firebase';

export default function App() {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<BranchType>('CS');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data Stores
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumComments, setForumComments] = useState<Record<string, ForumComment[]>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Active Modals & Exam View State
  const [activeTestConfig, setActiveTestConfig] = useState<TestConfig | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<TestAttempt | null>(null);

  // Firebase Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = firebaseUser.email?.includes('admin') || firebaseUser.email === 'ramanaidu2004@gmail.com';
        const existingProfile = await getUserProfileFromDb(firebaseUser.uid);
        let profile: UserProfile;

        if (existingProfile) {
          profile = existingProfile;
          if (existingProfile.branch) {
            setSelectedBranch(existingProfile.branch);
          }
        } else {
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'GATE Aspirant',
            photoURL: firebaseUser.photoURL || undefined,
            role: isAdmin ? 'admin' : 'user',
            branch: selectedBranch,
            targetYear: 2026,
            createdAt: new Date().toISOString()
          };
          updateUserProfileInDb(profile);
        }

        setUser(profile);

        // Fetch User Data from Firestore
        loadUserData(firebaseUser.uid);
      } else {
        setUser(null);
      }
    });

    // Fetch Public Collections
    loadPublicData();

    return () => unsubscribe();
  }, []);

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    if (updatedUser.branch) {
      setSelectedBranch(updatedUser.branch);
    }
  };

  const loadUserData = async (uid: string) => {
    try {
      const attempts = await getUserTestAttemptsFromDb(uid);
      setTestAttempts(attempts);

      const savedBookmarks = await getUserBookmarksFromDb(uid);
      setBookmarks(savedBookmarks);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  const loadPublicData = async () => {
    try {
      const dbQuestions = await getQuestionsFromDb();
      if (dbQuestions.length > 0) {
        // Merge DB questions with initial pre-loaded ones to ensure complete set
        const existingIds = new Set(dbQuestions.map(q => q.id));
        const combined = [
          ...dbQuestions,
          ...INITIAL_QUESTIONS.filter(q => !existingIds.has(q.id))
        ];
        setQuestions(combined);
      }

      const posts = await getForumPostsFromDb();
      if (posts.length > 0) {
        setForumPosts(posts);
      } else {
        // Sample seed forum post
        setForumPosts([
          {
            id: 'post-seed-1',
            title: 'Which reference book is best for Algorithms and Dynamic Programming in GATE CS?',
            content: 'Hello everyone! I am preparing for GATE CS 2026. Should I focus on Cormen (CLRS) or is standard problem solving with PYQs enough for DP and Graph algorithms?',
            authorUid: 'demo-aspirant-123',
            authorName: 'Rohan Sharma',
            subject: 'Algorithms',
            branch: 'CS',
            upvotesCount: 8,
            upvotedBy: [],
            commentsCount: 2,
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
          }
        ]);
      }

      const users = await getAllUsersFromDb();
      setUsersList(users);
    } catch (e) {
      console.error('Error loading public data:', e);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Toggle Bookmark Handler
  const handleToggleBookmark = async (questionId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const updated = await toggleBookmarkInDb(user.uid, questionId, bookmarks);
    setBookmarks(updated);
  };

  // Submit New Question (Community or Admin)
  const handleSubmitNewQuestion = async (qData: Omit<Question, 'id'>) => {
    const createdId = await saveQuestionToDb(qData);
    const newQ: Question = {
      id: createdId,
      ...qData
    };
    setQuestions(prev => [newQ, ...prev]);
  };

  // Admin Approve/Reject Question
  const handleUpdateQuestionStatus = async (questionId: string, status: 'approved' | 'rejected') => {
    await updateQuestionStatusInDb(questionId, status);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status } : q));
  };

  // Finish Exam & Save Attempt
  const handleFinishExam = async (attemptData: Omit<TestAttempt, 'id'>) => {
    const attemptId = await saveTestAttemptToDb(attemptData);
    const fullAttempt: TestAttempt = {
      id: attemptId,
      ...attemptData
    };
    setTestAttempts(prev => [fullAttempt, ...prev]);
    setActiveTestConfig(null);
  };

  // Create Forum Post
  const handleCreateForumPost = async (postData: Omit<ForumPost, 'id' | 'upvotesCount' | 'commentsCount' | 'upvotedBy'>) => {
    const postId = await saveForumPostToDb(postData);
    const newPost: ForumPost = {
      id: postId,
      ...postData,
      upvotesCount: 0,
      upvotedBy: [],
      commentsCount: 0
    };
    setForumPosts(prev => [newPost, ...prev]);
  };

  // Toggle Upvote Post
  const handleToggleUpvotePost = async (postId: string, currentUpvotedBy: string[]) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await toggleUpvotePost(postId, user.uid, currentUpvotedBy);
    
    // Update local state
    setForumPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isUpvoted = currentUpvotedBy.includes(user.uid);
        const newUpvoted = isUpvoted
          ? currentUpvotedBy.filter(id => id !== user.uid)
          : [...currentUpvotedBy, user.uid];
        return {
          ...p,
          upvotedBy: newUpvoted,
          upvotesCount: newUpvoted.length
        };
      }
      return p;
    }));
  };

  // Add Forum Comment
  const handleAddForumComment = async (commentData: Omit<ForumComment, 'id'>) => {
    const commentId = await addForumCommentToDb(commentData);
    const newComment: ForumComment = {
      id: commentId,
      ...commentData
    };

    setForumComments(prev => ({
      ...prev,
      [commentData.postId]: [...(prev[commentData.postId] || []), newComment]
    }));

    setForumPosts(prev => prev.map(p => {
      if (p.id === commentData.postId) {
        return { ...p, commentsCount: (p.commentsCount || 0) + 1 };
      }
      return p;
    }));
  };

  // Fetch Comments for Post
  const handleFetchComments = async (postId: string) => {
    if (forumComments[postId]) return; // Already cached
    const comments = await getForumCommentsFromDb(postId);
    setForumComments(prev => ({ ...prev, [postId]: comments }));
  };

  // Admin Toggle User Role
  const handleUpdateUserRole = async (uid: string, role: 'admin' | 'user') => {
    await updateUserRoleInDb(uid, role);
    setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
  };

  // If inside active exam engine session
  if (activeTestConfig) {
    return (
      <ExamEngine
        testConfig={activeTestConfig}
        allQuestions={questions}
        user={user}
        onFinishExam={handleFinishExam}
        onExit={() => setActiveTestConfig(null)}
        selectedBranch={selectedBranch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-sky-500 selection:text-black">
      
      {/* Top Header Navbar - Admin button removed from public tabs */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                user={user}
                testAttempts={testAttempts}
                questions={questions}
                bookmarks={bookmarks}
                onStartTestFromDashboard={() => navigate('/tests')}
                onReviewAttempt={(attempt) => setReviewAttempt(attempt)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                selectedBranch={selectedBranch}
                onNavigateToPYQs={() => navigate('/pyqs')}
              />
            }
          />

          <Route
            path="/pyqs"
            element={
              <PracticePYQs
                questions={questions}
                selectedBranch={selectedBranch}
                bookmarks={bookmarks}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onToggleBookmark={handleToggleBookmark}
                onSubmitNewQuestion={handleSubmitNewQuestion}
                onShareToCommunity={() => navigate('/community')}
              />
            }
          />

          <Route
            path="/tests"
            element={
              <TestCenter
                questions={questions}
                selectedBranch={selectedBranch}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onStartExam={(config) => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setActiveTestConfig(config);
                }}
              />
            }
          />

          <Route
            path="/planner"
            element={
              <StudyPlanner
                user={user}
                selectedBranch={selectedBranch}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />

          <Route
            path="/community"
            element={
              <CommunityForum
                posts={forumPosts}
                commentsMap={forumComments}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onCreatePost={handleCreateForumPost}
                onAddComment={handleAddForumComment}
                onToggleUpvote={handleToggleUpvotePost}
                onFetchComments={handleFetchComments}
                selectedBranch={selectedBranch}
              />
            }
          />

          <Route
            path="/admin"
            element={
              <AdminPanel
                questions={questions}
                users={usersList}
                testAttempts={testAttempts}
                forumPosts={forumPosts}
                currentUser={user}
                onUpdateQuestionStatus={handleUpdateQuestionStatus}
                onUpdateUserRole={handleUpdateUserRole}
                onCreateOfficialQuestion={handleSubmitNewQuestion}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                selectedBranch={selectedBranch}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                onUpdateUser={handleUpdateUserProfile}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                testAttemptsCount={testAttempts.length}
                bookmarksCount={bookmarks.length}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          loadUserData(loggedInUser.uid);
        }}
        currentBranch={selectedBranch}
      />

      {/* Solution Review Modal */}
      {reviewAttempt && (
        <SolutionReviewModal
          attempt={reviewAttempt}
          questions={questions}
          onClose={() => setReviewAttempt(null)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500 font-mono">
        <p>© 2026 GATE Aspire • Minimalist Exam Preparation Engine with Google Cloud Authentication & Firestore</p>
      </footer>

    </div>
  );
}
