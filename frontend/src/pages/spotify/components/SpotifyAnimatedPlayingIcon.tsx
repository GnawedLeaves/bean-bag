import { useGSAP } from "@gsap/react";
import { Flex } from "antd";
import gsap from "gsap";
import { useRef } from "react";
import styled, { ThemeProvider } from "styled-components";
import { token } from "../../../theme";

interface SpotifyAnimatedPlayingIconProps {
  isPlaying?: boolean;
}

const Bar = styled.div`
  width: 3px;
  background: ${(props) => props.theme.colorBgTeal};
  /* Set a baseline height so they don't disappear before GSAP kicks in */
  height: 2px;
`;

const SpotifyAnimatedPlayingIcon = ({
  isPlaying = true,
}: SpotifyAnimatedPlayingIconProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const num = [1, 2, 3, 4, 5];

  useGSAP(
    () => {
      gsap.killTweensOf(".bar");

      if (isPlaying) {
        const bars = gsap.utils.toArray<HTMLElement>(".bar");

        bars.forEach((bar) => {
          const animateBar = () => {
            const randomHeight = gsap.utils.random(10, 22);
            const randomDuration = gsap.utils.random(0.2, 0.5);

            gsap.to(bar, {
              height: randomHeight,
              duration: randomDuration,
              ease: "sine.inOut",
              onComplete: () => {
                gsap.to(bar, {
                  height: 2,
                  duration: randomDuration,
                  ease: "sine.inOut",
                  onComplete: animateBar,
                });
              },
            });
          };

          animateBar();
        });
      } else {
        gsap.to(".bar", {
          height: 2,
          duration: 0.6,
          ease: "expo.out",
        });
      }
    },
    { dependencies: [isPlaying], scope: containerRef },
  );

  return (
    <ThemeProvider theme={token}>
      <Flex
        gap={2} // Slightly more gap looks cleaner for visualizers
        align="center"
        justify="center"
        style={{ height: "25px", width: "fit-content" }}
        ref={containerRef}
      >
        {num.map((bar) => (
          <Bar className="bar" key={bar} />
        ))}
      </Flex>
    </ThemeProvider>
  );
};

export default SpotifyAnimatedPlayingIcon;
