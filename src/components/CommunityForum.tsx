import React, { useState } from 'react';
import { ForumPost, ForumComment, UserProfile, BranchType } from '../types';
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  PlusCircle, 
  Search, 
  User as UserIcon, 
  Clock, 
  CornerDownRight, 
  Sparkles,
  MessageCircle,
  Share2
} from 'lucide-react';

interface CommunityForumProps {
  posts: ForumPost[];
  commentsMap: Record<string, ForumComment[]>;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onCreatePost: (post: Omit<ForumPost, 'id' | 'upvotesCount' | 'commentsCount' | 'upvotedBy'>) => void;
  onAddComment: (comment: Omit<ForumComment, 'id'>) => void;
  onToggleUpvote: (postId: string, currentUpvotedBy: string[]) => void;
  onFetchComments: (postId: string) => void;
  selectedBranch: BranchType;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  posts,
  commentsMap,
  user,
  onOpenAuth,
  onCreatePost,
  onAddComment,
  onToggleUpvote,
  onFetchComments,
  selectedBranch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  
  // Post Creator Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postSubject, setPostSubject] = useState('Algorithms');

  const filteredPosts = posts.filter(p => {
    if (selectedSubject !== 'All' && p.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const text = (p.title + ' ' + p.content + ' ' + p.authorName).toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) return;

    onCreatePost({
      title: postTitle,
      content: postContent,
      authorUid: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      subject: postSubject,
      branch: selectedBranch,
      createdAt: new Date().toISOString()
    });

    setPostTitle('');
    setPostContent('');
    setIsCreateOpen(false);
  };

  const handleCommentSubmit = (postId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const text = newCommentText[postId] || '';
    if (!text.trim()) return;

    onAddComment({
      postId,
      content: text.trim(),
      authorUid: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      createdAt: new Date().toISOString()
    });

    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleExpand = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      onFetchComments(postId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>GATE COMMUNITY FORUM</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Discussion & Solution Exchange</h2>
            <p className="text-xs text-zinc-400 mt-1">Post doubts, share short cut tricks, verify solutions, and collaborate with fellow GATE aspirants.</p>
          </div>

          <button
            onClick={() => user ? setIsCreateOpen(true) : onOpenAuth()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition shadow shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            New Post / Doubt
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search posts, concepts, doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="All">All Discussion Subjects</option>
            <option value="Algorithms">Algorithms & DS</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="DBMS">DBMS</option>
            <option value="Theory of Computation">Theory of Computation</option>
            <option value="General Aptitude">General Aptitude</option>
          </select>
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isUpvoted = user ? post.upvotedBy?.includes(user.uid) : false;
            const comments = commentsMap[post.id] || [];
            const isExpanded = expandedPostId === post.id;

            return (
              <div key={post.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4 hover:border-zinc-700/80 transition">
                
                {/* Author & Subject Bar */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white overflow-hidden">
                      {post.authorPhoto ? (
                        <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold">{post.authorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(post.createdAt).toLocaleDateString()} • {post.branch}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-zinc-300">
                    {post.subject}
                  </span>
                </div>

                {/* Post Title & Content */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                    {post.content}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    {/* Upvote */}
                    <button
                      onClick={() => user ? onToggleUpvote(post.id, post.upvotedBy || []) : onOpenAuth()}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                        isUpvoted
                          ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotesCount || 0} Upvotes</span>
                    </button>

                    {/* Comment count / Expand toggle */}
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{post.commentsCount || comments.length} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-zinc-800 space-y-4 animate-fade-in">
                    
                    {/* Existing Comments List */}
                    {comments.length > 0 ? (
                      <div className="space-y-3">
                        {comments.map((c) => (
                          <div key={c.id} className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-white">{c.authorName}</span>
                              <span className="text-zinc-500">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-zinc-200 font-sans">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No comments yet. Be the first to answer this doubt!</p>
                    )}

                    {/* New Comment Input */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type your answer or comment..."
                        value={newCommentText[post.id] || ''}
                        onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No discussion posts yet</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-4">Start the conversation by posting a GATE doubt or concept question!</p>
            <button
              onClick={() => user ? setIsCreateOpen(true) : onOpenAuth()}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs rounded-lg transition"
            >
              Create New Post
            </button>
          </div>
        )}
      </div>

      {/* Create New Post Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-extrabold text-white mb-1">Create Community Post</h3>
            <p className="text-xs text-zinc-400 mb-4">Share a question doubt or solution strategy with fellow aspirants.</p>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Shortcut to calculate page faults in LRU?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Subject Tag</label>
                <select
                  value={postSubject}
                  onChange={(e) => setPostSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Algorithms">Algorithms & DS</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="DBMS">DBMS</option>
                  <option value="Theory of Computation">Theory of Computation</option>
                  <option value="General Aptitude">General Aptitude</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Post Details / Discussion Text *</label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Elaborate your doubt or concept explanation..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs rounded-xl hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
