import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, type PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import projectReducer from "./slices/projectSlice";
import documentEditorReducer from "./slices/documentEditorSlice";
import { queryClient } from "../config/queryClient";


const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: ["isInitialized"],
};

const appReducer = combineReducers({

  auth: persistReducer(authPersistConfig, authReducer),
  ui: uiReducer,
  project: projectReducer,
  documentEditor: documentEditorReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logout") {
    // Return undefined to reset all slices to their initial state
    state = undefined;
  }
  return appReducer(state, action);
};


const persistConfig: PersistConfig<ReturnType<typeof appReducer>> = {
  key: "root",
  storage,
  whitelist: ["ui", "project", "documentEditor"], // Auth is handled separately now
};

const persistedReducer = persistReducer(persistConfig, rootReducer);



export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat((_: any) => (next: any) => (action: any) => {
      if (action.type === "auth/logout") {

        queryClient.clear();
        persistor.purge();
      }
      return next(action);
    }),


});


export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
