import React from "react";
import "./Speaker.css";

const Speaker = ({ isMusicPlaying, onClick }) => {
  const icon = isMusicPlaying ? "/icons/volume.png" : "/icons/mute.png";
  return (
    <div className="Speaker" onClick={onClick}>
      <img src={icon} alt="Speaker" />
    </div>
  );
};

export default Speaker;
