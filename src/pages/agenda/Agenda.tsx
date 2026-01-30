import {
  DeleteOutlined,
  EditOutlined,
  SignatureOutlined,
} from "@ant-design/icons";
import { Flex, Input, Popconfirm } from "antd";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { useUser } from "../../contexts/UserContext";
import { auth, db } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import { token } from "../../theme";
import { formatFirebaseDate } from "../../utils/utils";
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
  PopoverStyles,
} from "./AgendaStyles";

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
  const [outstandingItems, setOutstandingItems] = useState<ViewAgendaItem[]>(
    [],
  );
  const [completedItems, setCompletedItems] = useState<ViewAgendaItem[]>([]);

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
    try {
      const agendaRef = collection(db, "anniAppAgendaItems");
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

      const sorted = [...cleaned].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        const dateA = new Date(a.addedOn).getTime();
        const dateB = new Date(b.addedOn).getTime();
        return dateB - dateA;
      });
      setAgendaItems(sorted);
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
        user: user?.id,
        updatedOn: Timestamp.now(),
      };
      const docRef = await addDoc(
        collection(db, "anniAppAgendaItems"),
        newItem,
      );
      setNewContent("");
      await handleGetAllAgenda();
    } catch (e) {
      console.error("Error adding agenda item", e);
    }
  };

  const handleEditAgenda = async (id: string, newContent: string) => {
    try {
      const agendaDoc = doc(db, "anniAppAgendaItems", id);
      await updateDoc(agendaDoc, {
        content: newContent,
        updatedOn: Timestamp.now(),
      });
      await handleGetAllAgenda();
    } catch (e) {
      console.error("Error editing agenda item", e);
    }
  };

  const handleDeleteAgenda = async (id?: string) => {
    if (!id) return;
    try {
      const agendaDoc = doc(db, "anniAppAgendaItems", id);
      await deleteDoc(agendaDoc);
      //update local state instead
      setAgendaItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Error deleting agenda ");
    }
  };

  const handleToggleCompleteAgenda = async (id: string, completed: boolean) => {
    try {
      const agendaDoc = doc(db, "anniAppAgendaItems", id);
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
      (agenda) => agenda.completed === false,
    );
    setOutstandingItems(outstanding);
  };

  const getCompletedAgendas = () => {
    const completed = agendaItems.filter((agenda) => agenda.completed === true);
    setCompletedItems(completed);
  };

  /**
   * @deprecated Sorting function removed for now 30 Jan 2026
   */
  const handleSortItems = () => {
    const sorted = [...agendaItems].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const dateA = new Date(a.addedOn).getTime();
      const dateB = new Date(b.addedOn).getTime();
      return dateB - dateA;
    });

    setAgendaItems(sorted);
  };

  useEffect(() => {
    if (agendaItems.length > 0) {
      getOutstandingAgendas();
      getCompletedAgendas();
    }
  }, [agendaItems]);

  useEffect(() => {
    const fetchAndInit = async () => {
      await handleGetAllAgenda();
    };
    fetchAndInit();
  }, []);

  return (
    <ThemeProvider theme={token}>
      <PopoverStyles />
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
            <AgendaBodyTitle>Items</AgendaBodyTitle>
            {/* <SortButton
              background={token.colorBgYellow}
              onClick={() => {
                handleSortItems();
              }}
            >
              <ReloadOutlined />
              Sort items
            </SortButton> */}
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
                    // show={item.completed}
                    onClick={() => {
                      const newText = prompt("Edit agenda", item.content);
                      if (newText) handleEditAgenda(item.id!, newText);
                    }}
                  >
                    <EditOutlined />
                  </AgendaEditButton>

                  <Popconfirm
                    title="Delete agenda item"
                    description="Are you sure you want to delete this agenda item?"
                    onConfirm={() => handleDeleteAgenda(item.id)}
                    okText="Yes"
                    cancelText="No"
                    overlayClassName="agenda-delete-popover"
                  >
                    <AgendaEditButton
                      background={
                        item.completed
                          ? token.colorBgGreen
                          : token.colorBgYellow
                      }
                    >
                      <DeleteOutlined />
                    </AgendaEditButton>
                  </Popconfirm>
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
