// src/pages/Upload.tsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import EntryForm from "../../components/EntryForm";

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

  return (
    <UploadContainer>
      <EntryForm onSuccess={handleSuccess} />
    </UploadContainer>
  );
};

export default Upload;
