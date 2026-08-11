import React from "react";

export default function ModalContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-[100%] flex justify-center items-center fixed inset-0 bg-black/30 z-50 backdrop-blur-md">
      {children}
    </div>
  );
}
