import { Flex, message } from "antd";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import {
  ProfileButton,
  ProfileDisplayName,
  ProfileDisplayPictureContainer,
  ProfileDisplayPictureInner,
  ProfileHero,
  ProfileMainContainer,
  ProfileSubtitle,
} from "./ProfileStyles";
import { useUser } from "../../contexts/UserContext";

interface SettingPageProps {}
const SettingsPage = ({}: SettingPageProps) => {
  const navigate = useNavigate();
  const { user, userPartner, spotifyToken, loading } = useUser();

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
          Edit your details here like ur dp and name
        </ProfileSubtitle>
      </Flex>

      <Flex vertical align="center" gap={32}>
        <ProfileDisplayPictureContainer>
          <ProfileDisplayPictureInner src={user?.displayPicture} />
        </ProfileDisplayPictureContainer>
        <ProfileDisplayName>{user?.name}</ProfileDisplayName>
      </Flex>

      <ProfileButton
        onClick={() => {
          handleSignOut();
        }}
      >
        Sign Out{" "}
      </ProfileButton>
    </ProfileMainContainer>
  );
};

export { SettingsPage };
