// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

import { ApolloProvider } from "@apollo/client";
import { client } from "./services/hygraph";
import Home from "./pages/home/Home";
import Upload from "./pages/upload/Upload";
import Header from "./components/layout/Header";
import SpacePage from "./pages/space/Space";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f9f9f9;
  }
  
  /* Mobile-friendly responsive styles */
  html {
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
    
    input, textarea, button {
      font-size: 16px; /* Prevents iOS zoom on focus */
    }
  }

  /* Additional mobile-friendly styles */
  input, textarea, button {
    appearance: none;
    -webkit-appearance: none;
  }
`;

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <GlobalStyle />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/space" element={<SpacePage />} />

            {/* <Route path="/entries" element={<ViewEntries />} /> */}
          </Routes>
        </main>
        {/* <Footer /> */}
      </Router>
    </ApolloProvider>
  );
};

export default App;
