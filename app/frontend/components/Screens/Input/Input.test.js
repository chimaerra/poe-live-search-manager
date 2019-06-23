import React from "react";
import { shallow } from "enzyme";
import { ipcRenderer } from "electron";
import Input from "./Input";
import { ipcEvents } from "../../../../resources/IPCEvents/IPCEvents";
import { globalStore } from "../../../../GlobalStore/GlobalStore";
import * as UniqueIdGenerator from "../../../../utils/UniqueIdGenerator/UniqueIdGenerator";

describe("<Input />", () => {
  let inputWrapper;

  beforeEach(() => {
    globalStore.clear();

    inputWrapper = shallow(<Input />);
  });

  describe("addNewConnection", () => {
    describe("when the given URL is invalid", () => {
      const wsConnectionData = {
        name: "Test item",
        searchUrl: "https://invalid-uri.com"
      };

      it("rejects", () => {
        return expect(
          inputWrapper.instance().addNewConnection(wsConnectionData)
        ).rejects.toEqual(undefined);
      });
    });

    describe("when the given URL is valid", () => {
      let uniqueIdGeneratorSpy;

      const id = "54dxtv";

      const wsConnectionData = {
        name: "Test item",
        searchUrl: "https://www.pathofexile.com/trade/search/Legion/NK6Ec5/live"
      };

      beforeEach(() => {
        uniqueIdGeneratorSpy = jest
          .spyOn(UniqueIdGenerator, "uniqueIdGenerator")
          .mockReturnValueOnce(id);
      });

      it("generates a unique ID", () => {
        inputWrapper.instance().addNewConnection(wsConnectionData);

        expect(uniqueIdGeneratorSpy).toHaveBeenCalled();
      });

      it("adds the new connection to the state", () => {
        const expectedStateConnections = [
          {
            id,
            ...wsConnectionData
          }
        ];

        inputWrapper.instance().addNewConnection(wsConnectionData);

        expect(inputWrapper.state("wsConnections")).toEqual(
          expectedStateConnections
        );
      });

      it("sends the connection details to the BE", () => {
        const expectedValue = {
          id,
          ...wsConnectionData
        };

        inputWrapper.instance().addNewConnection(wsConnectionData);

        expect(ipcRenderer.send).toHaveBeenCalledWith(ipcEvents.WS_ADD, {
          ...expectedValue
        });
      });

      it("resolves", () => {
        return expect(
          inputWrapper.instance().addNewConnection(wsConnectionData)
        ).resolves.toEqual(undefined);
      });
    });
  });
});
