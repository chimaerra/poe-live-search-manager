import { ipcMain } from "electron";
import { ipcEvents } from "../../resources/IPCEvents/IPCEvents";
import * as WebSocketActions from "../WebSockets/Actions/Actions";
import { globalStore } from "../../GlobalStore/GlobalStore";

const connectToStoredWebSockets = () => {
  const storedWsConnections = globalStore.get("wsConnections", []);

  storedWsConnections.forEach(connectionDetails => {
    WebSocketActions.connectToNewWebSocket(connectionDetails);
  });
};

const disconnectFromStoredWebSockets = () => {
  const storedWsConnections = globalStore.get("wsConnections", []);

  storedWsConnections.forEach(connectionDetails => {
    WebSocketActions.disconnectFromWebSocket(connectionDetails);
  });
};

const setupIpcEvents = () => {
  ipcMain.on(ipcEvents.WS_CONNECT, (event, connectionDetails) => {
    WebSocketActions.connectToNewWebSocket(connectionDetails);
  });

  ipcMain.on(ipcEvents.WS_DISCONNECT, (event, connectionDetails) => {
    WebSocketActions.disconnectFromWebSocket(connectionDetails);
  });

  ipcMain.on(ipcEvents.USER_LOGIN, () => {
    connectToStoredWebSockets();
  });

  ipcMain.on(ipcEvents.USER_LOGOUT, () => {
    disconnectFromStoredWebSockets();
  });
};

const initializeProject = () => {
  setupIpcEvents();
};

export default initializeProject;
