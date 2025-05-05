import React, { useState } from "react";
import axios from "axios";

const CreateMeeting = () => {
  const [meetingInfo, setMeetingInfo] = useState(null);

  const handleCreate = async () => {
    const access_token = localStorage.getItem("zoom_token");

    const res = await axios.post("http://localhost:5000/api/zoom/create-meeting", {
      access_token,
      topic: "Team Sync",
    });

    setMeetingInfo(res.data);
  };

  return (
    <div>
      <h2>Create a Zoom Meeting</h2>
      <button onClick={handleCreate}>Create</button>
      {meetingInfo && (
        <div>
          <p>Join URL: <a href={meetingInfo.join_url} target="_blank">{meetingInfo.join_url}</a></p>
        </div>
      )}
    </div>
  );
};

export default CreateMeeting;
