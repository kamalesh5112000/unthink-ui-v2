import React, { useState } from "react";
import { createPortal } from "react-dom";
import GuestPopUp from "../../Auth/GuestPopUp";

// Contact capture only: reuse the kiosk popup without its registration wrapper.
const CustomerShareModal = ({ context, onClose }) => {
  const [contacts, setContacts] = useState({ email: "", phone: "" });
  const [errors, setErrors] = useState({ email: "", phone: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setContacts((current) => ({ ...current, [name]: value }));
    setErrors({ email: "", phone: "" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const email = contacts.email.trim();
    const phone = contacts.phone.trim();
    const nextErrors = { email: "", phone: "" };
    if (!email && !phone) nextErrors.email = "Email or phone number is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid email address";
    const digits = phone.replace(/\D/g, "");
    if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
      nextErrors.phone = "Please enter a valid phone number";
    }
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.phone) return;
    setContacts({ email, phone });
    onClose();
  };

  if (!context || typeof document === "undefined") return null;

  return createPortal(
    <GuestPopUp
      guestData={contacts}
      errors={errors}
      guestChange={handleChange}
      handleGuestSubmit={handleSubmit}
      onClose={onClose}
      showSkip={false}
      overlayStyle={{ zIndex: 1100 }}
    />,
    document.body,
  );
};

export default CustomerShareModal;
