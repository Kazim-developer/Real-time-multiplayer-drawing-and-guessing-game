import { create } from "zustand";

const storeFunc = (set: any) => ({
  showWordSelectionModal: false,

  setShowWordSelectionModal: (value: boolean) =>
    set({ showWordSelectionModal: value }),
});

const useShowElementStore = create(storeFunc);

export default useShowElementStore;
