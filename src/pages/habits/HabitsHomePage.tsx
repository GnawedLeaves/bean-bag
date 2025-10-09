import { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { HabitsHomePageContainer } from "./HabitsStyles";

const HabitsHomePage = () => {
  return (
    <ThemeProvider theme={token}>
      <HabitsHomePageContainer></HabitsHomePageContainer>
      test commit
    </ThemeProvider>
  );
};

export default HabitsHomePage;
