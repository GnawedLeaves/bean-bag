// src/pages/Upload.tsx
import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import BlogEntryForm from "../../components/blog/blogEntryComponents/BlogEntryForm";

const UploadContainer = styled.div`
  padding: 1rem;
`;

const BlogUploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to home page after successful submission
    setTimeout(() => {
      navigate(ROUTES.BLOGS.path);
    }, 1000);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(ROUTES.LOGIN.path);
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <UploadContainer>
      <BlogEntryForm onSuccess={handleSuccess} />
    </UploadContainer>
  );
};

export default BlogUploadPage;
