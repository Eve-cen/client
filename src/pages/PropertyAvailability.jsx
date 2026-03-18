import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Button from "../components/Button";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import Select from "react-select";

const PropertyAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  // Load all properties for the selector
  useEffect(() => {
    apiFetch({ endpoint: "/properties" }).then((data) => {
      setProperties(data.properties || []);
    });
  }, []);

  // Load availability whenever selected property changes
  useEffect(() => {
    if (!id) return;
    apiFetch({ endpoint: `/availability/${id}/availability` }).then((data) => {
      console.log(data);
      setProperty(data);
      setBlockedDates(data.blockedDates || []);
    });
  }, [id]);

  const handlePropertyChange = (selected) => {
    console.log(selected);
    if (selected) navigate(`/availability/${selected.value}/availability`);
  };

  const saveAvailability = async () => {
    console.log(property);
    await apiFetch({
      endpoint: `/availability/${id}/availability`,
      method: "POST",
      body: {
        availability: property.availability,
        customAvailability: property.customAvailability,
      },
    });
  };

  const addBlock = async (start, end) => {
    await apiFetch({
      endpoint: `/availability/${id}/block`,
      method: "POST",
      body: { start, end, reason: "maintenance" },
    });
    setBlockedDates((prev) => [...prev, { start, end, reason: "maintenance" }]);
  };

  const removeBlock = async (dateStr) => {
    await apiFetch({
      endpoint: `/availability/${id}/block`,
      method: "DELETE",
      body: { date: dateStr },
    });
    setBlockedDates((prev) =>
      prev.filter(({ start, end }) => {
        const s = new Date(start);
        const e = new Date(end);
        const d = new Date(dateStr);
        return d < s || d > e;
      })
    );
  };

  const propertyOptions = properties.map((p) => ({
    value: p._id,
    label: p.title,
  }));

  const selectedOption = propertyOptions.find((o) => o.value === id) || null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Manage Availability</h1>
        <div className="w-full sm:w-72">
          <Select
            options={propertyOptions}
            value={selectedOption}
            onChange={handlePropertyChange}
            placeholder="Select a property..."
            isSearchable
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: "0.5rem",
                borderColor: state.isFocused ? "#1A1A1A" : "#e5e7eb",
                boxShadow: state.isFocused ? "0 0 0 2px #1A1A1A" : "none",
                "&:hover": { borderColor: "#1A1A1A" },
                fontFamily: "Barlow, sans-serif",
                fontSize: "14px",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#1A1A1A"
                  : state.isFocused
                  ? "#f0f0f0"
                  : "white",
                color: state.isSelected ? "white" : "#1A1A1A",
                fontFamily: "Barlow, sans-serif",
                fontSize: "14px",
              }),
              placeholder: (base) => ({ ...base, color: "#9ca3af" }),
            }}
          />
        </div>
      </div>

      {!id ? (
        <div className="bg-white p-12 rounded-xl shadow text-center text-gray-400">
          Select a property above to manage its availability.
        </div>
      ) : (
        <>
          {/* Default Rules */}
          <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Default Availability</h2>
            <select
              value={property?.availability}
              onChange={(e) =>
                setProperty((p) => ({ ...p, availability: e.target.value }))
              }
              className="w-full p-3 border rounded-lg"
            >
              <option value="all">Available every day</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
              <option value="custom">Custom schedule</option>
            </select>
            <Button onClick={saveAvailability} className="mt-4">
              Save
            </Button>
          </div>

          {/* Calendar */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Blocked Dates</h2>
            <AvailabilityCalendar
              blockedDates={blockedDates}
              bookedDates={property?.bookedDates || []}
              onBlock={(start, end) => addBlock(start, end)}
              onUnblock={(dateStr) => removeBlock(dateStr)}
              monthsToShow={12}
            />
          </div>

          {/* External Calendar Sync */}
          <div className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Sync External Calendar
            </h2>
            <input
              type="text"
              placeholder="Paste iCal URL (Google Calendar, Outlook, etc.)"
              className="w-full p-3 border rounded-lg"
              onChange={(e) =>
                setProperty((p) => ({ ...p, icalUrl: e.target.value }))
              }
            />
            <Button className="mt-4" onClick={() => alert("iCal sync enabled")}>
              Connect Calendar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyAvailability;
