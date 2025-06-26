import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const BedDetail = () => {
  const { id } = useParams();
  const [bed, setBed] = useState(null);

  useEffect(() => {
    const fetchBedDetail = async () => {
      try {
        const res = await axios.get(
          `https://medibed.onrender.com/api/v1/beds/${id}`,
          { withCredentials: true }
        );
        setBed(res.data);
      } catch (error) {
        console.error("Error fetching bed details:", error);
      }
    };
    fetchBedDetail();
  }, [id]);

  if (!bed)
    return (
      <SidebarLayout>
        <div className="text-center text-lg mt-10 font-semibold text-gray-500">
          Loading bed details...
        </div>
      </SidebarLayout>
    );

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Bed {bed.bedNumber} Details
        </h2>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-lg text-gray-700 mb-2">
            <strong>Type:</strong> {bed.type}
          </p>
          <p className="text-lg text-gray-700">
            <strong>Status:</strong> {bed.status}
          </p>
        </div>

        {bed.status === "Occupied" && (
          <div className="bg-red-50 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-red-700 mb-4">
              🧑‍⚕️ Current Patient
            </h3>
            <p><strong>Name:</strong> {bed.patient?.name}</p>
            <p><strong>Age:</strong> {bed.patient?.age}</p>
            <p><strong>Severity:</strong> {bed.patient?.severity}</p>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📜 Bed History</h3>
          {bed.history?.length > 0 ? (
            <ul className="space-y-4">
              {bed.history.map((entry, index) => (
                <li
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-sm border"
                >
                  <p><strong>Patient:</strong> {entry.patient?.name}</p>
                  <p><strong>Admitted:</strong> {new Date(entry.admittedAt).toLocaleDateString()}</p>
                  <p><strong>Discharged:</strong> {new Date(entry.dischargedAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No history available.</p>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default BedDetail;
