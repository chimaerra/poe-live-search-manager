import { ipcMain } from "electron";
import { globalStore } from "../../GlobalStore/GlobalStore";
import { ipcEvents } from "../../resources/IPCEvents/IPCEvents";
import { storeKeys } from "../../resources/StoreKeys/StoreKeys";
import * as storeUtils from "../../utils/StoreUtils/StoreUtils";
import * as electronUtils from "../utils/electron-utils/electron-utils";
import * as webSocketActions from "../web-sockets/actions";
import * as subscriptionActions from "../../Subscription/Actions";
import store from "../web-sockets/store";

const setupStoreIpcListeners = () => {
  ipcMain.on(ipcEvents.GET_SOCKETS, event => {
    const sanitizedStore = store
      .all()
      .map(({ socket, ...remainingSocketDetails }) => remainingSocketDetails);

    event.sender.send(ipcEvents.SEND_SOCKETS, sanitizedStore);
  });
};

const setupWebSocketIpcListeners = () => {
  ipcMain.on(ipcEvents.WS_ADD, (event, connectionDetails) => {
    store.add(connectionDetails);

    globalStore.set(storeKeys.WS_CONNECTIONS, store.sanitized());

    const isLoggedIn = globalStore.get(storeKeys.IS_LOGGED_IN, false);

    if (isLoggedIn) {
      webSocketActions.updateConnections();
    }
  });

  ipcMain.on(ipcEvents.WS_REMOVE, (event, connectionDetails) => {
    const isLoggedIn = globalStore.get(storeKeys.IS_LOGGED_IN, false);

    if (isLoggedIn) {
      webSocketActions.disconnect(connectionDetails.id);
    }

    store.remove(connectionDetails.id);

    globalStore.set(storeKeys.WS_CONNECTIONS, store.sanitized());
  });

  ipcMain.on(ipcEvents.RECONNECT_SOCKET, (event, connectionDetails) => {
    webSocketActions.reconnect(connectionDetails.id);
  });

  ipcMain.on(ipcEvents.RECONNECT_ALL, () => {
    webSocketActions.reconnectAll();
  });
};

const setupAuthenticationIpcListeners = () => {
  ipcMain.on(ipcEvents.USER_LOGIN, (event, id) => {
    subscriptionActions.startRefreshInterval(id);
  });

  ipcMain.on(ipcEvents.USER_LOGOUT, () => {
    subscriptionActions.stopRefreshInterval();

    webSocketActions.disconnectFromStoredWebSockets();

    storeUtils.deleteIfExists(storeKeys.POE_SESSION_ID);
  });
};

const setupGeneralIpcListeners = () => {
  ipcMain.on(ipcEvents.TEST_NOTIFICATION, () => {
    electronUtils.doNotify({
      title: "Title",
      body: "Description",
    });
  });
};

const loadLocallySavedWsConnectionsIntoStore = () => {
  /* The store must be emptied beforehand, otherwise FE hot-reload causes dudplicated items. */
  store.clear();

  const locallySavedWsConnections = globalStore.get(
    storeKeys.WS_CONNECTIONS,
    []
  );

  locallySavedWsConnections.forEach(connectionDetails => {
    store.add(connectionDetails);
  });
};

const initializeProject = () => {
  loadLocallySavedWsConnectionsIntoStore();

  setupStoreIpcListeners();

  setupWebSocketIpcListeners();

  setupAuthenticationIpcListeners();

  setupGeneralIpcListeners();
};

export default initializeProject;
