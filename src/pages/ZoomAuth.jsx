import React, { useEffect } from "react";
import axios from "axios";

const ZoomAuth = () => {
  useEffect(() => {
    const getToken = async () => {
      const query = new URLSearchParams(window.location.search);
      const code = query.get("code");

      if (code) {
        const res = await axios.get(
          `http://localhost:5000/api/zoom/callback?code=${code}`
        );
        const { access_token } = res.data;
        localStorage.setItem("zoom_token", access_token);
        window.location.href = "/create-meeting";
      }
    };

    getToken();
  }, []);

  return <p>Authenticating with Zoom...</p>;
};

export default ZoomAuth;
