import { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { HabitsHomePageContainer } from "./HabitsStyles";

const HabitsHomePage = () => {
  return (
    <ThemeProvider theme={token}>
      <HabitsHomePageContainer>Habits page</HabitsHomePageContainer>
    </ThemeProvider>
  );
};

export default HabitsHomePage;
