import { Flex, Input, message, Upload } from "antd";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { UploadChangeParam } from "antd/es/upload";
import { RcFile, UploadFile } from "antd/es/upload/interface";
import {
  ProfileButton,
  ProfileDisplayName,
  ProfileDisplayPictureContainer,
  ProfileDisplayPictureInner,
  ProfileDisplayStatus,
  ProfileHero,
  ProfileMainContainer,
  ProfileSubtitle,
} from "./ProfileStyles";
import { useUser } from "../../contexts/UserContext";
import { token } from "../../theme";
import { getAssetUrlById, uploadImages } from "../../services/hygraph";
import {
  PageLoading,
  ImageLoading,
} from "../../components/loading/LoadingStates";
import React from "react";

interface ProfilePageProps {}
const ProfilePage = ({}: ProfilePageProps) => {
  const navigate = useNavigate();
  const { user, loading, getUserContextData } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const [newName, setNewName] = useState(user?.name || "");
  const [newStatus, setNewStatus] = useState(user?.status || "");

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewStatus(user.status);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate(ROUTES.LOGIN.path);
      } else {
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNameUpdate = async () => {
    if (!user?.id || newName === user?.name || newName === "") {
      setIsEditingName(false);
      return;
    }

    try {
      const userRef = doc(db, "anniAppUsers", user.id);
      await updateDoc(userRef, {
        name: newName,
        lastUpdated: Timestamp.now(),
      });
      console.log("Name updated successfully!");
      message.success("Name updated successfully!");
      setIsEditingName(false);
      getUserContextData();
    } catch (error) {
      console.error("Name update error:", error);
      message.error("Failed to update name");
    }
  };

  const handleStatusUpdate = async () => {
    if (!user?.id || newStatus === user?.name || newStatus === "") {
      setIsEditingStatus(false);
      return;
    }

    try {
      const userRef = doc(db, "anniAppUsers", user.id);
      await updateDoc(userRef, {
        status: newStatus,
        lastUpdated: Timestamp.now(),
      });
      console.log("newStatus updated successfully!");
      message.success("Status updated successfully!");
      setIsEditingStatus(false);
      getUserContextData();
    } catch (error) {
      console.error("Name update error:", error);
      message.error("Failed to update status");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      message.success("Signed out successfully");
      navigate(ROUTES.LOGIN.path);
    } catch (error) {
      console.error("Error signing out:", error);
      message.error("Failed to sign out");
    }
  };

  const handleImageUpload = async (file: RcFile): Promise<boolean> => {
    setIsUploading(true);
    try {
      // Upload to CMS
      const imageIds = await uploadImages([file]);
      if (!imageIds || imageIds.length === 0) {
        throw new Error("Failed to upload image");
      }

      const imageUrl = await getAssetUrlById(imageIds[0]);

      if (user?.id) {
        const userRef = doc(db, "anniAppUsers", user.id);
        await updateDoc(userRef, {
          displayPicture: imageUrl,
          lastUpdated: Timestamp.now(),
        });
        message.success("Profile picture updated successfully!");
        getUserContextData();
      }

      return true;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to update profile picture");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <ProfileMainContainer>
      <Flex
        vertical
        align="center"
        gap={8}
        // style={{ height: 150 }}
        justify="center"
      >
        <ProfileHero>PROFILE</ProfileHero>
        <ProfileSubtitle>
          Edit your details here like ur dp and name by clicking on them
        </ProfileSubtitle>
      </Flex>

      <Flex vertical align="center" gap={16} style={{ marginBottom: 64 }}>
        <ProfileDisplayPictureContainer>
          <Upload
            style={{ padding: 0, margin: 0 }}
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleImageUpload}
            maxCount={1}
          >
            {isUploading ? (
              <ImageLoading />
            ) : (
              user?.displayPicture && (
                <ProfileDisplayPictureInner
                  src={user.displayPicture}
                  alt="Profile"
                />
              )
            )}
          </Upload>
        </ProfileDisplayPictureContainer>

        {isEditingName ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={handleNameUpdate}
            onBlur={handleNameUpdate}
            maxLength={15}
            style={{
              width: "200px",
              textAlign: "center",
              background: token.colorBg,
              border: `2px solid ${token.borderColor}`,
              borderRadius: token.borderRadius,
              fontFamily: token.fontFamily,
              fontSize: token.fontSizeLgg,
            }}
          />
        ) : (
          <ProfileDisplayName onClick={() => setIsEditingName(true)}>
            {user?.name}
          </ProfileDisplayName>
        )}

        {isEditingStatus ? (
          <Input
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            onPressEnter={handleStatusUpdate}
            onBlur={handleStatusUpdate}
            maxLength={30}
            style={{
              width: "200px",
              textAlign: "center",
              background: token.colorBg,
              border: `2px solid ${token.borderColor}`,
              borderRadius: token.borderRadius,
              fontFamily: token.fontFamily,
              fontSize: token.fontSizeLg,
            }}
          />
        ) : (
          <ProfileDisplayStatus onClick={() => setIsEditingStatus(true)}>
            {user?.status}
          </ProfileDisplayStatus>
        )}
      </Flex>

      <ProfileButton
        onClick={() => {
          handleSignOut();
        }}
      >
        Sign Out
      </ProfileButton>
    </ProfileMainContainer>
  );
};

export { ProfilePage };
