import React, { useEffect, useState } from "react";
import { Flex, Spin } from "antd";
import {
  ReloadOutlined,
  InfoCircleOutlined,
  SignatureOutlined,
  RedoOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getBlogEntries } from "../../services/hygraph";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { token } from "../../theme";
import { ThemeProvider } from "styled-components";
import {
  HomeBigCardRefreshButton,
  HomeFactContainer,
  HomeFactText,
  HomeFactTitle,
  HomePage,
  HomePartnerSubText,
  HomePartnerSubTitle,
  HomePartnerText,
  HomeSpaceContainer,
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
  HomeStreakDisplayPic,
  HomeStreakName,
  HomeStreakNumber,
  HomeStreaksContainer,
  HomeStreaksTitle,
  SpacePictureContainer,
  SpacePictureExplanation,
  SpacePictureTitle,
  StreakButton,
  StreakContainer,
} from "./HomeStyles";
import { useUser } from "../../contexts/UserContext";
import {
  addLineBreaksAfterSentences,
  calculateDistance,
  formatFirebaseDate,
} from "../../utils/utils";
import dayjs from "dayjs";
import { getAstronomyPictureOfTheDay } from "../../services/nasa";
import { NasaApodObject } from "../../types/nasaTypes";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { AgendaItemType } from "../agenda/Agenda";
import { getFact } from "../../services/ninjaApi/fact";
import { FactModel } from "../../types/ninjaApiTypes";
import { StreakModel } from "../../types/streakTypes";
import { AgendaAddButton } from "../agenda/AgendaStyles";

const Home: React.FC = () => {
  const { user, userPartner, spotifyToken, loading, getUserContextData } =
    useUser();

  console.log({ user });
  const [daysTogetherCount, setDaysTogetherCount] = useState<number>(0);
  const [gayLevel, setGayLevel] = useState<number>(0);
  const [blogCount, setBlogCount] = useState<number>(0);
  const [distance, setDistance] = useState<string>("");
  const [apodData, setApodData] = useState<NasaApodObject>();
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [ninjaFacts, setNinjaFacts] = useState<FactModel[]>([]);
  const navigate = useNavigate();
  const anniversaryDate = new Date("2024-06-14");
  const [agendaLength, setAgendaLength] = useState<number>(0);
  const [streakData, setStreakData] = useState<StreakModel[]>([]);

  const calculateDaysTogether = () => {
    const anniversaryDate = new Date("2024-06-14");
    const daysTogether = calculateDaysDifference(anniversaryDate);
    setDaysTogetherCount(daysTogether);
  };

  const calculateDaysDifference = (
    startDate: Date,
    endDate: Date = new Date()
  ): number => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    const timeDifference = end - start;
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
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

  const getAPOD = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    try {
      const response = (await getAstronomyPictureOfTheDay({
        thumbs: true,
        date: formattedDate,
      })) as NasaApodObject;

      const transformedResponse = {
        ...response,
        explanation: addLineBreaksAfterSentences(response.explanation),
      };

      setApodData(transformedResponse);
    } catch (e) {
      console.error("Error getting apod", e);
    }
  };

  const handleGetAllAgenda = async () => {
    try {
      const agendaRef = collection(db, "anniAppAgendaItems");
      const snapshot = await getDocs(agendaRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as AgendaItemType),
      }));
      setAgendaLength(data.length);
    } catch (e) {
      console.error("Error getting agenda items", e);
    }
  };

  const handleGetAllStreaks = async () => {
    try {
      const streaksRef = collection(db, "anniAppStreak");
      const snapshot = await getDocs(streaksRef);
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as StreakModel),
        }))
        .filter((streak) => !streak.isDelete);
      const transformedData = data.map((streak) => {
        let isHours = false;
        let timeDifference = calculateDaysDifference(streak.prevDate.toDate());
        if (timeDifference < 1) {
          const now = new Date();
          const streakDate = streak.prevDate.toDate();
          const timeDifferenceMs = now.getTime() - streakDate.getTime();
          const hours = Math.floor(timeDifferenceMs / (1000 * 3600));
          timeDifference = hours;
          isHours = true;
        }

        return {
          ...streak,
          timeDifference: timeDifference,
          isHours: isHours,
        };
      });
      setStreakData(transformedData);
    } catch (e) {
      console.error("Error getting streaks", e);
    }
  };

  const handleGetFact = async () => {
    const facts = await getFact();
    setNinjaFacts(facts);
  };

  const handleAddStreak = async () => {
    if (!user?.id) return;
    const streakName = prompt("Enter new streak name (max 20 chars):");
    if (!streakName || !streakName.trim()) return;
    if (streakName.trim().length > 20) {
      alert("Streak name must be 20 characters or less.");
      return;
    }

    try {
      const newStreak = {
        streakName: streakName.trim(),
        prevDate: new Date(),
        prevPrevDate: new Date(),
        userId: user.id,
        isDelete: false,
      };
      await addDoc(collection(db, "anniAppStreak"), newStreak);
      handleGetAllStreaks();
    } catch (e) {
      console.error("Error adding streak", e);
    }
  };

  const handleEditStreak = async (streak: StreakModel) => {
    const newName = prompt(
      "Edit streak name (max 20 chars):",
      streak.streakName
    );
    if (!newName || !newName.trim()) return;
    if (newName.trim().length > 20) {
      alert("Streak name must be 20 characters or less.");
      return;
    }
    try {
      const streakRef = doc(db, "anniAppStreak", streak.id!);
      await updateDoc(streakRef, { streakName: newName.trim() });
      handleGetAllStreaks();
    } catch (e) {
      console.error("Error editing streak", e);
    }
  };

  const handleDeleteStreak = async (streak: StreakModel) => {
    if (!window.confirm(`Delete streak "${streak.streakName}"?`)) return;
    try {
      const streakRef = doc(db, "anniAppStreak", streak.id!);
      await updateDoc(streakRef, { isDelete: true });
      handleGetAllStreaks();
    } catch (e) {
      console.error("Error deleting streak", e);
    }
  };

  const handleResetStreak = async (streak: StreakModel) => {
    if (!window.confirm(`Reset streak "${streak.streakName}"?`)) return;
    try {
      const streakRef = doc(db, "anniAppStreak", streak.id!);
      await updateDoc(streakRef, {
        prevDate: new Date(),
        prevPrevDate: streak.prevDate,
      });
      handleGetAllStreaks();
    } catch (e) {
      console.error("Error resetting streak", e);
    }
  };

  useEffect(() => {
    fetchRecentEntries();
    calculateDaysTogether();
    calculateGayLevels();
    handleGetAllAgenda();
    getAPOD();
    handleGetFact();
    handleGetAllStreaks();
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
          <HomePartnerText>Home</HomePartnerText>
          <HomeStatsBigCard>
            <HomeStatsBigCardDisplayPic src={user?.displayPicture} />
            <Flex vertical gap={8}>
              <HomeStatsBigCardName>
                {/* {user?.name || "Marcus"}{" "}
                 */}
                Me
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
          </HomeStatsBigCard>
          <HomeStatsBigCard>
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
          <HomeStatsCard background={token.colorBgGreen}>
            <HomeStatsCardNumber>{daysTogetherCount}</HomeStatsCardNumber>
            <HomeStatsCardDescription>days togther</HomeStatsCardDescription>
          </HomeStatsCard>
          <HomeStatsCard background={token.colorBgYellow}>
            <HomeStatsCardNumber>{blogCount || "--"}</HomeStatsCardNumber>
            <HomeStatsCardDescription>bean entries</HomeStatsCardDescription>
          </HomeStatsCard>{" "}
          <HomeStatsCard background={token.colorBgVoliet}>
            <HomeStatsCardNumber>{agendaLength}</HomeStatsCardNumber>
            <HomeStatsCardDescription>agenda items</HomeStatsCardDescription>
          </HomeStatsCard>
          <HomeStatsCard background={token.colorBgPink}>
            <HomeStatsCardNumber>{gayLevel}%</HomeStatsCardNumber>
            <HomeStatsCardDescription>gay level</HomeStatsCardDescription>
          </HomeStatsCard>{" "}
        </HomeStatsContainer>

        <HomeStreaksContainer>
          <Flex
            align="center"
            justify="space-between"
            style={{ marginBottom: 32, width: "100%" }}
          >
            <HomeStreaksTitle>Streaks</HomeStreaksTitle>
            <AgendaAddButton onClick={handleAddStreak}>
              Add Streak
            </AgendaAddButton>
          </Flex>

          <Flex gap={16} justify="space-between" wrap="wrap" align="center">
            {streakData.map((streak) => (
              <StreakContainer key={streak.id}>
                <HomeStreakDisplayPic
                  src={
                    streak.userId === user?.id
                      ? user?.displayPicture
                      : userPartner?.displayPicture
                  }
                />
                <Flex gap={8} align="center" vertical>
                  <HomeStreakName>{streak.streakName}</HomeStreakName>
                </Flex>
                <Flex align="center" vertical>
                  <HomeStreakNumber>
                    {streak.timeDifference || 0}
                  </HomeStreakNumber>{" "}
                  {streak.isHours ? "hours" : "days"}
                </Flex>

                <Flex gap={8} justify="space-evenly">
                  <StreakButton
                    style={{ background: token.colorBgPink }}
                    onClick={() => handleResetStreak(streak)}
                  >
                    <RedoOutlined />
                  </StreakButton>
                  <StreakButton onClick={() => handleEditStreak(streak)}>
                    <SignatureOutlined />
                  </StreakButton>

                  <StreakButton onClick={() => handleDeleteStreak(streak)}>
                    <DeleteOutlined />
                  </StreakButton>
                </Flex>
              </StreakContainer>
            ))}
            {streakData.length === 0 ? (
              <Flex align="center" justify="center" style={{ width: "100%" }}>
                No streaks yet
              </Flex>
            ) : (
              <></>
            )}
          </Flex>
        </HomeStreaksContainer>

        {ninjaFacts[0] && (
          <HomeFactContainer>
            <HomeFactTitle>Random Fact</HomeFactTitle>
            <HomeFactText>{ninjaFacts[0].fact}</HomeFactText>
          </HomeFactContainer>
        )}

        {apodData ? (
          <HomeSpaceContainer>
            <Flex vertical align="center" gap={8}>
              <HomePartnerSubTitle>The Daily</HomePartnerSubTitle>
              <HomePartnerText>Space Picture</HomePartnerText>
              <HomePartnerSubText>
                {dayjs().format("DD MMM YYYY")}
              </HomePartnerSubText>
            </Flex>
            <SpacePictureContainer src={apodData?.hdurl ?? apodData.url} />
            <Flex style={{ width: "100%" }} vertical gap={4}>
              <SpacePictureTitle>{apodData.title}</SpacePictureTitle>
              <SpacePictureExplanation>
                {apodData.explanation}
              </SpacePictureExplanation>
            </Flex>
            <Flex gap={8} align="center">
              <InfoCircleOutlined />
              Check back every day for a new picture!
            </Flex>
          </HomeSpaceContainer>
        ) : (
          <HomeSpaceContainer>
            <Spin></Spin>
          </HomeSpaceContainer>
        )}
      </HomePage>
    </ThemeProvider>
  );
};

export default Home;
