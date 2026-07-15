import { create } from "zustand";

const useSceneStore = create((set, get) => ({
  sceneId: null,
  objects: [],
  selectedObjectId: null,
  trace: [],
  loading: false,
  error: null,

  setScene: (scene, objects) => set({ sceneId: scene._id, objects }),

  upsertObject: (obj) =>
    set((state) => {
      const idx = state.objects.findIndex((o) => o.objectId === obj.objectId);
      if (idx === -1) return { objects: [...state.objects, obj] };
      const next = [...state.objects];
      next[idx] = obj;
      return { objects: next };
    }),

  removeObject: (objectId) =>
    set((state) => ({
      objects: state.objects.filter((o) => o.objectId !== objectId),
      selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId,
    })),

  selectObject: (objectId) => set({ selectedObjectId: objectId }),
  clearSelection: () => set({ selectedObjectId: null }),

  setTrace: (trace) => set({ trace }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  reset: () => set({ objects: [], selectedObjectId: null, trace: [] }),
}));

export default useSceneStore;
