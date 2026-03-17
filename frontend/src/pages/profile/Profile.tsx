import { Flex, Input, message, Upload } from "antd";
import { RcFile } from "antd/es/upload/interface";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CustomSpin,
  ImageLoading,
  PageLoading,
} from "../../components/loading/LoadingStates";
import { useUser } from "../../contexts/UserContext";
import { auth, db } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import { getAssetUrlById, uploadImages } from "../../services/hygraph";
import { subscribePushNotifs } from "../../services/pushNotifs/pushNotifs";
import { token } from "../../theme";
import {
  NotifButton,
  ProfileButton,
  ProfileDisplayName,
  ProfileDisplayPictureContainer,
  ProfileDisplayPictureInner,
  ProfileDisplayStatus,
  ProfileHero,
  ProfileMainContainer,
  ProfileSubtitle,
} from "./ProfileStyles";

interface ProfilePageProps {}
const ProfilePage = ({}: ProfilePageProps) => {
  const navigate = useNavigate();
  const { user, loading, getUserContextData } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [showAskNotfis, setShowAskNotifs] = useState<boolean>(false);

  const [newName, setNewName] = useState(user?.name || "");
  const [newStatus, setNewStatus] = useState(user?.status || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingLoading, setIsFetchingLoading] = useState(false);

  const fetchPushNotifsUsers = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "anniAppPushSubscriptions"),
        where("userId", "==", user.id),
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setShowAskNotifs(false);
      } else {
        setShowAskNotifs(true);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewStatus(user.status);
      fetchPushNotifsUsers();
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

  const handlePushTest = async () => {
    if (!user?.id) return;
    setIsFetchingLoading(true);
    try {
      console.log(`Testing push notifications for user: ${user.id}`);
      const res = await subscribePushNotifs(user.id);
      setIsFetchingLoading(false);
      setShowAskNotifs(false);
    } catch (error) {
      console.error("Subscription failed", error);
    }
  };

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

      <Flex vertical gap={32} align="center">
        {!showAskNotfis && <> Notifications enabled!</>}
        {isFetchingLoading ? (
          <CustomSpin />
        ) : (
          <NotifButton
            onClick={() => {
              handlePushTest();
            }}
          >
            Enable notifications
          </NotifButton>
        )}

        <ProfileButton
          onClick={() => {
            handleSignOut();
          }}
        >
          Sign Out
        </ProfileButton>
      </Flex>
    </ProfileMainContainer>
  );
};

export { ProfilePage };
