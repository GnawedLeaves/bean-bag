import { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { HabitsHomePageContainer } from "./HabitsStyles";

const HabitsHomePage = () => {
  return (
    <ThemeProvider theme={token}>
<<<<<<< HEAD
      <HabitsHomePageContainer></HabitsHomePageContainer>
      test commit
=======
      <HabitsHomePageContainer>Habits page</HabitsHomePageContainer>
>>>>>>> 3d756fd040ca5558c3575de5e53979ecd447e667
    </ThemeProvider>
  );
};

export default HabitsHomePage;
