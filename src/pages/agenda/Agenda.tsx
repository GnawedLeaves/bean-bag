import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import {
  AgendaAddButton,
  AgendaBodyContainer,
  AgendaBodyTitle,
  AgendaContentContainer,
  AgendaDate,
  AgendaDisplayPic,
  AgendaEditButton,
  AgendaHeroContainer,
  AgendaItem,
  AgendaMain,
  AgendaStatsCard,
  AgendaStatsCardDescription,
  AgendaStatsCardNumber,
  AgendaTitle,
  SortButton,
} from "./AgendaStyles";
import { token } from "../../theme";
import {
  collection,
  Timestamp,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { useUser } from "../../contexts/UserContext";
import { onAuthStateChanged } from "firebase/auth";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import {
  CloseOutlined,
  EditOutlined,
  ReloadOutlined,
  SignatureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Flex, Input, Spin } from "antd";
import { formatFirebaseDate } from "../../utils/utils";

export interface AgendaItemType {
  id?: string;
  addedOn: Timestamp;
  completedOn?: Timestamp;
  content: string;
  user: string;
  completed: boolean;
  updatedOn: Timestamp;
}

interface ViewAgendaItem {
  id?: string;
  addedOn: string;
  completedOn: string;
  content: string;
  user: string;
  completed: boolean;
  updatedOn: Timestamp;
}

const AgendaPage = () => {
  const { user, userPartner, spotifyToken, loading } = useUser();

  const [agendaItems, setAgendaItems] = useState<ViewAgendaItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [outstandingItems, setOutstandingItems] = useState<ViewAgendaItem[]>(
    []
  );
  const [completedItems, setCompletedItems] = useState<ViewAgendaItem[]>([]);
  const [sortingOrder, setSortingOrder] = useState<string[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate(ROUTES.LOGIN.path);
      } else {
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGetAllAgenda = async () => {
    setActionLoading(true);
    try {
      const agendaRef = collection(db, "anniAppAgendaItemsDemo");
      const snapshot = await getDocs(agendaRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as AgendaItemType),
      }));
      const cleaned = data.map((item) => ({
        ...item,
        addedOn: formatFirebaseDate(item.addedOn),
        completedOn: formatFirebaseDate(item.completedOn),
      }));

      if (isFirstLoad) {
        const sorted = [...cleaned].sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }

          const dateA = new Date(a.addedOn).getTime();
          const dateB = new Date(b.addedOn).getTime();
          return dateB - dateA;
        });
        setAgendaItems(sorted);
        setActionLoading(false);
        setIsFirstLoad(false);
      } else {
        const sorted = [...cleaned].sort((a, b) => {
          const indexA = sortingOrder.indexOf(a.id!);
          const indexB = sortingOrder.indexOf(b.id!);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setAgendaItems(sorted);

        setActionLoading(false);
      }
    } catch (e) {
      console.error("Error getting agenda items", e);
    }
  };

  const handleAddAgenda = async () => {
    if (!newContent.trim() || !user) return;
    try {
      const newItem: Omit<AgendaItemType, "id"> = {
        addedOn: Timestamp.now(),
        completed: false,
        content: newContent,
        user: user?.id, // Replace with current user ID if using auth
        updatedOn: Timestamp.now(),
      };
      const docRef = await addDoc(
        collection(db, "anniAppAgendaItemsDemo"),
        newItem
      );
      setNewContent("");
      await handleGetAllAgenda();
      setSortingOrder((prev) => [docRef.id, ...prev]);
    } catch (e) {
      console.error("Error adding agenda item", e);
    }
  };

  const handleEditAgenda = async (id: string, newContent: string) => {
    try {
      const agendaDoc = doc(db, "anniAppAgendaItemsDemo", id);
      await updateDoc(agendaDoc, {
        content: newContent,
        updatedOn: Timestamp.now(),
      });
      await handleGetAllAgenda();
      setSortingOrder((prev) => {
        const filtered = prev.filter((itemId) => itemId !== id);
        return [id, ...filtered];
      });
    } catch (e) {
      console.error("Error editing agenda item", e);
    }
  };

  const handleToggleCompleteAgenda = async (id: string, completed: boolean) => {
    try {
      const agendaDoc = doc(db, "anniAppAgendaItemsDemo", id);
      await updateDoc(agendaDoc, {
        completed: !completed,
        completedOn: Timestamp.now(),
        updatedOn: Timestamp.now(),
      });
      await handleGetAllAgenda();
    } catch (e) {
      console.error("Error completing agenda item", e);
    }
  };

  const getOutstandingAgendas = () => {
    const outstanding = agendaItems.filter(
      (agenda) => agenda.completed === false
    );
    console.log({ outstanding });
    setOutstandingItems(outstanding);
  };

  const getCompletedAgendas = () => {
    const completed = agendaItems.filter((agenda) => agenda.completed === true);
    console.log({ completed });
    setCompletedItems(completed);
  };

  const handleSortItems = () => {
    const sorted = [...agendaItems].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const dateA = new Date(a.addedOn).getTime();
      const dateB = new Date(b.addedOn).getTime();
      return dateB - dateA;
    });

    console.log({ sorted });

    setAgendaItems(sorted);
    setSortingOrder(sorted.map((item) => item.id!));
  };

  useEffect(() => {
    if (agendaItems.length > 0) {
      getOutstandingAgendas();
      getCompletedAgendas();
      // handleSortItems();
    }
  }, [agendaItems]);

  useEffect(() => {
    const fetchAndInit = async () => {
      await handleGetAllAgenda();
      setSortingOrder((prev) => {
        if (prev.length === 0) {
          return agendaItems.map((item) => item.id!);
        }
        return prev;
      });
    };
    fetchAndInit();
  }, []);

  return (
    <ThemeProvider theme={token}>
      <AgendaMain>
        <AgendaHeroContainer>
          <AgendaTitle>AGENDA</AgendaTitle>
          <Flex gap={8}>
            <AgendaStatsCard background={token.colorBgOrange}>
              <AgendaStatsCardNumber>
                {outstandingItems.length}
              </AgendaStatsCardNumber>
              <AgendaStatsCardDescription>
                outstanding
              </AgendaStatsCardDescription>
            </AgendaStatsCard>
            <AgendaStatsCard background={token.colorBgGreen}>
              <AgendaStatsCardNumber>
                {completedItems.length}
              </AgendaStatsCardNumber>
              <AgendaStatsCardDescription>completed</AgendaStatsCardDescription>
            </AgendaStatsCard>
            <AgendaStatsCard background={token.colorBgVoliet}>
              <AgendaStatsCardNumber>
                {agendaItems.length}
              </AgendaStatsCardNumber>
              <AgendaStatsCardDescription>total</AgendaStatsCardDescription>
            </AgendaStatsCard>
          </Flex>
        </AgendaHeroContainer>
        <AgendaBodyContainer>
          <Flex
            gap={16}
            align="center"
            justify="space-between"
            style={{ width: "100%" }}
          >
            <AgendaBodyTitle>Yapping Beans</AgendaBodyTitle>
            <SortButton
              background={token.colorBgYellow}
              onClick={() => {
                handleSortItems();
              }}
            >
              <ReloadOutlined />
              Sort items
            </SortButton>
          </Flex>

          <Flex gap={8}>
            <Input
              style={{
                border: `2px solid ${token.borderColor}`,
                borderRadius: token.borderRadius,
                background: token.colorBg,
                fontFamily: token.fontFamily,
              }}
              onChange={(e) => setNewContent(e.target.value)}
              type="text"
              value={newContent}
              placeholder="New agenda item"
              maxLength={50}
            />
            <AgendaAddButton
              onClick={() => {
                handleAddAgenda();
              }}
            >
              {/* {actionLoading ? <Spin size="default" /> : <SignatureOutlined />} */}
              <SignatureOutlined />
            </AgendaAddButton>
          </Flex>

          <Flex vertical gap={16}>
            {agendaItems.map((item) => {
              return (
                <Flex align="center" gap={8}>
                  <AgendaItem
                    background={
                      item.completed ? token.colorBgGreen : token.colorBgYellow
                    }
                    onClick={() => {
                      handleToggleCompleteAgenda(item.id!, item.completed);
                    }}
                  >
                    <AgendaDisplayPic
                      src={
                        item.user === user?.id
                          ? user.displayPicture
                          : userPartner?.displayPicture
                      }
                    />
                    <AgendaContentContainer>
                      {item.content}
                    </AgendaContentContainer>
                    <AgendaDate>
                      <div>{item.addedOn}</div>

                      {/* <div>{item.addedOn}</div> */}
                    </AgendaDate>
                  </AgendaItem>

                  <AgendaEditButton
                    background={
                      item.completed ? token.colorBgGreen : token.colorBgYellow
                    }
                    show={item.completed}
                    onClick={() => {
                      const newText = prompt("Edit agenda", item.content);
                      if (newText) handleEditAgenda(item.id!, newText);
                    }}
                  >
                    <EditOutlined />
                  </AgendaEditButton>
                </Flex>
              );
            })}

            {agendaItems.length === 0 && <div>Oops no agenda items yet!</div>}
          </Flex>
        </AgendaBodyContainer>
      </AgendaMain>
    </ThemeProvider>
  );
};

export default AgendaPage;
