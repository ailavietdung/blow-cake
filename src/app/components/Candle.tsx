import React from "react";
import "./Candle.scss";

type Props = {
  elementPositions: { x: number; y: number }[];
  blowDetected: boolean;
};

const Candle = (props: Props) => {
  return (
    <div className="bd-candles">
      {props.elementPositions.map((position, i) => (
        <div
          className={`${position.y == 40 ? "candle-tens" : "candle"}`}
          style={{
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          key={i}
        >
          <div
            className={`flame ${props.blowDetected ? "fadeOut" : "flicker"}`}
          ></div>

          <div className="wick"></div>
          <div className={props.blowDetected ? "" : "drop"}></div>
        </div>
      ))}
    </div>
  );
};

export default Candle;
