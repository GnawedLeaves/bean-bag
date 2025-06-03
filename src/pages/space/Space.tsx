import { useEffect, useState } from "react";
import { getAstronomyPictureOfTheDay } from "../../services/nasa";
import { NasaApodObject } from "../../types/types";

const SpacePage = () => {
  const [apodData, setApodData] = useState<NasaApodObject[]>([]);
  const getAPOD = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const response = await getAstronomyPictureOfTheDay({
      //   count: 5,
      thumbs: true,
      date: formattedDate,
    });
    console.log({ response });
    if (Array.isArray(response)) setApodData(response);
    else {
      setApodData([response]);
    }
  };

  useEffect(() => {
    getAPOD();
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexDirection: "column",
          margin: 24,
        }}
      >
        {apodData.map((item) => {
          return (
            <div
              style={{
                border: "1px solid grey",
                borderRadius: 4,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 11, color: "grey" }}>{item.date}</div>
              <div style={{ fontSize: 24, fontWeight: "bold" }}>
                {item.title}
              </div>
              <img
                src={item.url}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  borderRadius: 4,
                }}
              />
              <div>{item.explanation}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SpacePage;
