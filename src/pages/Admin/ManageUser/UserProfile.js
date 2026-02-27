import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../App.css";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/users/${id}`,
        );

        console.log(res.data);
        setUser(res.data.user);
      } catch (err) {
        console.error("User fetch error", err);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <div className="profile-page container mt-4">
      <div className="card profile-card">
        <div className="card-body">
          {user ? (
            <div className="row">
              <div className="profile-row">
                <div className="left">
                  <h4>
                    {user.firstName} {user.lastName}
                  </h4>
                  <p>Email: {user.email}</p>
                </div>

                <div className="right">
                  <h5>Addresimps</h5>
                  <p>Area: {user.address?.area?.areaname}</p>
                  <p>City: {user.address?.city?.cityname}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
