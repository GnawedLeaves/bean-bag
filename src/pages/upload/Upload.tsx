// src/pages/Upload.tsx
import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import EntryForm from "../../components/EntryForm";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const UploadContainer = styled.div`
  padding: 1rem;
`;

const Upload: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to home page after successful submission
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <UploadContainer>
      <EntryForm onSuccess={handleSuccess} />
    </UploadContainer>
  );
};

export default Upload;
