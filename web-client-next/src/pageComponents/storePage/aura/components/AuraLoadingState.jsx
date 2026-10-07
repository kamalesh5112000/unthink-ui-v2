import React from "react";

const AuraLoadingState = ({ show = false }) => {
  if (!show) return null;

  return (
    <>
      <p className="mt-4 text-center font-medium text-lg lg:text-2xl text-black mb-3 lg:mb-5">
        Finding the Perfect Accessories for your Look
        <span
          className="ml-2 inline-flex items-center gap-1.5 align-middle text-accent"
          aria-hidden="true"
        >
          <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.32s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.16s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
        </span>
      </p>
    </>
  );
};

export default AuraLoadingState;
