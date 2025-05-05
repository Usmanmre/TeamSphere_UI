import React, { useEffect } from "react";
import { ZoomMtg } from "@zoomus/websdk";

const JoinZoomMeeting = ({ meetingId, userName }) => {
  useEffect(() => {
    ZoomMtg.setZoomJSLib("https://source.zoom.us/zoom-meeting-1.9.5.min.js", "/av");

    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();

    // Once the SDK is prepared, join the meeting
    ZoomMtg.init({
      leaveUrl: "http://www.yourapp.com",
      isSupportAV: true,
      success: () => {
        ZoomMtg.join({
          meetingNumber: meetingId,
          userName: userName,
          signature: "GENERATED_SIGNATURE", // This signature should be generated from your backend
          apiKey: "YOUR_API_KEY",
          userEmail: "user@example.com",
          passWord: "MEETING_PASSWORD", // Optional
        });
      },
      error: (error) => {
        console.error("Error initializing Zoom SDK:", error);
      },
    });
  }, [meetingId, userName]);

  return <div id="zmmtg-root"></div>; // This div will hold the Zoom meeting UI
};

export default JoinZoomMeeting;
