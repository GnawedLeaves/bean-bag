import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { AgendaMain } from "./AgendaStyles";
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

interface AgendaItem {
  id?: string;
  addedOn: Timestamp;
  completedOn?: Timestamp;
  content: string;
  user: string;
  completed: boolean;
}

interface ViewAgendaItem {
  id?: string;
  addedOn: string;
  completedOn: string;
  content: string;
  user: string;
  completed: boolean;
}

const AgendaPage = () => {
  const { user, userPartner, spotifyToken, loading } = useUser();

  console.log({ user });
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [newContent, setNewContent] = useState("");
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

  // ✅ Fetch all agenda items
  const handleGetAllAgenda = async () => {
    try {
      const agendaRef = collection(db, "anniAppAgendaItems");
      const snapshot = await getDocs(agendaRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as AgendaItem),
      }));
      setAgendaItems(data);
    } catch (e) {
      console.error("Error getting agenda items", e);
    }
  };

  const handleAddAgenda = async () => {
    if (!newContent.trim() || !user) return;
    try {
      const newItem: Omit<AgendaItem, "id"> = {
        addedOn: Timestamp.now(),
        completed: false,
        content: newContent,
        user: user?.id, // Replace with current user ID if using auth
      };
      await addDoc(collection(db, "anniAppAgendaItems"), newItem);
      setNewContent("");
      await handleGetAllAgenda();
    } catch (e) {
      console.error("Error adding agenda item", e);
    }
  };

  const handleEditAgenda = async (id: string, newContent: string) => {
    try {
      const agendaDoc = doc(db, "anniAppAgendaItems", id);
      await updateDoc(agendaDoc, { content: newContent });
      await handleGetAllAgenda();
    } catch (e) {
      console.error("Error editing agenda item", e);
    }
  };

  // ✅ Mark agenda as completed
  const handleCompleteAgenda = async (id: string) => {
    try {
      const agendaDoc = doc(db, "anniAppAgendaItems", id);
      await updateDoc(agendaDoc, {
        completed: true,
        completedOn: Timestamp.now(),
      });
      await handleGetAllAgenda();
    } catch (e) {
      console.error("Error completing agenda item", e);
    }
  };

  useEffect(() => {
    handleGetAllAgenda();
  }, []);

  return (
    <ThemeProvider theme={token}>
      <AgendaMain>
        <h2>Agenda</h2>

        <div>
          <input
            type="text"
            value={newContent}
            placeholder="Add new item..."
            onChange={(e) => setNewContent(e.target.value)}
          />
          <button onClick={handleAddAgenda}>Add</button>
        </div>

        <ul>
          {agendaItems.map((item) => (
            <li key={item.id}>
              <p>
                <strong>{item.content}</strong>{" "}
                {item.completed && "(Completed)"}
              </p>
              <button onClick={() => handleCompleteAgenda(item.id!)}>
                Mark Complete
              </button>
              <button
                onClick={() => {
                  const newText = prompt("Edit content", item.content);
                  if (newText) handleEditAgenda(item.id!, newText);
                }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      </AgendaMain>
    </ThemeProvider>
  );
};

export default AgendaPage;
