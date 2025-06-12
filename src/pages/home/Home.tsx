import React, { useEffect, useState } from "react";
import { Typography, Flex } from "antd";
import {
  HeartOutlined,
  BookOutlined,
  ExperimentOutlined,
  RocketOutlined,
  CalendarOutlined,
  CameraOutlined,
  StarOutlined,
  GiftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getBlogEntries } from "../../services/hygraph";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { token } from "../../theme";
import { ThemeProvider } from "styled-components";
import {
  HomeBigCardRefreshButton,
  HomePage,
  HomePartnerText,
  HomeStatsBigCard,
  HomeStatsBigCardDate,
  HomeStatsBigCardDisplayPic,
  HomeStatsBigCardLocation,
  HomeStatsBigCardName,
  HomeStatsBigCardStatus,
  HomeStatsCard,
  HomeStatsCardDescription,
  HomeStatsCardNumber,
  HomeStatsContainer,
} from "./HomeStyles";
import { useUser } from "../../contexts/UserContext";
import { useLocationHook } from "../../hooks/useLocation";
import { calculateDistance, formatFirebaseDate } from "../../utils/utils";
import { Timestamp } from "firebase/firestore";

const Home: React.FC = () => {
  const { user, userPartner, spotifyToken, loading, getUserContextData } =
    useUser();

  console.log({ user });
  const [daysTogetherCount, setDaysTogetherCount] = useState(0);
  const [gayLevel, setGayLevel] = useState<number>(0);
  const [blogCount, setBlogCount] = useState<number>(0);
  const [distance, setDistance] = useState<string>("");
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const navigate = useNavigate();
  const anniversaryDate = new Date("2024-06-14");

  const calculateDaysTogether = () => {
    const today = new Date();
    const timeDifference = today.getTime() - anniversaryDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    setDaysTogetherCount(daysDifference);
  };
  const calculateGayLevels = () => {
    const percentage = Math.floor(Math.random() * 100 + 69);
    setGayLevel(percentage);
  };
  const fetchRecentEntries = async () => {
    try {
      const results = await getBlogEntries();
      setRecentEntries(results.slice(0, 3));
      setBlogCount(results.length);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
    }
  };
  useEffect(() => {
    fetchRecentEntries();
    calculateDaysTogether();
    calculateGayLevels();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate(ROUTES.LOGIN.path);
      } else {
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user?.location && userPartner?.location) {
      const distance = calculateDistance(user.location, userPartner.location);
      console.log({ distance });
      setDistance(distance);
    }
  }, [user, userPartner]);

  const handleRefresh = () => {
    setIsSpinning(true);
    getUserContextData();
    setTimeout(() => {
      setIsSpinning(false);
    }, 5000);
  };

  return (
    <ThemeProvider theme={token}>
      <HomePage>
        <HomeStatsContainer>
          <HomeStatsBigCard>
            <HomePartnerText>Your Partner</HomePartnerText>
            <HomeBigCardRefreshButton
              isSpinning={isSpinning}
              onClick={handleRefresh}
            >
              <ReloadOutlined style={{ fontWeight: "bold" }} />
            </HomeBigCardRefreshButton>
            <HomeStatsBigCardDisplayPic src={userPartner?.displayPicture} />
            <Flex vertical gap={8}>
              <HomeStatsBigCardName>
                {userPartner?.name || "Marcus"}{" "}
              </HomeStatsBigCardName>
              <HomeStatsBigCardStatus>
                {userPartner?.status ?? "--"}
              </HomeStatsBigCardStatus>
              <HomeStatsBigCardLocation>
                {distance} away
              </HomeStatsBigCardLocation>
              <HomeStatsBigCardDate>
                {formatFirebaseDate(userPartner?.lastUpdated) || "--:--"}
              </HomeStatsBigCardDate>
            </Flex>
          </HomeStatsBigCard>
          {/* <HomeStatsBigCard>
            <HomeStatsBigCardDisplayPic src={user?.displayPicture} />
            <Flex vertical gap={8}>
              <HomeStatsBigCardName>
                {user?.name || "Marcus"}{" "}
              </HomeStatsBigCardName>
              <HomeStatsBigCardStatus>
                {user?.status ?? "--"}
              </HomeStatsBigCardStatus>
              <HomeStatsBigCardDate>
                {formatFirebaseDate(user?.lastUpdated) || "--:--"}
              </HomeStatsBigCardDate>
              <HomeStatsBigCardLocation>
                {distance} away
              </HomeStatsBigCardLocation>
            </Flex>
          </HomeStatsBigCard> */}
          <HomeStatsCard background={token.colorBgGreen}>
            <HomeStatsCardNumber>{daysTogetherCount}</HomeStatsCardNumber>
            <HomeStatsCardDescription>days togther</HomeStatsCardDescription>
          </HomeStatsCard>
          <HomeStatsCard background={token.colorBgYellow}>
            <HomeStatsCardNumber>{blogCount || "--"}</HomeStatsCardNumber>
            <HomeStatsCardDescription>bean entries</HomeStatsCardDescription>
          </HomeStatsCard>{" "}
          <HomeStatsCard background={token.colorBgVoliet}>
            <HomeStatsCardNumber>--</HomeStatsCardNumber>
            <HomeStatsCardDescription>agendas created</HomeStatsCardDescription>
          </HomeStatsCard>
          <HomeStatsCard background={token.colorBgPink}>
            <HomeStatsCardNumber>{gayLevel}%</HomeStatsCardNumber>
            <HomeStatsCardDescription>gay level</HomeStatsCardDescription>
          </HomeStatsCard>{" "}
        </HomeStatsContainer>
      </HomePage>
    </ThemeProvider>
  );
};

export default Home;
