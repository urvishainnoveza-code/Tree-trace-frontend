import React from 'react'
import "../../../App.css";
const TreeProfile = () => {
    const tree = {
        treename: "Neem",
        country: "India",
        state: "Gujarat",
        city: "Surat",
        area: "Adajan",
        cage: "Yes",
        watering: "Daily",
        date: "2026-02-10",
        photo: "image1.jpg",
    };
    

  return (
      <div>
          <div className="profile-page container mt-4">
              <div className="card profile-card">
                    <div className="card-body">
      <h2>Tree Profile</h2>
                      <div className="row">
                          <div className="profile-row"></div>
        <p><strong>Tree Name:</strong> {tree.treename}</p>
        <p><strong>Country:</strong> {tree.country}</p>
        <p><strong>State:</strong> {tree.state}</p>
        <p><strong>City:</strong> {tree.city}</p>
        <p><strong>Area:</strong> {tree.area}</p>
        <p><strong>Cage:</strong> {tree.cage}</p>
        <p><strong>Watering:</strong> {tree.watering}</p>
        <p><strong>Date:</strong> {tree.date}</p>
        <img src={tree.photo} alt="Tree" className="img-fluid" />
          </div>
                  </div>
              </div>
          </div>
      </div>
      
  );
    
    
}
export default TreeProfile;
