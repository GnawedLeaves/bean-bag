// src/components/blog/EntryForm.tsx
import React, { useState } from "react";
import { Form, Input, Button, message, Typography, Space } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { BlogButton, BlogTopBar } from "../../../pages/blog/BlogStyles";
import {
  CloseOutlined,
  SignatureOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { useLocationHook } from "../../../hooks/useLocation";
import { uploadImages, createBlogEntry } from "../../../services/hygraph";
import styled from "styled-components";
import { token } from "../../../theme";

// Initialize the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

interface BlogEntryFormProps {
  onSuccess?: () => void;
  blogDate: string;
}

interface FormValues {
  title: string;
  content: string;
}
export const BlogUploadContainer = styled.div`
  background: ${(props) => props.theme.colorBgPink};
  min-height: 100vh;
  color: ${(props) => props.theme.text};
`;

export const BlogUploadBody = styled.div`
  padding: ${(props) => props.theme.paddingLg}px;
  padding-top: ${(props) => props.theme.paddingLg}px;
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 32px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
`;

export const TextArea = styled(Input.TextArea)`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  color: ${(props) => props.theme.text};
`;

export const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
`;

export const ImagePreview = styled.div`
  width: 100px;
  height: 100px;
  background-size: cover;
  background-position: center;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  position: relative;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  color: ${(props) => props.theme.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

export const StatusMessage = styled.div<{ error?: boolean }>`
  margin-top: 16px;
  padding: 16px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) =>
    props.error ? props.theme.colorBgRed : props.theme.colorBgGreen};
  color: ${(props) => props.theme.text};
`;

export const CustomTextArea = styled(Input.TextArea)`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  color: ${(props) => props.theme.text};

  &:focus,
  &.ant-input-focused {
    background: ${(props) => props.theme.colorBg};
    border-color: ${(props) => props.theme.borderColor};
    box-shadow: none;
  }
`;
const BlogEntryForm: React.FC<BlogEntryFormProps> = ({
  onSuccess,
  blogDate,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    error: boolean;
  } | null>(null);

  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocationHook();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Create preview URLs for images
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: FormValues) => {
    if (files.length === 0) {
      message.error("Please upload at least one image.");
      return;
    }

    console.log({ values });

    if (!location) {
      message.error(
        "Location data is required. Please enable location services."
      );
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ message: "Uploading images...", error: false });

      const imageIds = await uploadImages(files);
      setStatus({ message: "Creating entry...", error: false });

      const transformedLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Use the combined date time
      const dateAdded = getCombinedDateTime().toISOString();

      // Create the entry with uploaded image IDs
      await createBlogEntry(
        values.title,
        values.content,
        transformedLocation,
        imageIds,
        dateAdded
      );

      setStatus({ message: "Entry created successfully!", error: false });
      message.success("Entry created successfully!");

      // Reset form
      form.resetFields();
      setFiles([]);
      setPreviewUrls([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating entry:", error);
      const errorMessage = `Error creating entry: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      setStatus({
        message: errorMessage,
        error: true,
      });
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const locationDisplay = location
    ? `${location.city ? location.city + ", " : ""}${
        location.country ||
        `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      }`
    : "Getting location...";

  const getCombinedDateTime = () => {
    const now = dayjs().tz("Asia/Singapore");
    return dayjs(blogDate)
      .tz("Asia/Singapore")
      .hour(now.hour())
      .minute(now.minute())
      .second(now.second());
  };

  return (
    <BlogUploadContainer>
      <BlogUploadBody>
        <BlogTopBar>New Bean</BlogTopBar>

        <FormContainer>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: "Please enter a title" },
                { min: 3, message: "Title must be at least 3 characters long" },
                { max: 150, message: "Title must be less than 150 characters" },
              ]}
            >
              <Input
                placeholder="Enter title"
                style={{
                  border: "2px solid",
                  borderColor: form.getFieldError("title").length
                    ? "#ff4d4f"
                    : token.borderColor,
                  background: token.colorBg,
                  fontFamily: token.fontFamily,
                  color: token.text,
                  borderRadius: token.borderRadius,
                }}
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[
                { required: true, message: "Please enter content" },
                {
                  min: 10,
                  message: "Content must be at least 10 characters long",
                },
                {
                  max: 2000,
                  message: "Content must be less than 2000 characters",
                },
              ]}
            >
              <CustomTextArea
                placeholder="What's on your mind?"
                rows={6}
                maxLength={2000}
                style={{
                  fontFamily: token.fontFamily,
                  color: token.text,
                }}
              />
            </Form.Item>

            <Form.Item
              label="Images"
              required
              help="Please upload at least one image"
              style={{ marginBottom: 8 }}
            >
              <BlogButton
                as="label"
                style={{ cursor: "pointer", background: token.colorBg }}
              >
                <UploadOutlined /> Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </BlogButton>

              {previewUrls.length > 0 && (
                <ImagePreviewContainer>
                  {previewUrls.map((url, index) => (
                    <ImagePreview
                      key={index}
                      style={{ backgroundImage: `url(${url})` }}
                    >
                      <RemoveButton onClick={() => removeImage(index)}>
                        <CloseOutlined style={{ fontSize: 8 }} />
                      </RemoveButton>
                    </ImagePreview>
                  ))}
                </ImagePreviewContainer>
              )}
            </Form.Item>

            <Space
              direction="vertical"
              style={{ width: "100%", marginBottom: 16 }}
            >
              <div>
                <Text strong>Location: </Text>
                <Text type={locationError ? "danger" : "secondary"}>
                  {locationError ? "Error getting location" : locationDisplay}
                </Text>
              </div>

              <div>
                <Text strong>Timestamp: </Text>
                <Text type="secondary">{getCombinedDateTime().toString()}</Text>
              </div>
            </Space>

            <Form.Item>
              <BlogButton
                onClick={form.submit}
                style={{ width: "100%" }}
                disabled={locationLoading || submitting}
              >
                <SignatureOutlined />
                {submitting ? "Creating Bean..." : "Create Bean"}
              </BlogButton>
            </Form.Item>
          </Form>

          {status && (
            <StatusMessage error={status.error}>{status.message}</StatusMessage>
          )}
        </FormContainer>
      </BlogUploadBody>
    </BlogUploadContainer>
  );
};

export default BlogEntryForm;
