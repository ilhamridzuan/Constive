'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateComment,
  useDailyWorkReportComments,
  useDeleteComment,
  useUpdateComment,
} from '@/hooks/use-daily-work-reports';
import { DailyWorkReportComment } from '@/types/domain/daily-work-report';
import {
  CornerDownRight,
  Edit2,
  Loader2,
  MessageSquare,
  Reply,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface CommentSectionProps {
  workspaceId: string;
  projectId: string;
  reportId: string;
  currentUserId?: string;
}

interface CommentWithReplies extends DailyWorkReportComment {
  replies?: CommentWithReplies[];
}

function formatCommentTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

/**
 * Transforms flat array of comments into a hierarchical tree structure based on parentCommentId
 */
function buildCommentTree(comments: DailyWorkReportComment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];

  // Clone all comments and store in map
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Attach replies to parents or push to roots
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;
    if (comment.parentCommentId && commentMap.has(comment.parentCommentId)) {
      const parentNode = commentMap.get(comment.parentCommentId)!;
      parentNode.replies = parentNode.replies || [];
      parentNode.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CommentSection({
  workspaceId,
  projectId,
  reportId,
  currentUserId = 'sup-1', // Default logged-in user id for simulation
}: CommentSectionProps) {
  const { data: comments = [], isLoading } = useDailyWorkReportComments(
    workspaceId,
    projectId,
    reportId
  );

  const createCommentMutation = useCreateComment(workspaceId, projectId, reportId);
  const updateCommentMutation = useUpdateComment(workspaceId, projectId, reportId);
  const deleteCommentMutation = useDeleteComment(workspaceId, projectId, reportId);

  // Main comment input state
  const [mainContent, setMainContent] = useState('');

  // Active form actions
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Build nested comment tree
  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  const handleSendMainComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainContent.trim() || createCommentMutation.isPending) return;

    await createCommentMutation.mutateAsync({
      content: mainContent.trim(),
    });
    setMainContent('');
  };

  const handleSendReply = async (parentId: string) => {
    if (!replyContent.trim() || createCommentMutation.isPending) return;

    await createCommentMutation.mutateAsync({
      content: replyContent.trim(),
      parentCommentId: parentId,
    });
    setReplyingToId(null);
    setReplyContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || updateCommentMutation.isPending) return;

    await updateCommentMutation.mutateAsync({
      commentId,
      input: { content: editContent.trim() },
    });
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      await deleteCommentMutation.mutateAsync(commentId);
    }
  };

  // Sub-component for individual comment card (supports recursive replies)
  const renderCommentCard = (comment: CommentWithReplies, isReply = false) => {
    const isOwner = comment.userId === currentUserId;
    const isReplying = replyingToId === comment.id;
    const isEditing = editingId === comment.id;

    return (
      <div key={comment.id} className="space-y-3.5 group/comment">
        <div className="bg-card border border-border/80 rounded-lg p-3 sm:p-3.5 shadow-xs space-y-2">
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-foreground">{comment.userName}</span>
                <span className="text-muted-foreground text-[10px]">·</span>
                <span className="text-muted-foreground text-[11px]">
                  {formatCommentTime(comment.createdAt)}
                  {comment.updatedAt && <span className="ml-1 text-[10px] italic">(diedit)</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Body / Edit Form */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-xs"
                placeholder="Edit komentar..."
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(null);
                    setEditContent('');
                  }}
                  className="h-7 text-xs px-2.5"
                >
                  Batal
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={!editContent.trim() || updateCommentMutation.isPending}
                  onClick={() => handleSaveEdit(comment.id)}
                  className="h-7 text-xs px-3"
                >
                  {updateCommentMutation.isPending && (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  )}
                  Simpan
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-line pl-0.5">
              {comment.content}
            </p>
          )}

          {/* Action Toolbar */}
          {!isEditing && (
            <div className="flex items-center gap-3 pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(isReplying ? null : comment.id);
                  setReplyContent('');
                }}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
              >
                <Reply className="h-3 w-3" /> Balas
              </button>

              {/* Edit & Delete ONLY rendered if comment.userId === currentUserId */}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                      setReplyingToId(null);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="text-[11px] text-destructive/80 hover:text-destructive transition-colors flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="h-3 w-3" /> Hapus
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Inline Reply Form */}
        {isReplying && (
          <div className="pl-4 sm:pl-6 border-l-2 border-primary/30 ml-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <CornerDownRight className="h-3 w-3 text-primary" /> Membalas{' '}
              <span className="font-semibold text-foreground">@{comment.userName}</span>
            </div>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasan..."
              className="min-h-[60px] text-xs"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingToId(null);
                  setReplyContent('');
                }}
                className="h-7 text-xs px-2.5"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!replyContent.trim() || createCommentMutation.isPending}
                onClick={() => handleSendReply(comment.id)}
                className="h-7 text-xs px-3"
              >
                {createCommentMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                )}
                Balas
              </Button>
            </div>
          </div>
        )}

        {/* Render Threaded Child Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-4 sm:pl-8 border-l-2 border-border/60 ml-2 space-y-3 pt-1">
            {comment.replies.map((child) => renderCommentCard(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" /> Komentar ({comments.length})
        </h4>
      </div>

      {/* Main Comment Input Form */}
      <form onSubmit={handleSendMainComment} className="space-y-2">
        <Textarea
          value={mainContent}
          onChange={(e) => setMainContent(e.target.value)}
          placeholder="Tulis komentar..."
          className="min-h-[60px] text-xs leading-relaxed"
        />
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!mainContent.trim() || createCommentMutation.isPending}
            className="h-8 text-xs px-3.5 flex items-center gap-1.5"
          >
            {createCommentMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Kirim
          </Button>
        </div>
      </form>

      {/* Comment List / States */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Memuat komentar...
        </div>
      ) : comments.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-border rounded-lg text-xs text-muted-foreground bg-muted/20">
          Belum ada komentar. Jadilah yang pertama berkomentar.
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {commentTree.map((comment) => renderCommentCard(comment))}
        </div>
      )}
    </div>
  );
}
