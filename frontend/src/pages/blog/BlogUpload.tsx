import React, { useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import BlogEntryForm from "../../components/blog/blogEntryComponents/BlogEntryForm";
import dayjs from "dayjs";

const UploadContainer = styled.div`
  padding: 1rem;
  background: ${(props) => props.theme.colorBgPink};
`;

const BlogUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { blogDate } = useParams();

  const handleSuccess = () => {
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
      <BlogEntryForm
        onSuccess={handleSuccess}
        blogDate={blogDate ?? dayjs().format("YYYY-MM-DD")}
      />
    </UploadContainer>
  );
};

export default BlogUploadPage;
