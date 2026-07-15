import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "../components/ui/ConfirmModal";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel",
    icon: "alert-circle-outline",
    iconColor: "#EF4444",
    confirmButtonStyle: "bg-red-500",
    options: null,
  });

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showConfirm = useCallback((options) => {
    setModalState({
      isVisible: true,
      title: options.title || "",
      message: options.message || "",
      onConfirm: () => {
        if (options.onConfirm) options.onConfirm();
        hideModal();
      },
      onCancel: () => {
        if (options.onCancel) options.onCancel();
        hideModal();
      },
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText !== undefined ? options.cancelText : "Cancel",
      icon: options.icon || "alert-circle-outline",
      iconColor: options.iconColor || "#EF4444",
      confirmButtonStyle: options.confirmButtonStyle || "bg-red-500",
      options:
        options.options?.map((option) => ({
          ...option,
          onPress: () => {
            if (option.onPress) option.onPress();
            hideModal();
          },
        })) || null,
    });
  }, [hideModal]);

  const showAlert = useCallback((title, message) => {
    showConfirm({
      title,
      message,
      confirmText: "OK",
      cancelText: null, // Hide cancel button
      icon: "information-circle-outline",
      iconColor: "#3B82F6", // Blue color for generic info
      confirmButtonStyle: "bg-blue-500",
    });
  }, [showConfirm]);

  return (
    <ModalContext.Provider value={{ showConfirm, showAlert, hideModal }}>
      {children}
      <ConfirmModal
        isVisible={modalState.isVisible}
        onClose={modalState.onCancel}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        icon={modalState.icon}
        iconColor={modalState.iconColor}
        confirmButtonStyle={modalState.confirmButtonStyle}
        options={modalState.options}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
