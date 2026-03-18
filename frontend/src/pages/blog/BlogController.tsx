import { Timestamp } from "firebase/firestore";
import { useCallback } from "react";
import { BlogComment } from "../../types/blogTypes";

interface AddBeanCommentProps {
  entryId: string;
  newComment: Record<string, any>;
  userId: string;
}

interface BlogControllerProps {
  onAddBeanComment: (entryId: string) => void;
}

const BlogController = ({ onAddBeanComment }: BlogControllerProps) => {
  const API_BASE_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const addBeanComment = useCallback(
    async ({ entryId, newComment, userId }: AddBeanCommentProps) => {
      if (!newComment[entryId] || !userId) return;
      const commentData: BlogComment = {
        blogEntryId: entryId,
        userId: userId,
        content: newComment[entryId].content.trim(),
        dateAdded: Timestamp.now(),
        isDelete: false,
        blogTitle: newComment[entryId].blogTitle,
      };
      try {
        // await addDoc(collection(db, "anniAppBeansComments"), commentData);
        const response = await fetch(`${API_BASE_URL}/add-bean-comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(commentData),
        });

        if (!response.ok) {
          window.alert("Error adding comment from controller");
          throw new Error("Failed to add comment");
        }
        onAddBeanComment(entryId);
      } catch (e) {
        window.alert("Error adding comment from controller: " + e);
        console.error("Error adding comment", e);
      }
    },
    [onAddBeanComment],
  );

  return { addBeanComment };
};

export default BlogController;
