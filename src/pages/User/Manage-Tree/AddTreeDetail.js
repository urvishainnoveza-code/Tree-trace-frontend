import React, { useState, useEffect } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";
import axiosInstance from "../../../utils/axiosInstance";
import { toastError, toastSuccess } from "../../../utils/alertHelper";

const defaultData = {
  assignmentId: "",
  treename: "",
  country: "",
  state: "",
  city: "",
  area: "",
  address: "",
  plantedCount: "",
  cage: "No",
  watering: "No",
  fertilizer: "No",
  fertilizerDetail: "",
  healthStatus: "planted",
  images: [],
};

const AddTreeDetail = ({ show, onClose, onSaved, initialData }) => {
  const [formData, setFormData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const isEditMode = initialData?._id; // Edit mode if plantation _id exists

  useEffect(() => {
    if (!show) return;

    if (initialData?._id) {
      // Edit mode - populate from existing plantation
      setFormData({
        assignmentId: initialData.assign?._id || "",
        treename: initialData.assign?.treeName?.name || "",
        country: initialData.assign?.country?.name || "",
        state: initialData.assign?.state?.name || "",
        city: initialData.assign?.city?.name || "",
        area: initialData.assign?.area?.name || "",
        address: initialData.address || "",
        plantedCount: initialData.plantedCount || "",
        cage: initialData.cage ? "Yes" : "No",
        watering: initialData.watering ? "Yes" : "No",
        fertilizer: initialData.fertilizer ? "Yes" : "No",
        fertilizerDetail: initialData.fertilizerDetail || "",
        healthStatus: initialData.healthStatus || "planted",
        images: [],
      });
      setExistingImages(initialData.images || []);
      setImagePreview([]);
    } else if (initialData?.assignmentId) {
      // Create mode from ViewTask - use assignment data
      setFormData((prev) => ({
        ...prev,
        assignmentId: initialData.assignmentId,
        treename: initialData.treename || "",
        country: initialData.country || "",
        state: initialData.state || "",
        city: initialData.city || "",
        area: initialData.area || "",
        images: [],
      }));
      setExistingImages([]);
      setImagePreview([]);
    } else {
      setFormData(defaultData);
      setExistingImages([]);
      setImagePreview([]);
    }
  }, [initialData, show]);

  const fields = [
    {
      label: "Tree Name",
      name: "treename",
      required: true,
      disabled: true,
    },
    { label: "Country", name: "country", disabled: true },
    { label: "State", name: "state", disabled: true },
    { label: "City", name: "city", disabled: true },
    { label: "Area", name: "area", disabled: true },
    {
      label: "Address",
      name: "address",
      type: "textarea",
      required: true,
      placeholder: "Enter plantation address",
    },
    {
      label: "Planted Count",
      name: "plantedCount",
      type: "number",
      required: true,
      min: 1,
      placeholder: "Number of trees planted",
    },
    {
      label: "Cage",
      name: "cage",
      type: "radio",
      required: true,
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      label: "Watering",
      name: "watering",
      type: "radio",
      required: true,
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      label: "Fertilizer",
      name: "fertilizer",
      type: "radio",
      required: true,
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      label: "Fertilizer Detail",
      name: "fertilizerDetail",
      type: "textarea",
      placeholder: "Enter fertilizer details (if applicable)",
    },
    {
      label: "Health Status",
      name: "healthStatus",
      type: "select",
      options: [
        { label: "Planted", value: "planted" },
        { label: "Growing", value: "growing" },
        { label: "Healthy", value: "healthy" },
        { label: "Diseased", value: "diseased" },
      ],
    },
    {
      label: "Images",
      name: "images",
      type: "file",
      multiple: true,
      accept: "image/*",
      placeholder: "Upload plantation photos (max 5 images, 5MB each)",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
      const fileArray = Array.from(files).slice(0, 5);

      // Validate file sizes
      const oversizedFiles = fileArray.filter(
        (file) => file.size > MAX_FILE_SIZE,
      );

      if (oversizedFiles.length > 0) {
        toastError(
          `File too large! Each image must be under 5MB. ${oversizedFiles.length} file(s) exceeded limit.`,
        );
        e.target.value = ""; // Clear the file input
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: fileArray,
      }));

      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreview(previews);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const {
        assignmentId,
        plantedCount,
        cage,
        watering,
        fertilizer,
        ...otherData
      } = formData;

      if (!assignmentId) {
        toastError("Assignment ID is missing");
        return;
      }

      if (!plantedCount || plantedCount <= 0) {
        toastError("Planted count must be greater than 0");
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append("assign", assignmentId);
      formDataObj.append("address", otherData.address);
      formDataObj.append("plantedCount", plantedCount);
      formDataObj.append("cage", cage === "Yes" ? "true" : "false");
      formDataObj.append("watering", watering === "Yes" ? "true" : "false");
      formDataObj.append("fertilizer", fertilizer === "Yes" ? "true" : "false");
      formDataObj.append("fertilizerDetail", otherData.fertilizerDetail);
      formDataObj.append("healthStatus", otherData.healthStatus);

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataObj.append("images", image);
        });
      }

      let response;
      if (isEditMode) {
        // Update existing plantation
        response = await axiosInstance.put(
          `/plantation/${initialData._id}`,
          formDataObj,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        // Create new plantation
        response = await axiosInstance.post("/plantation", formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data?.Status === 1) {
        toastSuccess(
          response.data?.Message ||
            `Tree plantation ${isEditMode ? "updated" : "created"} successfully`,
        );
        onSaved(response.data?.Plantation);
        onClose();
      } else {
        toastError(
          response.data?.Message ||
            `Failed to ${isEditMode ? "update" : "create"} plantation`,
        );
      }
    } catch (error) {
      toastError(
        error.response?.data?.Message ||
          `Error ${isEditMode ? "updating" : "creating"} tree plantation`,
      );
      console.error("Plantation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonModel
      show={show}
      title={isEditMode ? "Edit Tree Plantation" : "Add Tree Plantation"}
      onClose={onClose}
      onSave={handleSubmit}
      saveText={loading ? "Saving..." : "Save Plantation"}
      isSaving={loading}
    >
      <CommonForm fields={fields} formData={formData} onChange={handleChange} />

      <div className="alert alert-info mt-2 py-2">
        <small>
          <strong>📷 Image Requirements:</strong> Upload up to 5 images, max 5MB
          each. Supported formats: JPG, PNG, GIF
        </small>
      </div>

      {existingImages.length > 0 && (
        <div className="mt-3">
          <h6>Existing Images:</h6>
          <div className="d-flex gap-2 flex-wrap">
            {existingImages.map((imgPath, idx) => (
              <img
                key={idx}
                src={`${axiosInstance.defaults.baseURL}${imgPath}`}
                alt={`existing-${idx}`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  border: "2px solid #28a745",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {imagePreview.length > 0 && (
        <div className="mt-3">
          <h6>New Image Previews:</h6>
          <div className="d-flex gap-2 flex-wrap">
            {imagePreview.map((preview, idx) => (
              <img
                key={idx}
                src={preview}
                alt={`preview-${idx}`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </CommonModel>
  );
};

export default AddTreeDetail;
