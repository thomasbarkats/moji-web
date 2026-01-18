export const FloatingButtonsContainer = ({ children }) => {
  return (
    <div className="fixed bottom-4 right-6 z-50 flex flex-col-reverse gap-2 items-end">
      {children}
    </div>
  );
};
