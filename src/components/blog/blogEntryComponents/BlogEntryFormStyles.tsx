// src/components/blog/EntryFormStyles.ts
import { Spin } from "antd";
import styled from "styled-components";

// Change Form to FormContainer
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const TextArea = styled.textarea`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 200px;
`;

export const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0055aa;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const ImagePreview = styled.div`
  width: 100px;
  height: 100px;
  background-size: cover;
  background-position: center;
  position: relative;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StatusMessage = styled.div<{ error?: boolean }>`
  padding: 0.5rem;
  margin-top: 1rem;
  background-color: ${(props) => (props.error ? "#ffcccc" : "#ccffcc")};
  border-radius: 4px;
`;

export const BlogEntryStyledSpinner = styled(Spin)`
  .ant-spin-dot-item {
    background-color: ${(props) => props.theme.colorBgPink};
  }
`;
